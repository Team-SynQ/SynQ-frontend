import { describe, expect, it } from 'vitest'

import { validateMeetingTitle } from './validateMeetingTitle'

describe('validateMeetingTitle', () => {
  const currentTitle = '2차 대면회의'

  it('rejects an empty title', () => {
    expect(validateMeetingTitle('', currentTitle)).toBe(false)
  })

  it('rejects a whitespace-only title', () => {
    expect(validateMeetingTitle('   ', currentTitle)).toBe(false)
  })

  it('rejects the current title after trimming', () => {
    expect(validateMeetingTitle(' 2차 대면회의 ', currentTitle)).toBe(false)
  })

  it('accepts a different title within the maximum length', () => {
    expect(validateMeetingTitle('2차 회의', currentTitle)).toBe(true)
  })

  it('rejects a title longer than 50 characters', () => {
    expect(validateMeetingTitle('가'.repeat(51), currentTitle)).toBe(false)
  })

  it('counts surrounding whitespace toward the maximum length', () => {
    expect(validateMeetingTitle(`새 제목${' '.repeat(47)}`, currentTitle, 50)).toBe(false)
  })
})
