import type {
  GetTranscriptHintRequest,
  MeetingAiChatMessageResponse,
  SendMeetingAiQuestionRequest,
  TranscriptHintResponse,
} from '../../../shared/api/contracts/meeting.contracts'
import { liveMeetingAiMockGateway } from '../../../shared/api/mock/services/liveMeeting.mock'

/**
 * 백엔드 명세에 아직 없는 회의 AI 기능을 위한 임시 Mock 전용 경계입니다.
 * 실제 엔드포인트가 확정되기 전에는 MeetingApi에 포함하지 않습니다.
 */
export type MeetingAiMockGateway = {
  getTranscriptHint(request: GetTranscriptHintRequest): Promise<TranscriptHintResponse>
  sendMeetingAiQuestion(
    request: SendMeetingAiQuestionRequest,
  ): Promise<MeetingAiChatMessageResponse>
}

export const meetingAiMockGateway: MeetingAiMockGateway = liveMeetingAiMockGateway
