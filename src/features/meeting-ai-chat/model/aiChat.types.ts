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
  pinnedContext: AiChatPinnedContext | null
}

export type AiChatActions = {
  onDraftChange: (value: string) => void
  onClearContext: () => void
  onSend: () => void
  onSelectSuggestion: (suggestionId: string) => void
}

export type AiChatDisplayMode = 'docked' | 'floating' | 'launcher'
