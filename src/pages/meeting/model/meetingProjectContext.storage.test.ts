import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearMeetingProjectContext,
  readMeetingProjectContext,
  writeMeetingProjectContext,
} from './meetingProjectContext.storage'

describe('meetingProjectContext storage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('isolates the persisted project context by meeting id', () => {
    writeMeetingProjectContext('1', { projectId: 'project-9', projectTitle: '서비스 디자인' })

    expect(readMeetingProjectContext('1')).toEqual({
      projectId: 'project-9',
      projectTitle: '서비스 디자인',
    })
    expect(readMeetingProjectContext('2')).toBeNull()
  })

  it('removes only the completed meeting context', () => {
    writeMeetingProjectContext('1', { projectId: 'project-9', projectTitle: '서비스 디자인' })
    writeMeetingProjectContext('2', { projectId: 'project-3', projectTitle: '온보딩 개선' })

    clearMeetingProjectContext('1')

    expect(readMeetingProjectContext('1')).toBeNull()
    expect(readMeetingProjectContext('2')).toEqual({
      projectId: 'project-3',
      projectTitle: '온보딩 개선',
    })
  })

  it('does not propagate a session storage write failure', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('storage blocked', 'SecurityError')
    })

    expect(() =>
      writeMeetingProjectContext('1', { projectId: 'project-9', projectTitle: '서비스 디자인' }),
    ).not.toThrow()
  })

  it.each([
    ['invalid json', '{'],
    ['a missing project id', JSON.stringify({ projectTitle: '서비스 디자인' })],
    ['an empty project id', JSON.stringify({ projectId: '', projectTitle: '서비스 디자인' })],
    ['a non-string title', JSON.stringify({ projectId: 'project-9', projectTitle: 3 })],
  ])('ignores %s', (_, storedValue) => {
    window.sessionStorage.setItem('synq:meeting-project:1', storedValue)

    expect(readMeetingProjectContext('1')).toBeNull()
  })
})
