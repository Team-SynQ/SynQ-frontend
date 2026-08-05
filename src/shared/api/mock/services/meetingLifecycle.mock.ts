import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
} from '../../contracts/meeting.contracts'
import { meetingLifecycleMockDb } from '../db/meetingLifecycle.mockDb'
import { liveMeetingMockDb } from '../db/liveMeeting.mockDb'
import { MockApiError, waitForMockApi } from '../lib/mockApi'

function requireMeeting(meetingId: number) {
  const record = meetingLifecycleMockDb.getRecord(meetingId)
  if (!record) {
    throw new MockApiError(404, 'MEETING_NOT_FOUND', '회의를 찾을 수 없습니다.')
  }
  return record
}

export const meetingLifecycleMockService = {
  async createMeeting(
    projectId: number,
    request: MeetingCreateRequest,
  ): Promise<MeetingCreateResponse> {
    await waitForMockApi()
    if (!request.consentAgreed) {
      throw new MockApiError(
        400,
        'MEETING_CONSENT_REQUIRED',
        '녹음 및 전사 사용 동의가 필요합니다.',
      )
    }
    const created = meetingLifecycleMockDb.createMeeting(projectId, new Date().toISOString())
    liveMeetingMockDb.registerMeeting(String(created.meetingId), String(projectId))
    return created
  },

  async joinMeeting(meetingId: number): Promise<MeetingJoinResponse> {
    await waitForMockApi()
    requireMeeting(meetingId)
    return meetingLifecycleMockDb.joinMeeting(meetingId)!
  },

  async endMeeting(meetingId: number): Promise<MeetingEndResponse> {
    await waitForMockApi()
    requireMeeting(meetingId)
    return meetingLifecycleMockDb.endMeeting(meetingId, new Date().toISOString())!
  },
}
