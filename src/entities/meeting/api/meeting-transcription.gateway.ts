import type { TranscriptSegmentResponse } from '../../../shared/api/contracts/meeting.contracts'
import { API_BASE_URL } from '../../../shared/api/apiBaseUrl'
import { getAccessToken } from '../../../shared/api/lib/apiClient'

export type TranscriptionChannelStatus = 'connecting' | 'connected' | 'closed' | 'error'

export type TranscriptionMessage =
  /** 확정 전 중간 인식. 저장되지 않고 화면에만 흐리게 보여준다. */
  | { kind: 'interim'; text: string }
  /** 확정 발화. 서버가 이미 저장한 세그먼트다. */
  | { kind: 'final'; segment: TranscriptSegmentResponse }

export type TranscriptionChannel = {
  sendAudio(chunk: ArrayBuffer): void
  close(): void
}

export type ConnectTranscriptionOptions = {
  meetingId: number
  /** 회의 생성·입장 응답의 wsUrl. 비어 있으면 API base URL에서 유추한다. */
  wsUrl?: string | null
  token?: string | null
  onMessage: (message: TranscriptionMessage) => void
  onStatus: (status: TranscriptionChannelStatus) => void
}

/**
 * 스킴을 WebSocket 계열로 맞춘다.
 * HTTPS 페이지에서 ws:// 는 브라우저가 차단하므로 이때는 항상 wss:// 로 올린다.
 */
function normalizeWebSocketProtocol(url: URL): void {
  const isSecure = url.protocol === 'https:' || url.protocol === 'wss:'
  url.protocol = isSecure || window.location.protocol === 'https:' ? 'wss:' : 'ws:'
}

/**
 * 서버가 wsUrl을 주지 않았을 때 API base URL에서 연결 주소를 유추한다.
 *
 * base URL은 개발 서버 프록시 경로(`/api`)일 수 있어 절대 주소라고 가정하면 안 된다.
 * 현재 출처를 기준으로 붙여 절대화한 뒤 스킴을 맞춘다.
 */
export function buildFallbackTranscriptionUrl(meetingId: number, baseUrl = API_BASE_URL): URL {
  const url = new URL(`${baseUrl}/ws/meetings/${meetingId}/stt`, window.location.origin)
  normalizeWebSocketProtocol(url)
  return url
}

/**
 * 연결 주소를 확정한다.
 *
 * 서버가 준 wsUrl을 우선 쓰되 두 가지를 보정한다.
 * - 스킴을 ws/wss로 맞춘다. 서버가 상대 경로나 http(s)를 줘도 연결되게 한다.
 * - 인증은 헤더를 넣을 수 없어 쿼리 파라미터 token으로 싣는다.
 */
export function resolveTranscriptionUrl(
  meetingId: number,
  wsUrl?: string | null,
  token?: string | null,
): string {
  const url = wsUrl?.trim()
    ? new URL(wsUrl, window.location.origin)
    : buildFallbackTranscriptionUrl(meetingId)

  normalizeWebSocketProtocol(url)
  if (token) {
    url.searchParams.set('token', token)
  }
  return url.toString()
}

function toSeconds(value: unknown): number {
  // 서버는 start_ms 기준이다. WS 메시지의 startTime 단위는 확인 대기 중이라 ms로 해석한다.
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric / 1000 : 0
}

/**
 * WS 전사 메시지를 화면 타입으로 변환한다.
 *
 * 확정 메시지의 식별자·순번 필드명이 REST와 다르게 관측돼(utteranceId / sequence / startTime)
 * 양쪽 이름을 모두 받아들인다. 백엔드가 이름을 확정하면 한쪽만 남기면 된다.
 */
export function parseTranscriptionMessage(raw: unknown): TranscriptionMessage | null {
  if (typeof raw !== 'string') return null

  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }

  if (data.type !== 'TRANSCRIPT') return null

  const text = String(data.text ?? data.content ?? '')
  if (!data.isFinal) {
    return { kind: 'interim', text }
  }

  const id = data.segmentId ?? data.utteranceId
  if (id === undefined || id === null) return null

  return {
    kind: 'final',
    segment: {
      id: String(id),
      sequenceIndex: Number(data.sequenceIndex ?? data.sequence ?? 0),
      startedAtSeconds: toSeconds(data.startMs ?? data.startTime),
      text,
      isEdited: false,
      editedAt: null,
    },
  }
}

export type MeetingTranscriptionGateway = {
  connect(options: ConnectTranscriptionOptions): TranscriptionChannel
}

export const meetingTranscriptionGateway: MeetingTranscriptionGateway = {
  connect({ meetingId, wsUrl, token, onMessage, onStatus }) {
    const socket = new WebSocket(
      resolveTranscriptionUrl(meetingId, wsUrl, token ?? getAccessToken()),
    )
    socket.binaryType = 'arraybuffer'
    onStatus('connecting')

    socket.onopen = () => onStatus('connected')
    socket.onmessage = (event: MessageEvent) => {
      const message = parseTranscriptionMessage(event.data)
      if (message) onMessage(message)
    }
    socket.onerror = () => onStatus('error')
    socket.onclose = (event: CloseEvent) => {
      // 핸드셰이크 거부 사유는 서버 규약상 401(토큰) · 403(미참가) · 404(없는 회의) · 409(진행 중 아님)다.
      // 브라우저가 HTTP 상태를 노출하지 않으므로 close 정보라도 남겨 원인 추적을 돕는다.
      if (!event.wasClean) {
        console.warn('[transcription] WebSocket closed', event.code, event.reason)
      }
      onStatus('closed')
    }

    return {
      sendAudio(chunk) {
        if (socket.readyState === WebSocket.OPEN) socket.send(chunk)
      },
      close() {
        // 의도적 종료는 상태를 알리지 않는다. 알리면 재연결 로직이 스스로를 다시 깨운다.
        socket.onopen = null
        socket.onmessage = null
        socket.onerror = null
        socket.onclose = null
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close()
        }
      },
    }
  },
}
