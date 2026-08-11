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
      {/*
        서버가 주는 추천 질문은 한 줄에 안 들어갈 만큼 길다. 버튼은 디자인 시스템의 고정 높이를
        유지해야 하므로, 폭을 채우고 넘치는 문구는 말줄임한다. 누르면 입력창에 전문이 들어간다.
      */}
      <div className="flex min-w-0 flex-col items-stretch gap-xs">
        {model.suggestions.map((suggestion) => (
          <Button
            fullWidth
            key={suggestion.id}
            onClick={() => actions.onSelectSuggestion(suggestion.id)}
            size="medium"
            title={suggestion.label}
            variant="primaryLine"
          >
            <span className="min-w-0 truncate">{suggestion.label}</span>
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
