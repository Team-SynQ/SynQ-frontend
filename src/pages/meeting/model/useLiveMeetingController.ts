import { useCallback, useEffect, useRef, useState } from 'react'

import {
  liveMeetingSnapshotGateway,
  meetingAiMockGateway,
  meetingConnectionGateway,
  meetingLifecycleApi,
  meetingRecordGateway,
  type CompletedMeeting,
  type LiveMeeting,
  type LiveMeetingAiPinnedContext,
  type LiveMeetingProjectContext,
  type LiveMeetingTranscriptHint,
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
import { USE_REAL_MEETING_API } from '../../../shared/api/lib/apiClient'
import { transcriptService } from '../../../shared/api/services/transcript.service'
import { useLiveTranscription } from './useLiveTranscription'
import { useMeetingRuntime } from './useMeetingRuntime'

const INTERIM_SEGMENT_ID = 'interim'

type ReadyController = {
  status: 'ready'
  meeting: LiveMeeting
  meetingTitle: string
  elapsedSeconds: number
  recordingState: 'recording' | 'paused'
  connectionState: 'connecting' | 'connected' | 'reconnecting'
  connectionNotice: 'unstable' | 'restored' | null
  role: 'host' | 'participant'
  transcript: TranscriptPanelProps
  aiChat: AiChatContentProps
  aiChatDisplayMode: AiChatDisplayMode
  setMeetingTitle: (title: string) => void
  toggleRecording: () => void
  completeMeeting: (context: LiveMeetingProjectContext) => Promise<CompletedMeeting>
  changeAiChatDisplayMode: (mode: AiChatDisplayMode) => void
}

type LiveMeetingController =
  { status: 'loading' } | { status: 'error'; message: string } | ReadyController

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function getErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null
  return typeof error.code === 'string' ? error.code : null
}

export function useLiveMeetingController(meetingId: string): LiveMeetingController {
  const [meeting, setMeeting] = useState<LiveMeeting | null>(null)
  const [loadError, setLoadError] = useState<{ meetingId: string; message: string } | null>(null)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [role, setRole] = useState<'host' | 'participant'>('host')
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [meetingStartedAt, setMeetingStartedAt] = useState<string | null>(null)
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
  const [hintState, setHintState] = useState<TranscriptHintState>({ status: 'idle' })
  const [editState, setEditState] = useState<TranscriptEditState>({ status: 'idle' })
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [pinnedContext, setPinnedContext] = useState<LiveMeetingAiPinnedContext | null>(null)
  const [aiChatDisplayMode, setAiChatDisplayMode] = useState<AiChatDisplayMode>('docked')
  const hintCacheRef = useRef(new Map<string, LiveMeetingTranscriptHint>())
  const hintRequestSequenceRef = useRef(0)
  const composerInputRef = useRef<HTMLInputElement>(null)
  const lastExpandedAiChatModeRef = useRef<Exclude<AiChatDisplayMode, 'launcher'>>('docked')
  const meetingSessionRef = useRef({ meetingId, sequence: 0 })
  const endedMeetingRef = useRef<{
    meetingId: string
    endedAt: string
  } | null>(null)
  const [channelStatus, setChannelStatus] = useState<TranscriptionChannelStatus>('connecting')
  // 진행자만 전송 채널을 쓴다. 끊긴 채널은 연결 복구 중과 같은 규칙으로 다룬다.
  const isChannelDegraded =
    USE_REAL_MEETING_API &&
    role === 'host' &&
    (channelStatus === 'error' || channelStatus === 'closed')
  const runtime = useMeetingRuntime({
    enabled: meeting?.meetingId === meetingId,
    meetingId,
    restoreConnection: meetingConnectionGateway.restoreConnection,
    channelDegraded: isChannelDegraded,
  })
  const apiMeetingId = Number(meetingId)
  const hasValidMeetingId = Number.isSafeInteger(apiMeetingId) && apiMeetingId > 0
  const liveTranscription = useLiveTranscription({
    enabled: USE_REAL_MEETING_API && hasValidMeetingId && meeting?.meetingId === meetingId,
    meetingId: apiMeetingId,
    role,
    wsUrl,
    isRecording: runtime.recordingState === 'recording',
    channelStatus,
    onChannelStatusChange: setChannelStatus,
    editingSegmentId: editState.status === 'editing' ? editState.transcriptId : null,
  })

  const isCurrentMeetingSession = useCallback(
    (requestMeetingId: string, requestSequence: number) =>
      meetingSessionRef.current.meetingId === requestMeetingId &&
      meetingSessionRef.current.sequence === requestSequence,
    [],
  )

  useEffect(() => {
    let active = true
    const requestSessionSequence = meetingSessionRef.current.sequence + 1
    meetingSessionRef.current = { meetingId, sequence: requestSessionSequence }

    hintRequestSequenceRef.current += 1

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
        setMeeting({
          ...response,
          participants: response.participants.map((participant) =>
            participant.isCurrentUser ? { ...participant, isHost: joinedAsHost } : participant,
          ),
        })
        setLoadError(null)
        setMeetingTitle(joinResponse.title)
        setRole(joinedAsHost ? 'host' : 'participant')
        setWsUrl(joinResponse.wsUrl ?? null)
        setMeetingStartedAt(joinResponse.startedAt ?? null)
        setSelectedSegmentId(null)
        setHintState({ status: 'idle' })
        setEditState({ status: 'idle' })
        setPinnedContext(null)
        setDraft('')
        setIsSending(false)
        setSendError(null)
        setAiChatDisplayMode('docked')
        endedMeetingRef.current = null
        hintCacheRef.current.clear()
        setMessages(
          response.aiChat.messages.map(({ id, role, content }) => ({
            id,
            role,
            content,
          })),
        )
      })
      .catch((error: unknown) => {
        if (!active || !isCurrentMeetingSession(meetingId, requestSessionSequence)) return
        setLoadError({
          meetingId,
          message: getErrorMessage(error, '회의 정보를 불러오지 못했습니다.'),
        })
      })

    return () => {
      active = false
    }
  }, [apiMeetingId, hasValidMeetingId, isCurrentMeetingSession, meetingId])

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
        const hint = await meetingAiMockGateway.getTranscriptHint({ meetingId, transcriptId })
        if (
          requestSequence !== hintRequestSequenceRef.current ||
          !isCurrentMeetingSession(requestMeetingId, requestSessionSequence)
        ) {
          return
        }

        hintCacheRef.current.set(transcriptId, hint)
        setHintState({ status: 'ready', transcriptId, hint })
      } catch (error) {
        if (
          requestSequence !== hintRequestSequenceRef.current ||
          !isCurrentMeetingSession(requestMeetingId, requestSessionSequence)
        ) {
          return
        }

        if (getErrorCode(error) === 'TRANSCRIPT_HINT_NOT_FOUND') {
          setHintState({ status: 'idle' })
          return
        }
        setHintState({
          status: 'error',
          transcriptId,
          message: getErrorMessage(error, 'SynQ 힌트를 불러오지 못했습니다.'),
        })
      }
    },
    [isCurrentMeetingSession, meetingId],
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

  // 실제 연동에서는 전사를 WebSocket·조회 API에서 받는다. mock 스냅샷은 참여자·AI 채팅에만 쓴다.
  const interimSegment =
    USE_REAL_MEETING_API && liveTranscription.interimText
      ? [
          {
            id: INTERIM_SEGMENT_ID,
            sequenceIndex: Number.MAX_SAFE_INTEGER,
            startedAtSeconds: runtime.activeSeconds,
            text: liveTranscription.interimText,
            isEdited: false,
            editedAt: null,
            isInterim: true,
          },
        ]
      : []
  const displaySegments: TranscriptSegment[] = USE_REAL_MEETING_API
    ? [...liveTranscription.segments, ...interimSegment]
    : meeting.transcript.segments
  const isTranscriptWaiting = USE_REAL_MEETING_API
    ? displaySegments.length === 0
    : meeting.transcript.status === 'waiting'
  const isSpeaking =
    runtime.canProgress &&
    (USE_REAL_MEETING_API ? interimSegment.length > 0 : meeting.transcript.isSpeaking)

  const selectSegment = (segmentId: string) => {
    if (editState.status === 'editing') return

    setSelectedSegmentId(segmentId)
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
      if (USE_REAL_MEETING_API) {
        await transcriptService.updateSegment(
          apiMeetingId,
          Number(savingState.transcriptId),
          savingState.draftText,
        )
      }
      const updated = USE_REAL_MEETING_API
        ? null
        : await liveMeetingSnapshotGateway.updateTranscript({
            meetingId,
            segmentId: savingState.transcriptId,
            text: savingState.draftText,
          })
      if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return
      hintCacheRef.current.delete(savingState.transcriptId)
      hintRequestSequenceRef.current += 1
      setHintState((current) =>
        current.status !== 'idle' && current.transcriptId === savingState.transcriptId
          ? { status: 'idle' }
          : current,
      )
      if (updated) {
        setMeeting((current) =>
          current?.meetingId === requestMeetingId
            ? {
                ...current,
                transcript: {
                  ...current.transcript,
                  segments: current.transcript.segments.map((segment) =>
                    segment.id === updated.id ? updated : segment,
                  ),
                },
              }
            : current,
        )
      } else {
        liveTranscription.applyEdit(savingState.transcriptId, savingState.draftText)
      }
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
      const response = await meetingAiMockGateway.sendMeetingAiQuestion({
        meetingId,
        question,
        context: pinnedContext,
      })
      if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return
      setMessages((current) => [
        ...current,
        {
          id: `user-${response.id}`,
          role: 'user',
          content: question,
        },
        {
          id: response.id,
          role: response.role,
          content: response.content,
        },
      ])
      setDraft('')
    } catch {
      if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return
      setSendError('AI 답변을 불러오지 못했습니다. 다시 시도해 주세요.')
    } finally {
      if (isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) {
        setIsSending(false)
      }
    }
  }

  const changeAiChatDisplayMode = (mode: AiChatDisplayMode) => {
    setAiChatDisplayMode(mode)
    if (mode !== 'launcher') {
      lastExpandedAiChatModeRef.current = mode
    }
  }

  const completeMeeting = async (context: LiveMeetingProjectContext): Promise<CompletedMeeting> => {
    const host = meeting.participants.find((participant) => participant.isHost)
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
        avatarKey: host.avatarKey,
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
      onRefresh: () => {
        if (!runtime.canProgress) return
        // 실제 연동에서는 WebSocket과 폴링이 갱신을 담당하므로 mock 재조회를 하지 않는다.
        if (USE_REAL_MEETING_API) return
        const requestMeetingId = meetingId
        const requestSessionSequence = meetingSessionRef.current.sequence
        void liveMeetingSnapshotGateway
          .listTranscripts(meetingId)
          .then((segments) => {
            if (!isCurrentMeetingSession(requestMeetingId, requestSessionSequence)) return
            setMeeting((current) =>
              current?.meetingId === requestMeetingId
                ? {
                    ...current,
                    transcript: { ...current.transcript, segments },
                  }
                : current,
            )
          })
          .catch(() => {
            // Refresh는 기존 전사를 유지하며 다음 수동 재시도를 허용한다.
          })
      },
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
        const suggestion = meeting.aiChat.suggestions.find((item) => item.id === suggestionId)
        if (suggestion) {
          setDraft(suggestion.label)
          setSendError(null)
        }
      },
      onSend: () => void sendMessage(),
    },
    composerInputRef,
    model: {
      draft,
      isSending,
      sendError,
      messages,
      pinnedContext,
      suggestions: meeting.aiChat.suggestions,
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
    transcript,
    aiChat,
    aiChatDisplayMode,
    setMeetingTitle,
    toggleRecording: runtime.toggleRecording,
    completeMeeting,
    changeAiChatDisplayMode,
  }
}
