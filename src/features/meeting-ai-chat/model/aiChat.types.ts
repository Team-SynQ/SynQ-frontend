import type { AiChatPinnedContext } from '../../../shared/api/contracts/meeting.contracts'

export type AiChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export type AiChatSuggestion = {
  id: string
  label: string
}

export type AiChatViewModel = {
  messages: AiChatMessage[]
  suggestions: AiChatSuggestion[]
  draft: string
  isSending: boolean
  /** 입장 직후 환영 문구·대화 내역을 불러오는 중. 응답이 몇 초 걸린다. */
  isLoading: boolean
  /** 답변을 기다리는 중. 전송 직후이거나 서버가 생성 중이라고 알린 경우다. */
  isAwaitingAnswer: boolean
  /** 초기 로딩 실패. 질문 전송은 막지 않는다. */
  loadError: string | null
  sendError: string | null
  pinnedContext: AiChatPinnedContext | null
}

export type AiChatActions = {
  onDraftChange: (value: string) => void
  onClearContext: () => void
  onSend: () => void
  onSelectSuggestion: (suggestionId: string) => void
  onRetryLoad: () => void
}

export type AiChatDisplayMode = 'docked' | 'floating' | 'launcher'
