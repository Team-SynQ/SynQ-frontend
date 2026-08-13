import { useEffect, useRef, useState } from 'react'

import {
  meetingAiEventsGateway,
  type AiEventChannelStatus,
  type MeetingAiEvent,
} from '../../../entities/meeting'

type UseMeetingAiEventsOptions = {
  /** 회의 정보가 준비됐고 아직 진행 중일 때만 true. */
  enabled: boolean
  meetingId: number
  onEvent: (event: MeetingAiEvent) => void
  /**
   * 연결이 열릴 때마다 호출된다. 최초 연결에도 온다.
   *
   * 서버에 Last-Event-ID 재전송 저장소가 없어, 끊긴 동안 생성된 힌트는 기록 조회로 메워야 한다.
   */
  onConnected: () => void
}

const RECONNECT_MAX_DELAY_MS = 10000

/**
 * 회의 AI 이벤트를 구독한다.
 *
 * 게이트웨이는 한 번 연결하고 끝나므로 끊김 감지와 재연결은 여기서 맡는다.
 * 전사 WebSocket과 같은 지수 백오프를 쓴다.
 */
export function useMeetingAiEvents({
  enabled,
  meetingId,
  onEvent,
  onConnected,
}: UseMeetingAiEventsOptions) {
  // 'closed'로 시작하면 첫 렌더에 재연결 타이머가 먼저 서서 연결이 겹칠 수 있다.
  const [status, setStatus] = useState<AiEventChannelStatus>('connecting')
  const [reconnectToken, setReconnectToken] = useState(0)
  const reconnectAttemptRef = useRef(0)
  const onEventRef = useRef(onEvent)
  const onConnectedRef = useRef(onConnected)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    onConnectedRef.current = onConnected
  }, [onConnected])

  useEffect(() => {
    reconnectAttemptRef.current = 0
  }, [meetingId])

  useEffect(() => {
    if (!enabled) return

    const channel = meetingAiEventsGateway.connect({
      meetingId,
      onEvent: (event) => onEventRef.current(event),
      onStatus: (next) => {
        // 상태 갱신은 effect 본문 밖에서 수행한다.
        void Promise.resolve().then(() => {
          setStatus(next)
          if (next === 'connected') onConnectedRef.current()
        })
      },
    })

    return () => channel.close()
  }, [enabled, meetingId, reconnectToken])

  useEffect(() => {
    if (!enabled) return
    if (status === 'connected') {
      reconnectAttemptRef.current = 0
      return
    }
    if (status !== 'closed' && status !== 'error') return

    const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, RECONNECT_MAX_DELAY_MS)
    const timerId = window.setTimeout(() => {
      reconnectAttemptRef.current += 1
      setReconnectToken((current) => current + 1)
    }, delayMs)

    return () => window.clearTimeout(timerId)
  }, [enabled, status])
}
