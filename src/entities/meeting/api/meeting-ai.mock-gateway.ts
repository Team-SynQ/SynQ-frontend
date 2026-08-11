import type {
  MeetingAiChatMessageResponse,
  SendMeetingAiQuestionRequest,
} from '../../../shared/api/contracts/meeting.contracts'
import { liveMeetingAiMockGateway } from '../../../shared/api/mock/services/liveMeeting.mock'

/**
 * 백엔드 명세에 아직 없는 회의 AI 기능을 위한 임시 Mock 전용 경계입니다.
 * SynQ 힌트는 실제 API로 옮겼고, AI Chat만 남아 있습니다.
 */
export type MeetingAiMockGateway = {
  sendMeetingAiQuestion(
    request: SendMeetingAiQuestionRequest,
  ): Promise<MeetingAiChatMessageResponse>
}

export const meetingAiMockGateway: MeetingAiMockGateway = liveMeetingAiMockGateway
