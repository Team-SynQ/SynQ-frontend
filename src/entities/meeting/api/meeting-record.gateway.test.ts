import { afterEach, describe, expect, it, vi } from 'vitest'

import { meetingService } from '../../../shared/api/services/meeting.service'
import { meetingRecordGateway } from './meeting-record.gateway'

const meetingListFixture = [
  {
    meetingId: 11,
    title: '1차 대면 회의',
    status: 'COMPLETED',
    createdAt: '2026-08-01T10:00:00Z',
    durationSeconds: 720,
    host: { userId: 3, name: '홍길동', profileImageUrl: null },
    keyTopics: ['자기소개', '기술 피드백'],
  },
  {
    meetingId: 12,
    title: '진행 중 회의',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-02T10:00:00Z',
    durationSeconds: null,
    host: { userId: 3, name: '홍길동', profileImageUrl: null },
    keyTopics: null,
  },
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('meetingRecordGateway', () => {
  it('maps the meeting list to completed records and skips in-progress meetings', async () => {
    vi.spyOn(meetingService, 'listMeetings').mockResolvedValue(meetingListFixture)

    const records = await meetingRecordGateway.listCompletedMeetings('7')

    expect(meetingService.listMeetings).toHaveBeenCalledWith(7)
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      recordId: '11',
      meetingId: '11',
      projectId: '7',
      meetingTitle: '1차 대면 회의',
      durationSeconds: 720,
      completedAt: '2026-08-01T10:00:00Z',
      keywords: ['자기소개', '기술 피드백'],
    })
  })

  it('updates the title through the API and keeps the rest of the cached record', async () => {
    vi.spyOn(meetingService, 'listMeetings').mockResolvedValue(meetingListFixture)
    vi.spyOn(meetingService, 'updateMeetingTitle').mockResolvedValue({
      meetingId: 11,
      title: '변경된 제목',
      userModified: true,
    })

    await meetingRecordGateway.listCompletedMeetings('7')
    const updated = await meetingRecordGateway.updateCompletedMeetingTitle('11', '변경된 제목')

    expect(meetingService.updateMeetingTitle).toHaveBeenCalledWith(11, '변경된 제목')
    expect(updated.meetingTitle).toBe('변경된 제목')
    expect(updated.durationSeconds).toBe(720)
    expect(updated.keywords).toEqual(['자기소개', '기술 피드백'])
  })

  it('deletes a meeting record through the API', async () => {
    const deleteMeeting = vi.spyOn(meetingService, 'deleteMeeting').mockResolvedValue(undefined)

    await meetingRecordGateway.deleteCompletedMeeting('11')

    expect(deleteMeeting).toHaveBeenCalledWith(11)
  })

  it('builds the finalized record from the end request without a server round trip', async () => {
    const record = await meetingRecordGateway.finalizeEndedMeeting({
      meetingId: '21',
      projectId: '7',
      projectTitle: '회의 보조 AI, 씽큐',
      meetingTitle: '종료된 회의',
      activeDurationSeconds: 300,
      endedAt: '2026-08-03T10:00:00Z',
      host: { id: '3', name: '홍길동', avatarKey: 'you' },
    })

    expect(record).toMatchObject({
      recordId: '21',
      meetingId: '21',
      projectId: '7',
      meetingTitle: '종료된 회의',
      durationSeconds: 300,
      completedAt: '2026-08-03T10:00:00Z',
    })
  })
})
