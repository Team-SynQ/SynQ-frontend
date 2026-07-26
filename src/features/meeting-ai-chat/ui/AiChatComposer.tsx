import type { Ref } from 'react'

import { Button, ChatInput } from '../../../shared/ui'
import type { AiChatActions, AiChatViewModel } from '../model/aiChat.types'

export type AiChatComposerProps = {
  model: AiChatViewModel
  actions: AiChatActions
  inputRef?: Ref<HTMLInputElement>
}

export function AiChatComposer({ model, actions, inputRef }: AiChatComposerProps) {
  const sendDisabled = model.draft.trim().length === 0 || model.isSending

  return (
    <div className="flex flex-col gap-s border border-line-default bg-surface-elevated p-m">
      <div className="flex flex-col items-start gap-xs">
        {model.suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            onClick={() => actions.onSelectSuggestion(suggestion.id)}
            size="medium"
            variant="primaryLine"
          >
            {suggestion.label}
          </Button>
        ))}
      </div>

      <ChatInput
        aria-label="AI Chat 질문"
        disabled={model.isSending}
        onChange={(event) => actions.onDraftChange(event.target.value)}
        onSend={actions.onSend}
        placeholder="프로젝트의 맥락에 대해 질문하세요."
        sendDisabled={sendDisabled}
        ref={inputRef}
        value={model.draft}
        wrapperClassName="max-w-none"
      />
    </div>
  )
}
