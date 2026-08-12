import type {
  LiveMeetingResponse,
  LiveMeetingSnapshotResponse,
} from '../../contracts/meeting.contracts'
import { liveMeetingMockDb } from '../db/liveMeeting.mockDb'
import { MockApiError, waitForMockApi } from '../lib/mockApi'

function requireMeeting(meetingId: string): LiveMeetingResponse {
  const meeting = liveMeetingMockDb.getMeeting(meetingId)
  if (!meeting) {
    throw new MockApiError(404, 'MEETING_NOT_FOUND', '회의를 찾을 수 없습니다.')
  }
  return meeting
}

/**
 * 참여자 목록은 아직 조회 API가 없어 이 스냅샷에서 온다.
 * 전사·힌트·AI Chat은 모두 실제 API로 옮겼으므로 여기서 주는 값은 화면에 쓰이지 않는다.
 * 참여자 API가 생기면 이 mock은 통째로 사라진다.
 */
export const liveMeetingSnapshotMockGateway = {
  async getSnapshot(meetingId: string): Promise<LiveMeetingSnapshotResponse> {
    await waitForMockApi()
    const meeting = requireMeeting(meetingId)
    return {
      meetingId: meeting.meetingId,
      projectId: meeting.projectId,
      projectTitle: meeting.projectTitle,
      meetingTitle: meeting.meetingTitle,
      transcript: meeting.transcript,
    }
  },
}
