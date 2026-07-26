import type {
  GetTranscriptHintRequest,
  LiveMeetingResponse,
  MeetingAiChatMessageResponse,
  SendMeetingAiQuestionRequest,
  TranscriptHintResponse,
  TranscriptSegmentResponse,
  UpdateTranscriptRequest,
} from '../../../shared/api/contracts/meeting.contracts'
import { liveMeetingMockService } from '../../../shared/api/mock/services/liveMeeting.mock'

export type MeetingApi = {
  joinMeeting(meetingId: string): Promise<LiveMeetingResponse>
  listTranscripts(meetingId: string): Promise<TranscriptSegmentResponse[]>
  updateTranscript(request: UpdateTranscriptRequest): Promise<TranscriptSegmentResponse>
  getTranscriptHint(request: GetTranscriptHintRequest): Promise<TranscriptHintResponse>
  sendMeetingAiQuestion(
    request: SendMeetingAiQuestionRequest,
  ): Promise<MeetingAiChatMessageResponse>
}

export const meetingApi: MeetingApi = liveMeetingMockService
