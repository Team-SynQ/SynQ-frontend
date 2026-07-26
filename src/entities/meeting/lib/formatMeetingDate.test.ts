import { describe, expect, it } from 'vitest'

import { formatMeetingDate } from './formatMeetingDate'

describe('formatMeetingDate', () => {
  it('formats an ISO timestamp as a local yy.MM.dd date', () => {
    const completedAt = new Date(2026, 6, 27, 12, 0).toISOString()

    expect(formatMeetingDate(completedAt)).toBe('26.07.27')
  })
})
