import { describe, expect, it } from 'vitest'

import { formatTranscriptTime } from './formatTranscriptTime'

describe('formatTranscriptTime', () => {
  it('회의 시작 시각에 경과 시간을 더해 벽시계로 표시한다', () => {
    const startedAt = new Date(2026, 7, 11, 14, 40, 0).toISOString()

    expect(formatTranscriptTime(62.3, startedAt)).toBe('14:41')
  })

  it('시간을 넘기면 시각도 함께 넘어간다', () => {
    const startedAt = new Date(2026, 7, 11, 14, 40, 0).toISOString()

    expect(formatTranscriptTime(25 * 60, startedAt)).toBe('15:05')
  })

  it('회의 시작 시각을 모르면 경과 시간으로 되돌린다', () => {
    expect(formatTranscriptTime(373, null)).toBe('06:13')
    expect(formatTranscriptTime(373)).toBe('06:13')
  })

  it('잘못된 시작 시각도 경과 시간으로 되돌린다', () => {
    expect(formatTranscriptTime(373, 'not-a-date')).toBe('06:13')
  })

  it('음수 경과 시간은 회의 시작 시각으로 본다', () => {
    const startedAt = new Date(2026, 7, 11, 9, 5, 0).toISOString()

    expect(formatTranscriptTime(-10, startedAt)).toBe('09:05')
  })
})
