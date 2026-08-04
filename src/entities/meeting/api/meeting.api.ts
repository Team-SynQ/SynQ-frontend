import type {
  CompleteMeetingRequest,
  CompletedMeetingSummary,
  LiveMeetingResponse,
  TranscriptSegmentResponse,
  UpdateTranscriptRequest,
} from '../../../shared/api/contracts/meeting.contracts'
import { liveMeetingMockService } from '../../../shared/api/mock/services/liveMeeting.mock'

export type MeetingApi = {
  joinMeeting(meetingId: string): Promise<LiveMeetingResponse>
  listTranscripts(meetingId: string): Promise<TranscriptSegmentResponse[]>
  updateTranscript(request: UpdateTranscriptRequest): Promise<TranscriptSegmentResponse>
  completeMeeting(request: CompleteMeetingRequest): Promise<CompletedMeetingSummary>
  listCompletedMeetings(projectId: string): Promise<CompletedMeetingSummary[]>
  updateCompletedMeetingTitle(recordId: string, title: string): Promise<CompletedMeetingSummary>
  deleteCompletedMeeting(recordId: string): Promise<void>
}

export const meetingApi: MeetingApi = liveMeetingMockService
