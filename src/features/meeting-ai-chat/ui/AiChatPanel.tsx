import minimizeIcon from '../../../shared/assets/icons/minimize.svg'
import { Button } from '../../../shared/ui'
import type { AiChatActions, AiChatViewModel } from '../model/aiChat.types'
import { AiChatComposer } from './AiChatComposer'
import { AiChatMessageList } from './AiChatMessageList'

export type AiChatPanelProps = {
  model: AiChatViewModel
  actions: AiChatActions
}

export function AiChatPanel({ model, actions }: AiChatPanelProps) {
  return (
    <aside
      aria-labelledby="meeting-ai-chat-title"
      className="grid min-h-0 grid-rows-[60px_minmax(0,1fr)_auto] bg-surface-elevated"
    >
      <header className="flex items-center justify-between border border-line-default px-m">
        <h2 className="m-0 typo-title-02 text-gray-700" id="meeting-ai-chat-title">
          AI Chat
        </h2>
        <Button
          aria-label="AI Chat 최소화"
          className="size-[32px] px-0!"
          onClick={actions.onMinimize}
          size="small"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={minimizeIcon} />
        </Button>
      </header>

      <AiChatMessageList messages={model.messages} />
      <AiChatComposer actions={actions} model={model} />
    </aside>
  )
}
