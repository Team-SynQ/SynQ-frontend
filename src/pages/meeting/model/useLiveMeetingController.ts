import { useCallback, useEffect, useRef, useState } from 'react'

import {
  liveMeetingSnapshotGateway,
  meetingAiChatApi,
  meetingConnectionGateway,
  meetingHintApi,
  meetingLifecycleApi,
  meetingParticipantApi,
  meetingRecordGateway,
  type CompletedMeeting,
  type LiveMeeting,
  type LiveMeetingAiChatSuggestion,
  type LiveMeetingAiPinnedContext,
  type LiveMeetingParticipant,
  type LiveMeetingProjectContext,
  type LiveMeetingTranscriptHint,
  type MeetingAiEvent,
  type TranscriptionChannelStatus,
} from '../../../entities/meeting'
import type {
  AiChatContentProps,
  AiChatDisplayMode,
  AiChatMessage,
} from '../../../features/meeting-ai-chat'
import type {
  TranscriptEditState,
  TranscriptHintState,
  TranscriptPanelProps,
  TranscriptSegment,
} from '../../../features/live-transcription'
import { meetingService } from '../../../shared/api/services/meeting.service'
import { transcriptService } from '../../../shared/api/services/transcript.service'
import { useMeetingAiEvents } from './useMeetingAiEvents'
import { useLiveTranscription } from './useLiveTranscription'
import { useMeetingRuntime } from './useMeetingRuntime'

const INTERIM_SEGMENT_ID = 'interim'
/** 프로젝트 화면의 진행 중 회의 폴링과 같은 주기를 쓴다. */
const PARTICIPANT_POLL_INTERVAL_MS = 15_000

type ReadyController = {
  status: 'ready'
  meeting: LiveMeeting
  meetingTitle: string
  elapsedSeconds: number
  recordingState: 'recording' | 'paused'
  connectionState: 'connecting' | 'connected' | 'reconnecting'
  connectionNotice: 'unstable' | 'restored' | null
  role: 'host' | 'participant'
  /** 서버가 회의 종료를 알린 상태. 참여자를 회의 화면에서 내보내야 한다. */
  endedByServer: boolean
  participants: LiveMeetingParticipant[]
  transcript: TranscriptPanelProps
  aiChat: AiChatContentProps
  aiChatDisplayMode: AiChatDisplayMode
  renameMeeting: (title: string) => Promise<void>
  /** 서버에 일시정지·재개를 요청한다. 실패는 호출자가 받아 안내한다. */
  toggleRecording: () => Promise<void>
  completeMeeting: (context: LiveMeetingProjectContext) => Promise<CompletedMeeting>
  changeAiChatDisplayMode: (mode: AiChatDisplayMode) => void
}

type LiveMeetingController =
  { status: 'loading' } | { status: 'error'; message: string } | ReadyController

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

/** 폴링 결과가 직전과 같은지 본다. 목록 순서가 곧 화면 표시 순서라 순서까지 함께 비교한다. */
function isSameParticipantList(
  current: readonly LiveMeetingParticipant[],
  next: readonly LiveMeetingParticipant[],
) {
  return (
    current.length === next.length &&
    current.every((participant, index) => {
      const candidate = next[index]
      return (
        participant.id === candidate.id &&
        participant.name === candidate.name &&
        participant.profileImageUrl === candidate.profileImageUrl &&
        participant.isCurrentUser === candidate.isCurrentUser &&
        participant.isHost === candidate.isHost
      )
    })
  )
}

export function useLiveMeetingController(
  meetingId: string,
  currentUserId: number | null,
): LiveMeetingController {
  const [meeting, setMeeting] = useState<LiveMeeting | null>(null)
  const [loadError, setLoadError] = useState<{ meetingId: string; message: string } | null>(null)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [role, setRole] = useState<'host' | 'participant'>('host')
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [meetingStartedAt, setMeetingStartedAt] = useState<string | null>(null)
  /** 입장 응답이 알려 준 서버 기준 시간·일시정지 상태. 아직 입장 전이면 null이다. */
  const [joinedRuntime, setJoinedRuntime] = useState<{
    paused: boolean
    activeSeconds: number
  } | null>(null)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
  const [hintState, setHintState] = useState<TranscriptHintState>({ status: 'idle' })
  const [editState, setEditState] = useState<TranscriptEditState>({ status: 'idle' })
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [pinnedContext, setPinnedContext] = useState<LiveMeetingAiPinnedContext | null>(null)
  const [aiChatDisplayMode, setAiChatDisplayMode] = useState<AiChatDisplayMode>('docked')
  const [suggestions, setSuggestions] = useState<LiveMeetingAiChatSuggestion[]>([])
  const [participants, setParticipants] = useState<LiveMeetingParticipant[]>([])
  const [isChatLoading, setIsChatLoading] = useState(true)
  const [chatLoadError, setChatLoadError] = useState<string | null>(null)
  /** 서버가 생성 중이라고 답한 뒤 최종 답변을 아직 못 받은 상태. */
  const [isAnswerPending, setIsAnswerPending] = useState(false)
  const hintCacheRef = useRef(new Map<string, LiveMeetingTranscriptHint>())
  /** 힌트가 있는 전사. 캐시는 ref라 화면을 다시 그리지 못해 표시용 상태를 따로 둔다. */
  const [hintedTranscriptIds, setHintedTranscriptIds] = useState<ReadonlySet<string>>(new Set())
  const hintRequestSequenceRef = useRef(0)
  /** 입장 시점 조회와 폴링이 같은 목록을 놓고 경쟁한다. 늦게 온 응답이 최신을 덮지 않도록 함께 센다. */
  const participantRequestSequenceRef = useRef(0)
  const composerInputRef = useRef<HTMLInputElement>(null)
  const lastExpandedAiChatModeRef = useRef<Exclude<AiChatDisplayMode, 'launcher'>>('docked')
  const meetingSessionRef = useRef({ meetingId, sequence: 0 })
  const endedMeetingRef = useRef<{
    meetingId: string
    endedAt: string
  } | null>(null)
  const [channelStatus, setChannelStatus] = useState<TranscriptionChannelStatus>('connecting')
  /**
   * 서버가 회의 종료를 알렸을 때 true. 참여자에게만 의미가 있다.
   * 진행자는 자기 종료·저장 흐름을 타고 있고, 정상 종료 때도 같은 메시지가 오기 때문이다.
   */
  const [endedByServer, setEndedByServer] = useState(false)
  // 끊긴 채널은 진행자·참여자 모두에게 연결 복구 중과 같은 상황이다. 회의가 끝난 뒤에는 알리지 않는다.
  const isChannelDegraded =
    !endedByServer && (channelStatus === 'error' || channelStatus === 'closed')
  /** 입장 응답이 도착해 이 회의의 화면이 실제로 뜬 상태. */
  const isJoinedMeeting = meeting?.meetingId === meetingId
  const runtime = useMeetingRuntime({
    // 종료된 회의는 경과 시간을 더 셀 것도, 저장할 것도 없다. 참여자가 종료 안내를 확인하는 동안에도 멈춰 있어야 한다.
    enabled: isJoinedMeeting && !endedByServer,
    meetingId,
    restoreConnection: meetingConnectionGateway.restoreConnection,
    channelDegraded: isChannelDegraded,
    serverActiveSeconds: joinedRuntime?.activeSeconds ?? null,
    serverPaused: joinedRuntime?.paused ?? false,
  })
  const apiMeetingId = Number(meetingId)
  const hasValidMeetingId = Number.isSafeInteger(apiMeetingId) && apiMeetingId > 0
  const handleMeetingEnded = useCallback(() => {
    // 정상 종료 때도 같은 메시지가 온다. 진행자는 이미 자기 종료·저장 흐름을 타고 있으므로 무시한다.
    if (role === 'host') return
    setEndedByServer(true)
  }, [role])

  /**
   * 진행자가 회의를 멈추거나 다시 시작했다.
   * 진행자는 자기 요청의 응답으로 이미 맞췄으므로 무시한다. 종료 알림과 같은 이유다.
   */
  const syncPauseState = runtime.syncPauseState
  const handlePauseStateChange = useCallback(
    (paused: boolean, activeSeconds: number) => {
      if (role === 'host') return
      syncPauseState(paused, activeSeconds)
    },
    [role, syncPauseState],
  )

  const rememberHint = useCallback((hint: LiveMeetingTranscriptHint) => {
    hintCacheRef.current.set(hint.transcriptId, hint)
    setHintedTranscriptIds((current) =>
      current.has(hint.transcriptId) ? current : new Set(current).add(hint.transcriptId),
    )
  }, [])

  const forgetHint = useCallback((transcriptId: string) => {
    hintCacheRef.current.delete(transcriptId)
    setHintedTranscriptIds((current) => {
      if (!current.has(transcriptId)) return current

      const next = new Set(current)
      next.delete(transcriptId)
      return next
    })
  }, [])

  const handleAiEvent = useCallback(
    (event: MeetingAiEvent) => {
      if (event.kind !== 'autoHint') return
      rememberHint(event.hint)
    },
    [rememberHint],
  )
  const liveTranscription = useLiveTranscription({
    // 종료된 회의에는 다시 붙지 않는다. enabled가 false면 재연결 타이머도 서지 않는다.
    enabled: hasValidMeetingId && isJoinedMeeting && !endedByServer,
    meetingId: apiMeetingId,
    role,
    wsUrl,
    isRecording: runtime.recordingState === 'recording',
    channelStatus,
    onChannelStatusChange: setChannelStatus,
    onMeetingEnded: handleMeetingEnded,
    onPauseStateChange: handlePauseStateChange,
    editingSegmentId: editState.status === 'editing' ? editState.transcriptId : null,
  })

  /**
   * 끊긴 동안 생성된 자동 힌트를 메운다. 서버에 재전송 저장소가 없어 기록 조회가 유일한 방법이다.
   * 최초 연결에서도 호출되어 입장 시 조회와 한 번 겹치지만, 조회 하나라 그대로 둔다.
   */
  const reloadHintRecords = useCallback(() => {
    void meetingHintApi
      .listHintRecords(apiMeetingId)
      .then((records) => {
        for (const record of records) rememberHint(record)
      })
      .catch(() => {})
  }, [apiMeetingId, rememberHint])

  useMeetingAiEvents({
    enabled: hasValidMeetingId && isJoinedMeeting && !endedByServer,
    meetingId: apiMeetingId,
    onEvent: handleAiEvent,
    onConnected: reloadHintRecords,
  })

  const isCurrentMeetingSession = useCallback(
    (requestMeetingId: string, requestSequence: number) =>
      meetingSessionRef.current.meetingId === requestMeetingId &&
      meetingSessionRef.current.sequence === requestSequence,
    [],
  )

  /**
   * 환영 문구·추천 질문과 기존 대화를 채운다. 응답이 몇 초 걸려 로딩 상태를 노출한다.
   * 실패해도 질문 전송은 막지 않고, 재시도 경로만 열어 둔다.
   */
  const loadAiChat = useCallback(
    async (requestSessionSequence: number, isActive: () => boolean) => {
      const requestMeetingId = meetingId
      // 이전 회의의 대화가 새 회의 화면에 남지 않도록, 조회를 시작하기 전에 비운다.
      // 입장 응답이 먼저 끝나면 화면은 이미 새 회의다.
      setMessages([])
      setSuggestions([])
      setIsAnswerPending(false)
      setIsChatLoading(true)
      setChatLoadError(null)

      try {
        const [welcome, history] = await Promise.all([
          meetingAiChatApi.loadWelcome(apiMeetingId),
          meetingAiChatApi.loadHistory(apiMeetingId),
        ])
        if (!isActive() || !isCurrentMeetingSession(requestMeetingId, requestSessionSequence))
          return

        setMessages([...welcome.messages, ...history])
        setSuggestions(welcome.suggestions)
      } catch (error) {
        if (!isActive() || !isCurrentMeetingSession(requestMeetingId, requestSessionSequence))
          return
        setChatLoadError(getErrorMessage(error, 'AI Chat을 불러오지 못했습니다.'))
      } finally {
        if (isActive() && isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) {
          setIsChatLoading(false)
        }
      }
    },
    [apiMeetingId, isCurrentMeetingSession, meetingId],
  )

  /**
   * 참여자 목록은 입장·스냅샷과 독립이다. 실패해도 회의 화면은 그대로 뜬다.
   * 이전 회의의 참여자가 남지 않도록 조회 전에 비운다.
   */
  const loadParticipants = useCallback(
    async (requestSessionSequence: number, isActive: () => boolean) => {
      const requestMeetingId = meetingId
      const requestSequence = ++participantRequestSequenceRef.current
      setParticipants([])

      try {
        const list = await meetingParticipantApi.listParticipants(apiMeetingId, currentUserId)
        if (
          !isActive() ||
          requestSequence !== participantRequestSequenceRef.current ||
          !isCurrentMeetingSession(requestMeetingId, requestSessionSequence)
        ) {
          return
        }
        setParticipants(list)
      } catch {
        // 참여자 목록이 없어도 회의 진행에는 지장이 없다.
      }
    },
    [apiMeetingId, currentUserId, isCurrentMeetingSession, meetingId],
  )

  useEffect(() => {
    let active = true
    const requestSessionSequence = meetingSessionRef.current.sequence + 1
    meetingSessionRef.current = { meetingId, sequence: requestSessionSequence }

    hintRequestSequenceRef.current += 1
    // 기록 조회와 입장 응답이 경쟁하므로, 캐시 비우기는 두 요청보다 먼저 끝내 둔다.
    hintCacheRef.current.clear()

    if (!hasValidMeetingId) {
      return () => {
        active = false
      }
    }

    void Promise.all([
      meetingLifecycleApi.joinMeeting(apiMeetingId),
      liveMeetingSnapshotGateway.getSnapshot(meetingId),
    ])
      .then(([joinResponse, response]) => {
        if (!active || !isCurrentMeetingSession(meetingId, requestSessionSequence)) return

        const joinedAsHost = joinResponse.role === 'HOST'
        setMeeting(response)
        setLoadError(null)
        setMeetingTitle(joinResponse.title)
        setRole(joinedAsHost ? 'host' : 'participant')
        setWsUrl(joinResponse.wsUrl ?? null)
        setMeetingStartedAt(joinResponse.startedAt ?? null)
        setJoinedRuntime({
          paused: joinResponse.paused,
          activeSeconds: joinResponse.activeSeconds,
        })
        setSelectedSegmentId(null)
        // 캐시는 이 effect 시작에서 이미 비웠다. 표시용 상태는 setState라 여기서 함께 맞춘다.
        setHintedTranscriptIds(new Set())
        setHintState({ status: 'idle' })
        setEditState({ status: 'idle' })
        setPinnedContext(null)
        setDraft('')
        setIsSending(false)
        setSendError(null)
        setAiChatDisplayMode('docked')
        setEndedByServer(false)
        endedMeetingRef.current = null

        // 서버는 입장 시점에 참여자를 기록한다. 입장보다 먼저 조회하면 본인이 빠진 목록을 받는다.
        void loadParticipants(requestSessionSequence, () => active)
      })
      .catch((error: unknown) => {
        if (!active || !isCurrentMeetingSession(meetingId, requestSessionSequence)) return
        setLoadError({
          meetingId,
          message: getErrorMessage(error, '회의 정보를 불러오지 못했습니다.'),
        })
      })

    // 이미 생성된 힌트를 캐시에 채운다. 새로고침 후 같은 전사를 눌러도 다시 생성하지 않는다.
    // 실패해도 화면을 막지 않는다. 선택 시점에 생성 요청이 다시 나간다.
    void meetingHintApi
      .listHintRecords(apiMeetingId)
      .then((records) => {
        if (!active || !isCurrentMeetingSession(meetingId, requestSessionSequence)) return
        for (const record of records) {
          rememberHint(record)
        }
      })
      .catch(() => {})

    void loadAiChat(requestSessionSequence, () => active)

    return () => {
      active = false
    }
  }, [
    apiMeetingId,
    hasValidMeetingId,
    isCurrentMeetingSession,
    loadAiChat,
    loadParticipants,
    meetingId,
    rememberHint,
  ])

  /**
   * 참여자는 회의 도중에도 들어오고 나간다. 서버에 입·퇴장 이벤트가 없어 주기적으로 다시 읽는다.
   * 입장 직후 조회는 위 effect가 이미 했으므로 여기서는 첫 주기부터 시작한다.
   * 종료된 회의는 더 볼 것이 없으므로 멈춘다.
   */
  useEffect(() => {
    if (!hasValidMeetingId || !isJoinedMeeting || endedByServer) return

    let isSubscribed = true

    const timerId = window.setInterval(() => {
      const requestSequence = ++participantRequestSequenceRef.current

      void meetingParticipantApi
        .listParticipants(apiMeetingId, currentUserId)
        .then((list) => {
          if (!isSubscribed || requestSequence !== participantRequestSequenceRef.current) return
          // 대부분의 주기는 결과가 같다. 그대로 담으면 15초마다 화면 전체가 다시 그려진다.
          setParticipants((current) => (isSameParticipantList(current, list) ? current : list))
        })
        .catch(() => {
          // 보조 정보다. 실패해도 회의 진행을 막지 않고 다음 주기에 다시 시도한다.
        })
    }, PARTICIPANT_POLL_INTERVAL_MS)

    return () => {
      isSubscribed = false
      window.clearInterval(timerId)
    }
  }, [apiMeetingId, currentUserId, endedByServer, hasValidMeetingId, isJoinedMeeting])

  const loadHint = useCallback(
    async (transcriptId: string, useCache: boolean) => {
      const requestMeetingId = meetingId
      const requestSessionSequence = meetingSessionRef.current.sequence
      const cachedHint = hintCacheRef.current.get(transcriptId)
      if (useCache && cachedHint) {
        setHintState({ status: 'ready', transcriptId, hint: cachedHint })
        return
      }

      const requestSequence = ++hintRequestSequenceRef.current
      setHintState({ status: 'loading', transcriptId })

      try {
        const hint = await meetingHintApi.createSegmentHint(apiMeetingId, transcriptId)
        if (
          requestSequence !== hintRequestSequenceRef.current ||
          !isCurrentMeetingSession(requestMeetingId, requestSessionSequence)
        ) {
          return
        }

        rememberHint(hint)
        setHintState({ status: 'ready', transcriptId, hint })
      } catch (error) {
        if (
          requestSequence !== hintRequestSequenceRef.current ||
          !isCurrentMeetingSession(requestMeetingId, requestSessionSequence)
        ) {
          return
        }

        setHintState({
          status: 'error',
          transcriptId,
          message: getErrorMessage(error, 'SynQ 힌트를 불러오지 못했습니다.'),
        })
      }
    },
    [apiMeetingId, isCurrentMeetingSession, meetingId, rememberHint],
  )

  if (!hasValidMeetingId) {
    return { status: 'error', message: '회의 정보를 확인할 수 없습니다.' }
  }
  if (loadError?.meetingId === meetingId) {
    return { status: 'error', message: loadError.message }
  }
  if (!meeting || meeting.meetingId !== meetingId) {
    return { status: 'loading' }
  }

  // 전사는 WebSocket·조회 API에서 받는다. mock 스냅샷은 참여자·AI 채팅에만 쓴다.
  const interimSegment = liveTranscription.interimText
    ? [
        {
          id: INTERIM_SEGMENT_ID,
          sequenceIndex: Number.MAX_SAFE_INTEGER,
          // 확정 세그먼트는 회의 시작 기준이고 activeSeconds는 일시정지를 제외한 누적 시간이라
          // 축이 다르다. 회의 시작 시각을 알면 수신 시각을 같은 축으로 환산한다.
          startedAtSeconds: meetingStartedAt
            ? Math.max(
                0,
                Math.round(
                  (liveTranscription.interimReceivedAt - new Date(meetingStartedAt).getTime()) /
                    1000,
                ),
              )
            : runtime.activeSeconds,
          text: liveTranscription.interimText,
          isEdited: false,
          editedAt: null,
          isInterim: true,
        },
      ]
    : []
  const displaySegments: TranscriptSegment[] = [
    ...liveTranscription.segments.map((segment) =>
      hintedTranscriptIds.has(segment.id) ? { ...segment, hasHint: true } : segment,
    ),
    ...interimSegment,
  ]
  const isTranscriptWaiting = displaySegments.length === 0
  const isSpeaking = runtime.canProgress && interimSegment.length > 0

  const selectSegment = (segmentId: string) => {
    if (editState.status === 'editing') return

    setSelectedSegmentId(segmentId)

    // 중간 인식 문장은 서버에 저장되기 전이라 힌트를 만들 수 없다. 선택만 허용한다.
    // 진행 중이던 다른 전사의 힌트 응답이 뒤늦게 도착해 열리지 않도록 순번도 올린다.
    if (segmentId === INTERIM_SEGMENT_ID) {
      hintRequestSequenceRef.current += 1
      setHintState({ status: 'idle' })
      return
    }

    void loadHint(segmentId, true)
  }

  const startEdit = (segmentId: string) => {
    const segment = displaySegments.find((candidate) => candidate.id === segmentId)
    if (!segment || segment.isInterim) return

    setEditState({
      status: 'editing',
      transcriptId: segmentId,
      originalText: segment.text,
      draftText: segment.text,
      errorMessage: null,
      isSaving: false,
    })
  }

  const saveEdit = async () => {
    if (editState.status !== 'editing' || editState.isSaving) return
    if (editState.draftText === editState.originalText || editState.draftText.trim().length === 0) {
      return
    }

    const savingState = { ...editState, errorMessage: null, isSaving: true }
    const requestMeetingId = meetingId
    const requestSessionSequence = meetingSessionRef.current.sequence
    setEditState(savingState)

    try {
      await transcriptService.updateSegment(
        apiMeetingId,
        Number(savingState.transcriptId),
        savingState.draftText,
      )
      if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return
      forgetHint(savingState.transcriptId)
      hintRequestSequenceRef.current += 1
      setHintState((current) =>
        current.status !== 'idle' && current.transcriptId === savingState.transcriptId
          ? { status: 'idle' }
          : current,
      )
      liveTranscription.applyEdit(savingState.transcriptId, savingState.draftText)
      setEditState({ status: 'idle' })
    } catch (error) {
      if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return
      setEditState({
        ...savingState,
        errorMessage: getErrorMessage(error, '전사 내용을 수정하지 못했습니다.'),
        isSaving: false,
      })
    }
  }

  const askAi = (segmentId: string) => {
    const segment = displaySegments.find((candidate) => candidate.id === segmentId)
    if (!segment || segment.isInterim) return

    setPinnedContext({ transcriptId: segment.id, text: segment.text })
    setDraft('')
    if (aiChatDisplayMode === 'launcher') {
      setAiChatDisplayMode(lastExpandedAiChatModeRef.current)
      window.setTimeout(() => composerInputRef.current?.focus(), 0)
      return
    }
    composerInputRef.current?.focus()
  }

  const sendMessage = async () => {
    const question = draft.trim()
    if (!question || isSending) return

    const requestMeetingId = meetingId
    const requestSessionSequence = meetingSessionRef.current.sequence
    setIsSending(true)
    setSendError(null)
    try {
      const response = await meetingAiChatApi.sendQuestion(
        apiMeetingId,
        question,
        pinnedContext?.transcriptId ?? null,
      )
      if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return
      setMessages((current) => [...current, ...response.messages])
      // 서버가 답변마다 후속 질문을 준다. 주지 않으면 기존 추천을 유지한다.
      if (response.suggestions) setSuggestions(response.suggestions)
      // 생성 중이면 답변이 아직 없다. 수신 경로는 AI 이벤트 연동에서 붙인다.
      setIsAnswerPending(response.isAnswerPending)
      setDraft('')
    } catch {
      if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return
      setIsAnswerPending(false)
      setSendError('AI 답변을 불러오지 못했습니다. 다시 시도해 주세요.')
    } finally {
      if (isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) {
        setIsSending(false)
      }
    }
  }

  /**
   * 제목은 서버에 저장된 뒤에만 화면에 반영한다.
   * 먼저 바꿔 두면 저장에 실패해도 바뀐 것처럼 보이고, 회의 기록에는 옛 제목이 남는다.
   */
  const renameMeeting = async (title: string) => {
    const requestMeetingId = meetingId
    const requestSessionSequence = meetingSessionRef.current.sequence

    const updated = await meetingService.updateMeetingTitle(apiMeetingId, title)
    if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return

    setMeetingTitle(updated.title)
  }

  /**
   * 일시정지·재개는 서버에 먼저 반영하고 응답의 activeSeconds로 맞춘다.
   * 로컬에서 먼저 바꾸면 요청이 실패했을 때 진행자와 참여자의 시간이 어긋난다.
   */
  const toggleRecording = async () => {
    const requestMeetingId = meetingId
    const requestSessionSequence = meetingSessionRef.current.sequence
    const shouldPause = runtime.recordingState === 'recording'

    const response = shouldPause
      ? await meetingLifecycleApi.pauseMeeting(apiMeetingId)
      : await meetingLifecycleApi.resumeMeeting(apiMeetingId)
    if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return

    runtime.syncPauseState(response.paused, response.activeSeconds)
  }

  const changeAiChatDisplayMode = (mode: AiChatDisplayMode) => {
    setAiChatDisplayMode(mode)
    if (mode !== 'launcher') {
      lastExpandedAiChatModeRef.current = mode
    }
  }

  const completeMeeting = async (context: LiveMeetingProjectContext): Promise<CompletedMeeting> => {
    /**
     * 화면은 참여자 조회를 기다리지 않고 뜬다. 들어오자마자 종료하거나 조회가 실패했다면
     * 목록이 비어 있어 진행자를 못 찾는다. 종료를 막지 않도록 이 시점에 한 번 더 확인한다.
     */
    let host = participants.find((participant) => participant.isHost)
    if (!host) {
      const list = await meetingParticipantApi
        .listParticipants(apiMeetingId, currentUserId)
        .catch(() => [])
      host = list.find((participant) => participant.isHost)
    }
    if (!host) {
      throw new Error('회의 진행자 정보를 찾을 수 없습니다.')
    }

    const activeDurationSeconds = runtime.freezeForEnd()
    let endedMeeting = endedMeetingRef.current
    if (!endedMeeting || endedMeeting.meetingId !== meeting.meetingId) {
      const response = await meetingLifecycleApi.endMeeting(Number(meeting.meetingId))
      endedMeeting = { meetingId: meeting.meetingId, endedAt: response.endedAt }
      endedMeetingRef.current = endedMeeting
    }

    const completedMeeting = await meetingRecordGateway.finalizeEndedMeeting({
      meetingId: meeting.meetingId,
      projectId: context.projectId,
      projectTitle: context.projectTitle,
      meetingTitle,
      activeDurationSeconds,
      endedAt: endedMeeting.endedAt,
      host: {
        id: host.id,
        name: host.name,
        // 회의 기록의 아바타는 아직 고정 키를 쓴다. 기록 화면이 프로필 이미지를 받으면 함께 정리한다.
        avatarKey: 'pm',
      },
    })
    runtime.clear()
    return completedMeeting
  }

  const transcript: TranscriptPanelProps = {
    actions: {
      onAskAi: askAi,
      onCancelEdit: () => setEditState({ status: 'idle' }),
      onCollapseHint: (transcriptId) => {
        if (hintState.status === 'idle' || hintState.transcriptId !== transcriptId) return
        hintRequestSequenceRef.current += 1
        setHintState({ status: 'idle' })
      },
      onEditDraftChange: (value) =>
        setEditState((current) =>
          current.status === 'editing'
            ? { ...current, draftText: value, errorMessage: null }
            : current,
        ),
      // 갱신은 WebSocket과 폴백 폴링이 담당하므로 수동 재조회 경로는 두지 않는다.
      onRefresh: () => {},
      onRetryHint: (transcriptId) => void loadHint(transcriptId, false),
      onSaveEdit: () => void saveEdit(),
      onSelectSegment: selectSegment,
      onStartEdit: startEdit,
    },
    state: isTranscriptWaiting
      ? { kind: 'waiting' }
      : {
          kind: 'active',
          editState,
          hintState,
          isSpeaking,
          meetingStartedAt,
          segments: displaySegments,
          selectedSegmentId,
        },
  }

  const aiChat: AiChatContentProps = {
    actions: {
      onClearContext: () => setPinnedContext(null),
      onDraftChange: (value) => {
        setDraft(value)
        setSendError(null)
      },
      onSelectSuggestion: (suggestionId) => {
        const suggestion = suggestions.find((item) => item.id === suggestionId)
        if (suggestion) {
          setDraft(suggestion.label)
          setSendError(null)
        }
      },
      onSend: () => void sendMessage(),
      onRetryLoad: () => void loadAiChat(meetingSessionRef.current.sequence, () => true),
    },
    composerInputRef,
    model: {
      draft,
      isSending,
      isLoading: isChatLoading,
      isAwaitingAnswer: isSending || isAnswerPending,
      loadError: chatLoadError,
      sendError,
      messages,
      pinnedContext,
      suggestions: suggestions,
    },
  }

  return {
    status: 'ready',
    meeting,
    meetingTitle,
    elapsedSeconds: runtime.activeSeconds,
    recordingState: runtime.recordingState,
    connectionState: runtime.connectionState,
    connectionNotice: runtime.connectionNotice,
    role,
    endedByServer,
    participants,
    transcript,
    aiChat,
    aiChatDisplayMode,
    renameMeeting,
    toggleRecording,
    completeMeeting,
    changeAiChatDisplayMode,
  }
}
