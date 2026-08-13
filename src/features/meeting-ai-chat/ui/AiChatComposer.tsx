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
    <div className="flex min-w-0 flex-col gap-s border border-line-default bg-surface-elevated p-m">
      {/*
        서버가 주는 추천 질문은 한 줄에 안 들어갈 만큼 길다. 문구를 자르지 않고 줄바꿈해서 보여 준다.
        공용 Button은 고정 높이와 whitespace-nowrap을 갖고 있어 `!`로 풀어야 한다.
        `cn`이 tailwind-merge가 아니라 같은 속성을 그냥 덧붙이면 어느 쪽이 이길지 보장되지 않는다.
      */}
      <div className="flex min-w-0 flex-col items-stretch gap-xs">
        {model.suggestions.map((suggestion) => (
          <Button
            className="h-auto! min-h-[42px] whitespace-normal! py-xs"
            fullWidth
            key={suggestion.id}
            onClick={() => actions.onSelectSuggestion(suggestion.id)}
            size="medium"
            variant="primaryLine"
          >
            <span className="min-w-0">{suggestion.label}</span>
          </Button>
        ))}
      </div>

      {model.sendError ? (
        <p className="m-0 typo-caption-01 text-status-negative" role="alert">
          {model.sendError}
        </p>
      ) : null}

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
