import { cn } from '../../../shared/lib/cn'
import type { AiChatMessage } from '../model/aiChat.types'

export type AiChatMessageListProps = {
  messages: AiChatMessage[]
}

export function AiChatMessageList({ messages }: AiChatMessageListProps) {
  return (
    <div
      aria-label="AI Chat 메시지"
      aria-live="polite"
      aria-relevant="additions text"
      className="flex min-h-0 flex-col gap-m overflow-y-auto border-x border-line-default bg-surface-muted p-m"
      role="log"
      tabIndex={0}
    >
      {messages.map((message) => (
        <article
          className={cn(
            'max-w-[400px] rounded-m p-s typo-transcription-body-01',
            message.role === 'assistant'
              ? 'self-start rounded-bl-none border border-surface-muted bg-surface-elevated text-gray-700'
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
