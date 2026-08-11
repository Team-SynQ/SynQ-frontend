import { requestApiResult } from '../apiRequest'
import { axiosInstance } from '../axiosInstance'
import type {
  AiChatHistoryResult,
  AiChatMessageDto,
  AiChatSendRequest,
  AiChatWelcomeResult,
} from '../contracts/aiChat.contracts'
import type { ApiResponse } from '../contracts/api.contracts'

export const aiChatService = {
  /** 질문을 보낸다. 응답이 GENERATING이면 answer는 아직 비어 있다. */
  sendQuestion: (meetingId: number, request: AiChatSendRequest): Promise<AiChatMessageDto> =>
    requestApiResult(
      axiosInstance.post<ApiResponse<AiChatMessageDto>>(
        `/meetings/${meetingId}/chat-messages`,
        request,
      ),
      'AI 답변을 불러오지 못했습니다.',
    ),

  /** 내 대화 내역. 페이지네이션이며 화면은 첫 페이지만 쓴다. */
  listMessages: (meetingId: number, page?: number, size?: number): Promise<AiChatHistoryResult> =>
    requestApiResult(
      axiosInstance.get<ApiResponse<AiChatHistoryResult>>(`/meetings/${meetingId}/chat-messages`, {
        params: page === undefined && size === undefined ? undefined : { page, size },
      }),
      'AI 대화 내역을 불러오지 못했습니다.',
    ),

  /** 초기 안내 문구와 추천 질문. */
  getWelcome: (meetingId: number): Promise<AiChatWelcomeResult> =>
    requestApiResult(
      axiosInstance.get<ApiResponse<AiChatWelcomeResult>>(
        `/meetings/${meetingId}/chat-messages/suggestions`,
      ),
      'AI Chat 추천 질문을 불러오지 못했습니다.',
    ),
}
