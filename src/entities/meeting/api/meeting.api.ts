import type {
  LiveMeetingResponse,
  TranscriptSegmentResponse,
  UpdateTranscriptRequest,
} from '../../../shared/api/contracts/meeting.contracts'
import { liveMeetingMockService } from '../../../shared/api/mock/services/liveMeeting.mock'

export type MeetingApi = {
  joinMeeting(meetingId: string): Promise<LiveMeetingResponse>
  listTranscripts(meetingId: string): Promise<TranscriptSegmentResponse[]>
  updateTranscript(request: UpdateTranscriptRequest): Promise<TranscriptSegmentResponse>
}

export const meetingApi: MeetingApi = liveMeetingMockService
