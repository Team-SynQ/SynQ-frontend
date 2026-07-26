import type {
  GetTranscriptHintRequest,
  LiveMeetingResponse,
  MeetingAiChatMessageResponse,
  SendMeetingAiQuestionRequest,
  TranscriptHintResponse,
  TranscriptSegmentResponse,
  UpdateTranscriptRequest,
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

function requireTranscript(meetingId: string, segmentId: string): TranscriptSegmentResponse {
  requireMeeting(meetingId)
  const segment = liveMeetingMockDb
    .listTranscripts(meetingId)
    ?.find((candidate) => candidate.id === segmentId)
  if (!segment) {
    throw new MockApiError(404, 'TRANSCRIPT_NOT_FOUND', '전사 문장을 찾을 수 없습니다.')
  }
  return segment
}

export const liveMeetingMockService = {
  async joinMeeting(meetingId: string): Promise<LiveMeetingResponse> {
    await waitForMockApi()
    const meeting = requireMeeting(meetingId)
    meeting.transcript.segments =
      liveMeetingMockDb.listTranscripts(meetingId) ?? meeting.transcript.segments
    return meeting
  },

  async listTranscripts(meetingId: string): Promise<TranscriptSegmentResponse[]> {
    await waitForMockApi()
    requireMeeting(meetingId)
    return liveMeetingMockDb.listTranscripts(meetingId) ?? []
  },

  async updateTranscript(request: UpdateTranscriptRequest): Promise<TranscriptSegmentResponse> {
    await waitForMockApi()
    requireTranscript(request.meetingId, request.segmentId)

    const text = request.text
    if (!text.trim()) {
      throw new MockApiError(400, 'INVALID_TRANSCRIPT_TEXT', '전사 내용을 입력해 주세요.')
    }

    const scenario = liveMeetingMockDb.getScenario(request.meetingId)
    if (scenario?.transcriptEditFails) {
      throw new MockApiError(500, 'TRANSCRIPT_UPDATE_FAILED', '전사 내용을 수정하지 못했습니다.')
    }

    const updated = liveMeetingMockDb.updateTranscript(
      request.meetingId,
      request.segmentId,
      text,
      new Date().toISOString(),
    )
    if (!updated) {
      throw new MockApiError(404, 'TRANSCRIPT_NOT_FOUND', '전사 문장을 찾을 수 없습니다.')
    }
    return updated
  },
}

export const liveMeetingAiMockGateway = {
  async getTranscriptHint(request: GetTranscriptHintRequest): Promise<TranscriptHintResponse> {
    await waitForMockApi()
    requireTranscript(request.meetingId, request.transcriptId)

    const scenario = liveMeetingMockDb.getScenario(request.meetingId)
    const attempt = liveMeetingMockDb.incrementHintAttempt(request.meetingId, request.transcriptId)
    if (scenario && attempt <= scenario.hintFailureCount) {
      throw new MockApiError(503, 'TRANSCRIPT_HINT_LOAD_FAILED', 'SynQ 힌트를 불러오지 못했습니다.')
    }

    const hint = liveMeetingMockDb.getHint(request.meetingId, request.transcriptId)
    if (!hint) {
      throw new MockApiError(404, 'TRANSCRIPT_HINT_NOT_FOUND', 'SynQ 힌트가 없습니다.')
    }
    return hint
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
    const timestamp = Date.now()
    const userMessage: MeetingAiChatMessageResponse = {
      id: `user-${timestamp}`,
      role: 'user',
      content: question,
      context: request.context ? { ...request.context } : null,
    }
    const assistantMessage: MeetingAiChatMessageResponse = {
      id: `assistant-${timestamp}`,
      role: 'assistant',
      content: scenario?.aiAnswer ?? '질문에 답변할 수 없습니다.',
      context: request.context ? { ...request.context } : null,
    }

    liveMeetingMockDb.appendMessages(meeting.meetingId, [userMessage, assistantMessage])
    return assistantMessage
  },
}
