import { cn } from '../../../shared/lib/cn'
import type { AiChatMessage } from '../model/aiChat.types'

export type AiChatMessageListProps = {
  messages: AiChatMessage[]
  variant: 'docked' | 'floating'
}

export function AiChatMessageList({
  messages,
  variant,
}: AiChatMessageListProps) {
  return (
    <div
      aria-label="AI Chat 메시지"
      aria-live="polite"
      aria-relevant="additions text"
      className={cn(
        'flex min-h-0 flex-col gap-m overflow-y-auto border-x border-line-default bg-surface-muted',
        variant === 'floating' ? 'px-m py-[28px]' : 'p-m',
      )}
      role="log"
      tabIndex={0}
    >
      {messages.map((message) => (
        <article
          className={cn(
            'rounded-m p-s typo-transcription-body-01',
            variant === 'floating' ? 'max-w-[300px]' : 'max-w-[400px]',
            message.role === 'assistant'
              ? cn(
                  'self-start rounded-bl-none border bg-surface-elevated text-gray-700',
                  variant === 'floating'
                    ? 'border-line-default'
                    : 'border-surface-muted',
                )
              : 'self-end rounded-br-none bg-gray-700 text-fg-inverse',
          )}
          key={message.id}
        >
          {message.content}
        </article>
      ))}
    </div>
  )
}
