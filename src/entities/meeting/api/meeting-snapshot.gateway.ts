import type { LiveMeetingSnapshotResponse } from '../../../shared/api/contracts/meeting.contracts'
import { liveMeetingMockDb } from '../../../shared/api/mock/db/liveMeeting.mockDb'
import { liveMeetingSnapshotMockGateway } from '../../../shared/api/mock/services/liveMeeting.mock'

export type LiveMeetingSnapshotGateway = {
  getSnapshot(meetingId: string): Promise<LiveMeetingSnapshotResponse>
}

export const liveMeetingSnapshotGateway: LiveMeetingSnapshotGateway = {
  async getSnapshot(meetingId) {
    /**
     * 실제 백엔드에서 만든 회의는 mock DB에 없어서 그대로 두면 MEETING_NOT_FOUND로 화면이 죽는다.
     * 전사는 WebSocket·조회 API가 담당하고, 이 스냅샷은 참여자·AI 채팅 mock을 채우는 용도로만 쓴다.
     * 참여자 목록 API가 생기면 이 보정은 제거한다.
     */
    if (!liveMeetingMockDb.getMeeting(meetingId)) {
      liveMeetingMockDb.registerMeeting(meetingId, '1')
    }
    return liveMeetingSnapshotMockGateway.getSnapshot(meetingId)
  },
}
