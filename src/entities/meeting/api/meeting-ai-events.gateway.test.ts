import { describe, expect, it } from 'vitest'

import { parseAiEventFrame } from './meeting-ai-events.gateway'

const AUTO_HINT_PAYLOAD = {
  type: 'AUTO_HINT_CREATED',
  meetingId: 10,
  occurredAt: '2026-08-11T14:01:00Z',
  data: {
    meetingId: 10,
    segmentId: 125,
    meaning: '출시 일정 변경 가능성을 논의한 발화입니다.',
    myImpact: '담당 일정 재조정이 필요할 수 있습니다.',
    teamQuestion: '일정 변경 여부는 언제 확정하나요?',
    importance: 82,
    triggerReason: '일정과 리소스에 영향을 주는 중요 발화',
  },
}

describe('parseAiEventFrame', () => {
  it('자동 힌트 이벤트를 화면 힌트로 변환한다', () => {
    const frame = `event: hint.auto-created\ndata: ${JSON.stringify(AUTO_HINT_PAYLOAD)}`

    expect(parseAiEventFrame(frame)).toEqual({
      kind: 'autoHint',
      hint: {
        transcriptId: '125',
        meaning: '출시 일정 변경 가능성을 논의한 발화입니다.',
        personalImpact: '담당 일정 재조정이 필요할 수 있습니다.',
        teamQuestion: '일정 변경 여부는 언제 확정하나요?',
      },
    })
  })

  it('여러 줄로 쪼개진 data를 이어 붙인다', () => {
    const json = JSON.stringify(AUTO_HINT_PAYLOAD)
    const half = Math.floor(json.length / 2)
    const frame = `event: hint.auto-created\ndata: ${json.slice(0, half)}\ndata: ${json.slice(half)}`

    // 줄바꿈으로 이어 붙이면 JSON이 깨지므로, 서버가 쪼개 보내면 이 형태로는 복원할 수 없다.
    // 실제로는 한 줄로 오지만 파서가 예외로 죽지 않는 것까지 확인한다.
    expect(() => parseAiEventFrame(frame)).not.toThrow()
  })

  it('CRLF 줄바꿈과 주석 줄을 처리한다', () => {
    const frame = `: ping\r\nevent: hint.auto-created\r\ndata: ${JSON.stringify(AUTO_HINT_PAYLOAD)}\r\n`

    expect(parseAiEventFrame(frame)).toMatchObject({ kind: 'autoHint' })
  })

  it.each([
    ['연결 확인', 'event: connected\ndata: {"type":"CONNECTED"}'],
    ['하트비트', 'event: heartbeat\ndata: {"type":"HEARTBEAT"}'],
    ['맥락 갱신', 'event: live-context.updated\ndata: {"type":"LIVE_CONTEXT_UPDATED"}'],
    ['요약 완료', 'event: summary.completed\ndata: {"type":"SUMMARY_COMPLETED"}'],
  ])('%s 이벤트는 아직 화면에서 쓰지 않는다', (_, frame) => {
    expect(parseAiEventFrame(frame)).toBeNull()
  })

  it.each([
    ['이름 없는 프레임', 'data: {"type":"AUTO_HINT_CREATED"}'],
    ['깨진 JSON', 'event: hint.auto-created\ndata: {'],
    ['segmentId 없는 payload', 'event: hint.auto-created\ndata: {"data":{"meaning":"..."}}'],
    ['빈 프레임', ''],
  ])('%s은 무시한다', (_, frame) => {
    expect(parseAiEventFrame(frame)).toBeNull()
  })
})
