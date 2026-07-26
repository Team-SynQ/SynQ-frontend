import type { Ref } from 'react'

import collapseIcon from '../../../shared/assets/icons/collapse.svg'
import maximizeIcon from '../../../shared/assets/icons/maximize.svg'
import minimizeIcon from '../../../shared/assets/icons/minimize.svg'
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'
import type { AiChatActions, AiChatViewModel } from '../model/aiChat.types'
import { AiChatComposer } from './AiChatComposer'
import { AiChatMessageList } from './AiChatMessageList'

export type AiChatContentProps = {
  model: AiChatViewModel
  actions: AiChatActions
}

export type AiChatPanelProps = AiChatContentProps & {
  onCollapse: () => void
  collapseButtonRef?: Ref<HTMLButtonElement>
} & (
    | {
        variant: 'docked'
        onMinimize: () => void
        actionButtonRef?: Ref<HTMLButtonElement>
      }
    | {
        variant: 'floating'
        onMaximize: () => void
        actionButtonRef?: Ref<HTMLButtonElement>
      }
  )

export function AiChatPanel(props: AiChatPanelProps) {
  const { model, actions, variant, actionButtonRef, collapseButtonRef, onCollapse } = props
  const floating = variant === 'floating'
  const resizeLabel = floating ? 'AI Chat 창 확장' : 'AI Chat 창 축소'
  const resizeIcon = floating ? maximizeIcon : minimizeIcon
  const onResize = floating ? props.onMaximize : props.onMinimize

  return (
    <aside
      aria-labelledby="meeting-ai-chat-title"
      className={cn(
        'grid h-full min-h-0 grid-rows-[60px_minmax(0,1fr)_auto] bg-surface-elevated',
        floating && 'overflow-hidden rounded-m',
      )}
    >
      <header className="flex items-center justify-between border border-line-default px-m">
        <h2 className="m-0 typo-title-02 text-gray-700" id="meeting-ai-chat-title">
          AI Chat
        </h2>
        <div className="flex items-center gap-xs">
          <Button
            aria-label="AI Chat 런처로 축소"
            className="size-[32px] px-0!"
            onClick={onCollapse}
            ref={collapseButtonRef}
            size="small"
            variant="basic"
          >
            <img alt="" aria-hidden="true" className="size-[24px]" src={collapseIcon} />
          </Button>
          <Button
            aria-label={resizeLabel}
            className="size-[32px] px-0!"
            onClick={onResize}
            ref={actionButtonRef}
            size="small"
            variant="basic"
          >
            <img alt="" aria-hidden="true" className="size-[24px]" src={resizeIcon} />
          </Button>
        </div>
      </header>

      <AiChatMessageList messages={model.messages} variant={variant} />
      <AiChatComposer actions={actions} model={model} />
    </aside>
  )
}
