import type { Ref } from 'react'

import synqSymbolInverse from '../../../shared/assets/logos/synq-symbol-inverse.svg'

export type AiChatLauncherProps = {
  onOpen: () => void
  buttonRef?: Ref<HTMLButtonElement>
}

export function AiChatLauncher({ onOpen, buttonRef }: AiChatLauncherProps) {
  return (
    <button
      aria-label="AI Chat 열기"
      className="flex size-[100px] items-center justify-center rounded-full bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      onClick={onOpen}
      ref={buttonRef}
      type="button"
    >
      <span
        className="pointer-events-none flex size-[80px] items-center justify-center rounded-full bg-gray-800 shadow-ai-chat-launcher"
        data-testid="ai-chat-launcher-surface"
      >
        <img
          alt=""
          aria-hidden="true"
          className="h-[46px] w-[27px]"
          data-testid="ai-chat-launcher-symbol"
          src={synqSymbolInverse}
        />
      </span>
    </button>
  )
}
