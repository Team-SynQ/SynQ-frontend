import { useCallback, useEffect, useRef, useState } from 'react'

import {
  clearMeetingRuntime,
  readMeetingRuntime,
  writeMeetingRuntime,
} from './meetingRuntime.storage'

export type RecordingState = 'recording' | 'paused'
export type ConnectionState = 'connecting' | 'connected' | 'reconnecting'
export type ConnectionNotice = 'unstable' | 'restored' | null

type UseMeetingRuntimeOptions = {
  enabled: boolean
  meetingId: string
  restoreConnection: (meetingId: number) => Promise<void>
  /** 전사 전송 채널이 끊겼을 때 true. 연결 복구 중과 같은 규칙으로 다룬다. */
  channelDegraded?: boolean
  /**
   * 입장 응답이 알려 준 서버 기준 누적 활성 시간. 아직 모르면 null이다.
   * 진행자와 참여자가 같은 값을 봐야 하므로 `sessionStorage` 복원보다 우선한다.
   * 객체가 아니라 원시값으로 받는다 — 매 렌더 새 객체가 들어오면 초기화 effect가 헛돈다.
   */
  serverActiveSeconds?: number | null
  /** 입장 응답이 알려 준 서버 기준 일시정지 상태. */
  serverPaused?: boolean
}

const RESTORED_NOTICE_DURATION_MS = 3000

export function useMeetingRuntime({
  enabled,
  meetingId,
  restoreConnection,
  channelDegraded = false,
  serverActiveSeconds = null,
  serverPaused = false,
}: UseMeetingRuntimeOptions) {
  const [initialRuntime] = useState(() => readMeetingRuntime(meetingId))
  const [activeSeconds, setActiveSeconds] = useState(initialRuntime?.activeSeconds ?? 0)
  const [recordingState, setRecordingState] = useState<RecordingState>(
    initialRuntime?.recordingState ?? 'recording',
  )
  const [connectionState, setConnectionState] = useState<ConnectionState>(() =>
    enabled ? (initialRuntime ? 'reconnecting' : 'connected') : 'connecting',
  )
  const [connectionNotice, setConnectionNotice] = useState<ConnectionNotice>(() =>
    enabled && initialRuntime ? 'unstable' : null,
  )
  const [ending, setEnding] = useState(false)
  const initializedMeetingIdRef = useRef<string | null>(null)
  const frozenDurationRef = useRef<number | null>(null)
  const restoredNoticeTimerRef = useRef<number | null>(null)
  const restoreConnectionRef = useRef(restoreConnection)

  useEffect(() => {
    restoreConnectionRef.current = restoreConnection
  }, [restoreConnection])
  useEffect(() => {
    if (!enabled) {
      initializedMeetingIdRef.current = null
      return
    }
    if (initializedMeetingIdRef.current === meetingId) return

    const persisted = readMeetingRuntime(meetingId)
    let active = true
    void Promise.resolve().then(() => {
      if (!active) return

      initializedMeetingIdRef.current = meetingId
      frozenDurationRef.current = null
      setEnding(false)
      // 시간과 일시정지 상태는 서버가 정본이다. 서버 값이 있으면 저장된 값은 쓰지 않는다.
      setActiveSeconds(serverActiveSeconds ?? persisted?.activeSeconds ?? 0)
      setRecordingState(
        serverActiveSeconds === null
          ? (persisted?.recordingState ?? 'recording')
          : serverPaused
            ? 'paused'
            : 'recording',
      )

      // 연결 복구 안내는 저장된 값이 있을 때만이다. 새로고침으로 되돌아왔다는 뜻이기 때문이다.
      if (!persisted) {
        setConnectionState('connected')
        setConnectionNotice(null)
        return
      }

      setConnectionState('reconnecting')
      setConnectionNotice('unstable')
      void restoreConnectionRef
        .current(Number(meetingId))
        .then(() => {
          if (!active) return
          setConnectionState('connected')
          setConnectionNotice('restored')
          restoredNoticeTimerRef.current = window.setTimeout(() => {
            setConnectionNotice(null)
            restoredNoticeTimerRef.current = null
          }, RESTORED_NOTICE_DURATION_MS)
        })
        .catch(() => {
          if (!active) return
          setConnectionState('reconnecting')
          setConnectionNotice('unstable')
        })
    })

    return () => {
      active = false
      if (restoredNoticeTimerRef.current !== null) {
        window.clearTimeout(restoredNoticeTimerRef.current)
        restoredNoticeTimerRef.current = null
      }
    }
  }, [enabled, meetingId, serverActiveSeconds, serverPaused])

  // 전사 채널이 끊긴 것도 사용자에게는 연결 불안정과 같은 상황이다.
  const effectiveConnectionState: ConnectionState =
    channelDegraded && connectionState === 'connected' ? 'reconnecting' : connectionState
  const effectiveConnectionNotice: ConnectionNotice =
    channelDegraded && connectionState === 'connected' ? 'unstable' : connectionNotice

  const canProgress =
    enabled && !ending && recordingState === 'recording' && effectiveConnectionState === 'connected'

  useEffect(() => {
    if (!canProgress) return
    const timerId = window.setInterval(() => {
      setActiveSeconds((current) => current + 1)
    }, 1000)
    return () => window.clearInterval(timerId)
  }, [canProgress])

  useEffect(() => {
    if (!enabled || initializedMeetingIdRef.current !== meetingId) return
    writeMeetingRuntime(meetingId, { activeSeconds, recordingState })
  }, [activeSeconds, enabled, meetingId, recordingState])

  /**
   * 서버가 알려 준 일시정지 상태와 누적 시간을 그대로 반영한다.
   * 진행자는 일시정지·재개 응답에서, 참여자는 전사 WebSocket 알림에서 받는다.
   * 로컬에서 먼저 토글하지 않는 이유는 그래야 두 화면이 같은 값을 보기 때문이다.
   */
  const syncPauseState = useCallback((paused: boolean, nextActiveSeconds: number) => {
    setRecordingState(paused ? 'paused' : 'recording')
    setActiveSeconds(nextActiveSeconds)
  }, [])

  const freezeForEnd = useCallback(() => {
    if (frozenDurationRef.current !== null) return frozenDurationRef.current
    frozenDurationRef.current = activeSeconds
    setEnding(true)
    return frozenDurationRef.current
  }, [activeSeconds])

  const clear = useCallback(() => {
    clearMeetingRuntime(meetingId)
    frozenDurationRef.current = null
  }, [meetingId])

  return {
    activeSeconds,
    canProgress,
    clear,
    connectionNotice: effectiveConnectionNotice,
    connectionState: effectiveConnectionState,
    freezeForEnd,
    recordingState,
    syncPauseState,
  }
}
