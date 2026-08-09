import { beforeEach, describe, expect, it } from 'vitest'

import type { FinalizeMeetingRecordRequest } from '../../contracts/meeting.contracts'
import { resetLiveMeetingMockDb } from '../db/liveMeeting.mockDb'
import { liveMeetingSnapshotMockGateway, meetingRecordMockGateway } from './liveMeeting.mock'

describe('live meeting Mock gateways', () => {
  beforeEach(() => {
    resetLiveMeetingMockDb()
  })

  it('returns screen data separately from lifecycle state', async () => {
    const snapshot = await liveMeetingSnapshotMockGateway.getSnapshot('1')

    expect(snapshot).toHaveProperty('transcript')
    expect(snapshot).toHaveProperty('aiChat')
    expect(snapshot).not.toHaveProperty('elapsedSeconds')
    expect(snapshot).not.toHaveProperty('recordingState')
  })

  it('finalizes one completed record per meeting id', async () => {
    const request: FinalizeMeetingRecordRequest = {
      meetingId: '1',
      projectId: '1',
      projectTitle: '서비스 디자인',
      meetingTitle: '2차 대면회의',
      activeDurationSeconds: 8,
      endedAt: '2026-08-05T00:00:08.000Z',
      host: { id: 'you', name: '윤금서', avatarKey: 'you' },
    }

    const first = await meetingRecordMockGateway.finalizeEndedMeeting(request)
    const second = await meetingRecordMockGateway.finalizeEndedMeeting(request)

    expect(second.recordId).toBe(first.recordId)
    expect(second.durationSeconds).toBe(8)
    await expect(meetingRecordMockGateway.listCompletedMeetings('1')).resolves.toHaveLength(1)
  })
})
