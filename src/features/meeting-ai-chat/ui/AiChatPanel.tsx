import type { Ref } from 'react'

import collapseIcon from '../../../shared/assets/icons/collapse.svg'
import maximizeIcon from '../../../shared/assets/icons/maximize.svg'
import minimizeIcon from '../../../shared/assets/icons/minimize.svg'
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'
import type { AiChatActions, AiChatViewModel } from '../model/aiChat.types'
import { AiChatComposer } from './AiChatComposer'
import { AiChatMessageList } from './AiChatMessageList'
import { AiChatPinnedContext } from './AiChatPinnedContext'

export type AiChatContentProps = {
  model: AiChatViewModel
  actions: AiChatActions
  composerInputRef?: Ref<HTMLInputElement>
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
  const {
    model,
    actions,
    variant,
    actionButtonRef,
    collapseButtonRef,
    composerInputRef,
    onCollapse,
  } = props
  const floating = variant === 'floating'
  const resizeLabel = floating ? 'AI Chat 창 확장' : 'AI Chat 창 축소'
  const resizeIcon = floating ? maximizeIcon : minimizeIcon
  const onResize = floating ? props.onMaximize : props.onMinimize

  return (
    <aside
      aria-labelledby="meeting-ai-chat-title"
      className={cn(
        // 열을 지정하지 않으면 암묵적 열이 auto가 되어 자식들의 최소 콘텐츠 폭 아래로 줄지 않는다.
        // 중간 모드(400px)에서 내용이 패널 밖으로 밀려 헤더 버튼과 추천 질문이 잘렸다.
        'grid h-full min-h-0 grid-cols-[minmax(0,1fr)] bg-surface-elevated',
        model.pinnedContext
          ? 'grid-rows-[60px_auto_minmax(0,1fr)_auto]'
          : 'grid-rows-[60px_minmax(0,1fr)_auto]',
        floating && 'overflow-hidden rounded-m',
      )}
    >
      <header className="flex min-w-0 items-center justify-between border border-line-default px-m">
        <h2 className="m-0 min-w-0 truncate typo-title-02 text-gray-700" id="meeting-ai-chat-title">
          AI Chat
        </h2>
        <div className="flex shrink-0 items-center gap-xs">
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

      {model.pinnedContext ? (
        <AiChatPinnedContext context={model.pinnedContext} onClear={actions.onClearContext} />
      ) : null}
      <AiChatMessageList
        isAwaitingAnswer={model.isAwaitingAnswer}
        isLoading={model.isLoading}
        loadError={model.loadError}
        messages={model.messages}
        onRetryLoad={actions.onRetryLoad}
        variant={variant}
      />
      <AiChatComposer actions={actions} inputRef={composerInputRef} model={model} />
    </aside>
  )
}
