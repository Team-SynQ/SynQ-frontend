/** AI Chat 서버 DTO. Swagger의 AiChatMessageResponse · AiChatHistoryResponse · AiChatWelcomeResponse 기준이다. */

/** 답변 생성 상태. GENERATING이면 answer가 아직 비어 있다. */
export type AiChatStatus = 'GENERATING' | 'COMPLETED' | 'FAILED'

/** 답변이 참조한 근거. 화면에 표시할 자리가 아직 없다. */
export type AiChatSourceDto = {
  type: string
  id: number
  label: string
}

/** 질문과 답변이 한 레코드다. 화면은 이걸 메시지 두 개로 펼쳐 쓴다. */
export type AiChatMessageDto = {
  id: number
  meetingId: number
  clientRequestId: string
  linkedSegmentId?: number | null
  question: string
  answer?: string | null
  status: AiChatStatus
  sources?: AiChatSourceDto[]
  suggestedQuestions?: string[]
  errorCode?: string | null
  errorMessage?: string | null
  createdAt: string
}

export type AiChatSendRequest = {
  question: string
  linkedSegmentId?: number
  clientRequestId: string
}

export type AiChatHistoryResult = {
  messages: AiChatMessageDto[]
  page: number
  size: number
  hasNext: boolean
}

export type AiChatWelcomeResult = {
  welcomeMessage: string
  suggestedQuestions: string[]
}
