import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  meetingTranscriptionGateway,
  toTranscriptSegments,
  type TranscriptionChannel,
  type TranscriptionChannelStatus,
} from '../../../entities/meeting'
import {
  mergeTranscriptSegments,
  useMicrophoneCapture,
  useTranscriptPolling,
  type MicrophoneCaptureStatus,
  type TranscriptSegment,
} from '../../../features/live-transcription'
import { transcriptService } from '../../../shared/api/services/transcript.service'

type UseLiveTranscriptionOptions = {
  /** 실제 백엔드 연동이 켜져 있고 회의 정보가 준비됐을 때만 true. */
  enabled: boolean
  meetingId: number
  role: 'host' | 'participant'
  /** 입장 응답의 wsUrl. 서버가 절대 주소로 내려주므로 그대로 사용한다. */
  wsUrl?: string | null
  /** 사용자의 녹음 의도. 일시정지 중에는 false다. 진행자에게만 의미가 있다. */
  isRecording: boolean
  /**
   * 채널 상태는 호출자가 소유한다. 회의 런타임이 이 값을 연결 상태로 쓰기 때문에,
   * 여기서 상태를 들고 있으면 런타임과 서로를 참조하게 된다.
   */
  channelStatus: TranscriptionChannelStatus
  onChannelStatusChange: (status: TranscriptionChannelStatus) => void
  editingSegmentId?: string | null
}

type UseLiveTranscriptionResult = {
  segments: TranscriptSegment[]
  /** 확정 전 중간 인식. 서버가 진행자에게만 보낸다. */
  interimText: string
  microphoneStatus: MicrophoneCaptureStatus
  error: string | null
  applyEdit: (segmentId: string, text: string) => void
}

type TranscriptionState = {
  meetingId: number
  segments: TranscriptSegment[]
}

const EMPTY_SEGMENTS: TranscriptSegment[] = []
const RECONNECT_MAX_DELAY_MS = 10000

/**
 * 회의 전사를 실시간으로 받아 화면 목록으로 유지한다.
 *
 * 진행자와 참여자 모두 같은 wsUrl로 연결한다. 차이는 오디오 전송뿐이다.
 * - 진행자: 마이크를 캡처해 오디오를 보내고, 중간 인식과 확정 발화를 모두 받는다.
 * - 참여자: 연결만 열어두고 확정 발화만 받는다.
 *
 * WebSocket은 연결 시점 이후 구간만 주므로 초기 전사는 조회 API로 채우고,
 * 재연결 뒤에는 마지막으로 받은 sequenceIndex 이후만 다시 불러 놓친 구간을 메운다.
 */
export function useLiveTranscription({
  enabled,
  meetingId,
  role,
  wsUrl,
  isRecording,
  channelStatus,
  onChannelStatusChange,
  editingSegmentId = null,
}: UseLiveTranscriptionOptions): UseLiveTranscriptionResult {
  const isHost = role === 'host'
  const [state, setState] = useState<TranscriptionState>(() => ({
    meetingId,
    segments: EMPTY_SEGMENTS,
  }))
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<TranscriptionChannel | null>(null)
  const onChannelStatusChangeRef = useRef(onChannelStatusChange)
  const editingSegmentIdRef = useRef(editingSegmentId)
  /** 서버에서 마지막으로 받은 sequenceIndex. 재연결 후 보충 조회의 기준점이다. */
  const lastSequenceRef = useRef<number | null>(null)
  const hasConnectedRef = useRef(false)
  /** 값이 바뀔 때마다 연결 effect를 다시 돌려 새 소켓을 연다. */
  const [reconnectToken, setReconnectToken] = useState(0)
  const reconnectAttemptRef = useRef(0)

  useEffect(() => {
    onChannelStatusChangeRef.current = onChannelStatusChange
  }, [onChannelStatusChange])

  useEffect(() => {
    editingSegmentIdRef.current = editingSegmentId
  }, [editingSegmentId])

  useEffect(() => {
    lastSequenceRef.current = null
    hasConnectedRef.current = false
    reconnectAttemptRef.current = 0
  }, [meetingId])

  const appendSegments = useCallback((requestMeetingId: number, incoming: TranscriptSegment[]) => {
    if (incoming.length === 0) return

    const highest = incoming.reduce(
      (max, segment) => Math.max(max, segment.sequenceIndex),
      lastSequenceRef.current ?? Number.NEGATIVE_INFINITY,
    )
    lastSequenceRef.current = Number.isFinite(highest) ? highest : null

    setState((current) => ({
      meetingId: requestMeetingId,
      segments: mergeTranscriptSegments({
        current: current.meetingId === requestMeetingId ? current.segments : EMPTY_SEGMENTS,
        incoming,
        protectedSegmentId: editingSegmentIdRef.current,
      }),
    }))
  }, [])

  const loadSegments = useCallback(
    (afterSequenceIndex: number | null) => {
      void transcriptService
        .listSegments(meetingId, afterSequenceIndex)
        .then((result) => {
          appendSegments(meetingId, toTranscriptSegments(result.segments))
          setError(null)
        })
        .catch((cause: unknown) => {
          setError(
            cause instanceof Error && cause.message
              ? cause.message
              : '전사 세그먼트를 불러오지 못했습니다.',
          )
        })
    },
    [appendSegments, meetingId],
  )

  // 연결 시점 이전 구간은 WebSocket으로 오지 않으므로 조회 API로 채운다.
  useEffect(() => {
    if (!enabled) return
    loadSegments(null)
  }, [enabled, loadSegments])

  useEffect(() => {
    if (!enabled) return

    const channel = meetingTranscriptionGateway.connect({
      meetingId,
      wsUrl,
      onStatus: (status) => {
        // 상태 갱신은 effect 본문 밖(마이크로태스크)에서 수행한다.
        void Promise.resolve().then(() => onChannelStatusChangeRef.current(status))
      },
      onMessage: (message) => {
        if (message.kind === 'interim') {
          setInterimText(message.text)
          return
        }
        setInterimText('')
        appendSegments(meetingId, [message.segment])
      },
    })
    channelRef.current = channel

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [appendSegments, enabled, meetingId, reconnectToken, wsUrl])

  /**
   * 끊긴 채널을 자동으로 다시 연결한다.
   *
   * 서버가 닫거나 네트워크가 끊겨도 사용자가 새로고침하지 않고 회의를 이어갈 수 있어야 한다.
   * 실패가 반복되면 간격을 늘려 서버를 몰아치지 않는다.
   */
  useEffect(() => {
    if (!enabled) return
    if (channelStatus === 'connected') {
      reconnectAttemptRef.current = 0
      return
    }
    if (channelStatus !== 'closed' && channelStatus !== 'error') return

    const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, RECONNECT_MAX_DELAY_MS)
    const timerId = window.setTimeout(() => {
      reconnectAttemptRef.current += 1
      setReconnectToken((current) => current + 1)
    }, delayMs)

    return () => window.clearTimeout(timerId)
  }, [channelStatus, enabled])

  // 재연결했을 때만 놓친 구간을 보충한다. 최초 연결분은 위의 초기 조회가 담당한다.
  useEffect(() => {
    if (!enabled || channelStatus !== 'connected') return
    if (!hasConnectedRef.current) {
      hasConnectedRef.current = true
      return
    }
    loadSegments(lastSequenceRef.current)
  }, [channelStatus, enabled, loadSegments])

  const sendAudio = useCallback((chunk: ArrayBuffer) => {
    channelRef.current?.sendAudio(chunk)
  }, [])

  /** 편집 저장이 성공했을 때 목록에도 반영한다. */
  const applyEdit = useCallback((segmentId: string, text: string) => {
    setState((current) => ({
      meetingId: current.meetingId,
      segments: current.segments.map((segment) =>
        segment.id === segmentId ? { ...segment, text, isEdited: true } : segment,
      ),
    }))
  }, [])

  // 일시정지에도 녹음 세션은 유지한다. 레코더를 새로 만들면 서버 쪽 오디오 스트림이 깨진다.
  const capture = useMicrophoneCapture({
    enabled: enabled && isHost && channelStatus === 'connected',
    paused: !isRecording,
    onChunk: sendAudio,
  })

  // WebSocket이 끊긴 동안에는 조회 API로라도 화면이 따라가게 한다.
  const isChannelDown = channelStatus === 'error' || channelStatus === 'closed'
  const fallback = useTranscriptPolling({
    enabled: enabled && isChannelDown,
    meetingId,
    editingSegmentId,
  })

  const currentSegments = state.meetingId === meetingId ? state.segments : EMPTY_SEGMENTS
  const segments = useMemo(
    () =>
      fallback.segments.length === 0
        ? currentSegments
        : mergeTranscriptSegments({
            current: currentSegments,
            incoming: fallback.segments,
            protectedSegmentId: editingSegmentId,
          }),
    [currentSegments, editingSegmentId, fallback.segments],
  )

  return {
    segments,
    interimText: isHost ? interimText : '',
    microphoneStatus: capture.status,
    error: error ?? fallback.error,
    applyEdit,
  }
}
