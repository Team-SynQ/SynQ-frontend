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
}

const RESTORED_NOTICE_DURATION_MS = 3000

export function useMeetingRuntime({
  enabled,
  meetingId,
  restoreConnection,
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
      setActiveSeconds(persisted?.activeSeconds ?? 0)
      setRecordingState(persisted?.recordingState ?? 'recording')

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
  }, [enabled, meetingId])

  const canProgress =
    enabled && !ending && recordingState === 'recording' && connectionState === 'connected'

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

  const toggleRecording = useCallback(() => {
    if (ending || connectionState !== 'connected') return
    setRecordingState((current) => (current === 'recording' ? 'paused' : 'recording'))
  }, [connectionState, ending])

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
    connectionNotice,
    connectionState,
    freezeForEnd,
    recordingState,
    toggleRecording,
  }
}
