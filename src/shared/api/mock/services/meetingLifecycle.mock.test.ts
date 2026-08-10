import { beforeEach, describe, expect, it } from 'vitest'

import { resetMeetingLifecycleMockDb } from '../db/meetingLifecycle.mockDb'
import { meetingLifecycleMockService } from './meetingLifecycle.mock'

describe('meetingLifecycleMockService', () => {
  beforeEach(() => {
    resetMeetingLifecycleMockDb()
  })

  it('creates, joins, and ends a meeting with Swagger-shaped results', async () => {
    const created = await meetingLifecycleMockService.createMeeting(1, {
      consentAgreed: true,
    })

    expect(created).toEqual({
      meetingId: expect.any(Number),
      title: expect.any(String),
      status: 'IN_PROGRESS',
      startedAt: expect.any(String),
      wsUrl: expect.any(String),
    })

    await expect(meetingLifecycleMockService.joinMeeting(created.meetingId)).resolves.toEqual({
      meetingId: created.meetingId,
      title: created.title,
      status: 'IN_PROGRESS',
      role: 'HOST',
      joinedAt: expect.any(String),
      startedAt: created.startedAt,
      wsUrl: created.wsUrl,
    })

    const ended = await meetingLifecycleMockService.endMeeting(created.meetingId)
    expect(ended).toEqual({
      meetingId: created.meetingId,
      status: 'SUMMARIZING',
      endedAt: expect.any(String),
    })
  })

  it('rejects creation without recording consent', async () => {
    await expect(
      meetingLifecycleMockService.createMeeting(1, { consentAgreed: false }),
    ).rejects.toMatchObject({
      code: 'MEETING_CONSENT_REQUIRED',
      status: 400,
    })
  })

  it('returns the same result when an ended meeting is ended again', async () => {
    const created = await meetingLifecycleMockService.createMeeting(1, {
      consentAgreed: true,
    })

    const first = await meetingLifecycleMockService.endMeeting(created.meetingId)
    const second = await meetingLifecycleMockService.endMeeting(created.meetingId)

    expect(second).toEqual(first)
  })

  it('rejects joining or ending an unknown meeting', async () => {
    await expect(meetingLifecycleMockService.joinMeeting(999)).rejects.toMatchObject({
      code: 'MEETING_NOT_FOUND',
      status: 404,
    })
    await expect(meetingLifecycleMockService.endMeeting(999)).rejects.toMatchObject({
      code: 'MEETING_NOT_FOUND',
      status: 404,
    })
  })
})
