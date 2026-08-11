import type {
  GetTranscriptHintRequest,
  LiveMeetingResponse,
  LiveMeetingSnapshotResponse,
  MeetingAiChatMessageResponse,
  SendMeetingAiQuestionRequest,
  TranscriptHintResponse,
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
  /**
   * 전사는 실제 API에서 오지만 힌트 API는 아직 없다. 실제 전사 id는 mock 힌트 목록에 없으므로
   * 알 수 없는 id에는 대표 힌트를 돌려준다. 실제 힌트 API가 붙으면 이 게이트웨이가 통째로 사라진다.
   */
  async getTranscriptHint(request: GetTranscriptHintRequest): Promise<TranscriptHintResponse> {
    await waitForMockApi()
    requireMeeting(request.meetingId)

    const scenario = liveMeetingMockDb.getScenario(request.meetingId)
    const attempt = liveMeetingMockDb.incrementHintAttempt(request.meetingId, request.transcriptId)
    if (scenario && attempt <= scenario.hintFailureCount) {
      throw new MockApiError(503, 'TRANSCRIPT_HINT_LOAD_FAILED', 'SynQ 힌트를 불러오지 못했습니다.')
    }

    const hint =
      liveMeetingMockDb.getHint(request.meetingId, request.transcriptId) ??
      liveMeetingMockDb.getFallbackHint(request.meetingId)
    if (!hint) {
      throw new MockApiError(404, 'TRANSCRIPT_HINT_NOT_FOUND', 'SynQ 힌트가 없습니다.')
    }
    return { ...hint, transcriptId: request.transcriptId }
  },

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
