import { cn } from '../../../shared/lib/cn'
import type { AiChatMessage } from '../model/aiChat.types'
import { AiChatMarkdown } from './AiChatMarkdown'

export type AiChatMessageListProps = {
  messages: AiChatMessage[]
  variant: 'docked' | 'floating'
}

export function AiChatMessageList({ messages, variant }: AiChatMessageListProps) {
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
            // 폭은 패널 기준 상대값으로 잡는다. 고정 px이면 패널이 좁아질 때 말풍선이 밖으로 넘친다.
            'rounded-m p-s break-words whitespace-pre-wrap typo-transcription-body-01',
            variant === 'floating' ? 'max-w-[min(300px,85%)]' : 'max-w-[min(400px,85%)]',
            message.role === 'assistant'
              ? cn(
                  'self-start rounded-bl-none border bg-surface-elevated text-gray-700',
                  variant === 'floating' ? 'border-line-default' : 'border-surface-muted',
                )
              : 'self-end rounded-br-none bg-gray-700 text-fg-inverse',
          )}
          key={message.id}
        >
          {/* 답변만 마크다운으로 해석한다. 사용자가 입력한 질문은 적은 그대로 보여준다. */}
          {message.role === 'assistant' ? (
            <AiChatMarkdown content={message.content} />
          ) : (
            message.content
          )}
        </article>
      ))}
    </div>
  )
}
