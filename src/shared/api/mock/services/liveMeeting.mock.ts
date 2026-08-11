import type {
  LiveMeetingResponse,
  LiveMeetingSnapshotResponse,
  MeetingAiChatMessageResponse,
  SendMeetingAiQuestionRequest,
} from '../../contracts/meeting.contracts'
import { liveMeetingMockDb } from '../db/liveMeeting.mockDb'
import { MockApiError, waitForMockApi } from '../lib/mockApi'

let messageSequence = 0

function requireMeeting(meetingId: string): LiveMeetingResponse {
  const meeting = liveMeetingMockDb.getMeeting(meetingId)
  if (!meeting) {
    throw new MockApiError(404, 'MEETING_NOT_FOUND', '회의를 찾을 수 없습니다.')
  }
  return meeting
}

/**
 * 참여자 목록과 AI 채팅은 아직 API가 없어 이 스냅샷에서 온다.
 * 전사는 실제 조회 API와 WebSocket이 담당하므로 여기서 주는 값은 화면에 쓰이지 않는다.
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
      participants: meeting.participants,
      transcript: meeting.transcript,
      aiChat: meeting.aiChat,
    }
  },
}

export const liveMeetingAiMockGateway = {
  async sendMeetingAiQuestion(
    request: SendMeetingAiQuestionRequest,
  ): Promise<MeetingAiChatMessageResponse> {
    await waitForMockApi()
    const meeting = requireMeeting(request.meetingId)
    const question = request.question.trim()
    if (!question) {
      throw new MockApiError(400, 'INVALID_AI_QUESTION', '질문을 입력해 주세요.')
    }

    const scenario = liveMeetingMockDb.getScenario(request.meetingId)
    const messageId = `${Date.now()}-${messageSequence++}`
    const userMessage: MeetingAiChatMessageResponse = {
      id: `user-${messageId}`,
      role: 'user',
      content: question,
      context: request.context ? { ...request.context } : null,
    }
    const assistantMessage: MeetingAiChatMessageResponse = {
      id: `assistant-${messageId}`,
      role: 'assistant',
      content: scenario?.aiAnswer ?? '질문에 답변할 수 없습니다.',
      context: request.context ? { ...request.context } : null,
    }

    liveMeetingMockDb.appendMessages(meeting.meetingId, [userMessage, assistantMessage])
    return assistantMessage
  },
}
