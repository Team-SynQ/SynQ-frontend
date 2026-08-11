import { describe, expect, it } from 'vitest'

import {
  buildFallbackTranscriptionUrl,
  parseTranscriptionMessage,
  resolveTranscriptionUrl,
} from './meeting-transcription.gateway'

describe('parseTranscriptionMessage', () => {
  it('중간 인식은 interim으로 해석한다', () => {
    const message = parseTranscriptionMessage(
      JSON.stringify({ type: 'TRANSCRIPT', isFinal: false, text: '이번 스프린' }),
    )

    expect(message).toEqual({ kind: 'interim', text: '이번 스프린' })
  })

  it('확정 발화를 화면 세그먼트로 변환한다', () => {
    const message = parseTranscriptionMessage(
      JSON.stringify({
        type: 'TRANSCRIPT',
        isFinal: true,
        utteranceId: 12,
        sequence: 3,
        startTime: 62300,
        text: '이번 스프린트 일정 어떻게 할까요?',
      }),
    )

    expect(message).toEqual({
      kind: 'final',
      segment: {
        id: '12',
        sequenceIndex: 3,
        startedAtSeconds: 62.3,
        text: '이번 스프린트 일정 어떻게 할까요?',
        isEdited: false,
        editedAt: null,
      },
    })
  })

  it('REST와 같은 필드명(segmentId·sequenceIndex·startMs·content)도 받아들인다', () => {
    const message = parseTranscriptionMessage(
      JSON.stringify({
        type: 'TRANSCRIPT',
        isFinal: true,
        segmentId: 7,
        sequenceIndex: 1,
        startMs: 1000,
        content: '확정 문장',
      }),
    )

    expect(message).toMatchObject({
      kind: 'final',
      segment: { id: '7', sequenceIndex: 1, startedAtSeconds: 1, text: '확정 문장' },
    })
  })

  it('식별자가 없는 확정 메시지는 버린다', () => {
    const message = parseTranscriptionMessage(
      JSON.stringify({ type: 'TRANSCRIPT', isFinal: true, text: '식별자 없음' }),
    )

    expect(message).toBeNull()
  })

  it('전사 이외의 메시지와 잘못된 JSON은 무시한다', () => {
    expect(parseTranscriptionMessage(JSON.stringify({ type: 'PING' }))).toBeNull()
    expect(parseTranscriptionMessage('not json')).toBeNull()
    expect(parseTranscriptionMessage(new ArrayBuffer(4))).toBeNull()
  })
})

describe('resolveTranscriptionUrl', () => {
  it('서버가 준 wsUrl에 토큰을 붙인다', () => {
    const url = resolveTranscriptionUrl(5, 'wss://api.example.com/ws/meetings/5/stt', 'abc def')

    expect(url).toBe('wss://api.example.com/ws/meetings/5/stt?token=abc+def')
  })

  it('wsUrl이 비면 API base URL에서 유추한다', () => {
    const url = resolveTranscriptionUrl(9, null, 'token')

    expect(url).toContain('/ws/meetings/9/stt')
    expect(url).toContain('token=token')
    expect(url.startsWith('ws')).toBe(true)
  })

  it('토큰이 없으면 쿼리를 붙이지 않는다', () => {
    const url = resolveTranscriptionUrl(5, 'wss://api.example.com/ws/meetings/5/stt', null)

    expect(url).toBe('wss://api.example.com/ws/meetings/5/stt')
  })
})

describe('buildFallbackTranscriptionUrl', () => {
  it('절대 base URL은 프로토콜만 ws로 바꾼다', () => {
    const url = buildFallbackTranscriptionUrl(9, 'https://api.example.com')

    expect(url.toString()).toBe('wss://api.example.com/ws/meetings/9/stt')
  })

  it('개발 서버 프록시 경로여도 현재 출처를 기준으로 절대화한다', () => {
    const url = buildFallbackTranscriptionUrl(9, '/api')

    expect(url.host).toBe(window.location.host)
    expect(url.pathname).toBe('/api/ws/meetings/9/stt')
    expect(url.protocol).toBe(window.location.protocol === 'https:' ? 'wss:' : 'ws:')
  })

  it('base URL 끝 슬래시가 경로에 겹쳐 들어가지 않는다', () => {
    expect(buildFallbackTranscriptionUrl(9, 'https://api.example.com/').toString()).toBe(
      'wss://api.example.com/ws/meetings/9/stt',
    )
    expect(buildFallbackTranscriptionUrl(9, '/api/').pathname).toBe('/api/ws/meetings/9/stt')
  })
})
