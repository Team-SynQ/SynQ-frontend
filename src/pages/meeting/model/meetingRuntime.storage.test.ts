import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearMeetingRuntime,
  readMeetingRuntime,
  writeMeetingRuntime,
} from './meetingRuntime.storage'

describe('meetingRuntime storage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
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

  it.each([
    ['invalid json', '{'],
    ['negative elapsed time', JSON.stringify({ activeSeconds: -1, recordingState: 'recording' })],
    ['unknown recording state', JSON.stringify({ activeSeconds: 1, recordingState: 'stopped' })],
  ])('ignores %s', (_, storedValue) => {
    window.sessionStorage.setItem('synq:meeting-runtime:1', storedValue)

    expect(readMeetingRuntime('1')).toBeNull()
  })
})
