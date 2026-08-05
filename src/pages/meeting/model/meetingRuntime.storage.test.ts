import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearMeetingRuntime,
  readMeetingRuntime,
  writeMeetingRuntime,
} from './meetingRuntime.storage'

describe('meetingRuntime storage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isolates persisted runtime by meeting id', () => {
    writeMeetingRuntime('1', { activeSeconds: 8, recordingState: 'paused' })

    expect(readMeetingRuntime('1')).toEqual({
      activeSeconds: 8,
      recordingState: 'paused',
    })
    expect(readMeetingRuntime('2')).toBeNull()
  })

  it('removes only the completed meeting runtime', () => {
    writeMeetingRuntime('1', { activeSeconds: 8, recordingState: 'paused' })
    writeMeetingRuntime('2', { activeSeconds: 3, recordingState: 'recording' })

    clearMeetingRuntime('1')

    expect(readMeetingRuntime('1')).toBeNull()
    expect(readMeetingRuntime('2')).toEqual({
      activeSeconds: 3,
      recordingState: 'recording',
    })
  })

  it('does not propagate a session storage write failure', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('storage blocked', 'SecurityError')
    })

    expect(() =>
      writeMeetingRuntime('1', { activeSeconds: 8, recordingState: 'recording' }),
    ).not.toThrow()
  })

  it('does not propagate a session storage removal failure', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('storage blocked', 'SecurityError')
    })

    expect(() => clearMeetingRuntime('1')).not.toThrow()
  })

  it.each([
    ['invalid json', '{'],
    ['negative elapsed time', JSON.stringify({ activeSeconds: -1, recordingState: 'recording' })],
    ['unknown recording state', JSON.stringify({ activeSeconds: 1, recordingState: 'stopped' })],
  ])('ignores %s', (_, storedValue) => {
    window.sessionStorage.setItem('synq:meeting-runtime:1', storedValue)

    expect(readMeetingRuntime('1')).toBeNull()
  })
})
