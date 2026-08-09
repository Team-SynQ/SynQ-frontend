import type {
  LiveMeetingSnapshotResponse,
  TranscriptSegmentResponse,
  UpdateTranscriptRequest,
} from '../../../shared/api/contracts/meeting.contracts'
import { liveMeetingSnapshotMockGateway } from '../../../shared/api/mock/services/liveMeeting.mock'

export type LiveMeetingSnapshotGateway = {
  getSnapshot(meetingId: string): Promise<LiveMeetingSnapshotResponse>
  listTranscripts(meetingId: string): Promise<TranscriptSegmentResponse[]>
  updateTranscript(request: UpdateTranscriptRequest): Promise<TranscriptSegmentResponse>
}

export const liveMeetingSnapshotGateway: LiveMeetingSnapshotGateway = liveMeetingSnapshotMockGateway
