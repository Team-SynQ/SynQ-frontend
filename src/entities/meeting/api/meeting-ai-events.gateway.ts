import type { HintDto } from '../../../shared/api/contracts/hint.contracts'
import type { TranscriptHintResponse } from '../../../shared/api/contracts/meeting.contracts'
import { API_BASE_URL } from '../../../shared/api/apiBaseUrl'
import { readAccessToken } from '../../../shared/lib/authStorage'
import { toTranscriptHint } from './hint.adapter'

/** 서버가 보내는 이벤트 중 화면이 쓰는 것만 추린다. */
export type MeetingAiEvent = { kind: 'autoHint'; hint: TranscriptHintResponse }

export type AiEventChannelStatus = 'connecting' | 'connected' | 'closed' | 'error'

export type AiEventChannel = {
  close(): void
}

export type ConnectAiEventsOptions = {
  meetingId: number
  token?: string | null
  onEvent: (event: MeetingAiEvent) => void
  onStatus: (status: AiEventChannelStatus) => void
}

const AUTO_HINT_EVENT = 'hint.auto-created'

type AutoHintEventData = HintDto & {
  segmentId?: number
}

function isAutoHintData(value: unknown): value is AutoHintEventData {
  if (typeof value !== 'object' || value === null) return false

  return (
    'segmentId' in value &&
    typeof value.segmentId === 'number' &&
    'meaning' in value &&
    typeof value.meaning === 'string'
  )
}

/**
 * SSE 프레임 하나를 화면 이벤트로 바꾼다.
 *
 * 프레임은 빈 줄로 구분되고, 한 프레임 안에서 `data:`는 여러 줄일 수 있어 줄바꿈으로 잇는다.
 * `:`로 시작하는 줄은 주석이라 버린다.
 * 자동 힌트 외의 이벤트(connected·heartbeat·live-context.updated·summary.*)는 아직 화면에서 쓰지 않는다.
 */
export function parseAiEventFrame(frame: string): MeetingAiEvent | null {
  let eventName = ''
  const dataLines: string[] = []

  for (const rawLine of frame.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (line.length === 0 || line.startsWith(':')) continue

    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim()
      continue
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).replace(/^ /, ''))
    }
  }

  if (eventName !== AUTO_HINT_EVENT || dataLines.length === 0) return null

  try {
    const payload = JSON.parse(dataLines.join('\n')) as { data?: unknown }
    if (!isAutoHintData(payload.data)) return null

    return {
      kind: 'autoHint',
      hint: toTranscriptHint(String(payload.data.segmentId), payload.data),
    }
  } catch {
    return null
  }
}

export type MeetingAiEventsGateway = {
  connect(options: ConnectAiEventsOptions): AiEventChannel
}

/**
 * 회의 AI 이벤트를 구독한다.
 *
 * `EventSource`를 쓰지 않는다. 서버가 Authorization 헤더를 요구하는데 `EventSource`는 헤더를 넣을 수 없다.
 * 대신 fetch 응답 본문을 스트림으로 읽어 프레임을 직접 해석한다.
 * 자동 재연결도 딸려오지 않으므로 호출자가 담당한다.
 */
export const meetingAiEventsGateway: MeetingAiEventsGateway = {
  connect({ meetingId, token, onEvent, onStatus }) {
    const controller = new AbortController()
    const accessToken = token ?? readAccessToken()
    onStatus('connecting')

    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/ai-events`, {
          headers: {
            Accept: 'text/event-stream',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          onStatus('error')
          return
        }

        onStatus('connected')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        for (;;) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // 프레임 구분자는 빈 줄이다. 마지막 조각은 아직 덜 온 프레임이라 버퍼에 남긴다.
          const frames = buffer.split(/\r?\n\r?\n/)
          buffer = frames.pop() ?? ''

          for (const frame of frames) {
            const event = parseAiEventFrame(frame)
            if (event) onEvent(event)
          }
        }

        onStatus('closed')
      } catch {
        // 의도적으로 끊은 경우는 호출자가 이미 알고 있으므로 알리지 않는다.
        if (controller.signal.aborted) return
        onStatus('error')
      }
    })()

    return {
      close() {
        controller.abort()
      },
    }
  },
}
