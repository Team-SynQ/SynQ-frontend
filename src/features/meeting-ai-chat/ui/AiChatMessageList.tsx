import { Button } from '../../../shared/ui'
import { cn } from '../../../shared/lib/cn'
import type { AiChatMessage } from '../model/aiChat.types'
import { AiChatMarkdown } from './AiChatMarkdown'

export type AiChatMessageListProps = {
  messages: AiChatMessage[]
  variant: 'docked' | 'floating'
  isLoading?: boolean
  isAwaitingAnswer?: boolean
  loadError?: string | null
  onRetryLoad?: () => void
}

export function AiChatMessageList({
  messages,
  variant,
  isLoading = false,
  isAwaitingAnswer = false,
  loadError = null,
  onRetryLoad,
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
            // 폭은 패널을 따라간다. 사용자가 패널을 넓히면 말풍선도 넓어져야 빈 공간이 생기지 않는다.
            // 다만 한 줄이 지나치게 길면 읽기 어려워 상한을 둔다.
            'rounded-m p-s break-words typo-transcription-body-01',
            variant === 'floating' ? 'max-w-[min(300px,85%)]' : 'max-w-[min(720px,85%)]',
            // 질문은 입력한 줄바꿈을 살린다. 답변은 마크다운이 구조를 담당하므로 걸지 않는다.
            message.role === 'user' && 'whitespace-pre-wrap',
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

      {/* 답변 자리를 비워 두지 않는다. 전송 직후와 서버가 생성 중일 때 모두 여기에 걸린다. */}
      {isAwaitingAnswer ? (
        <p
          className={cn(
            'm-0 self-start rounded-m rounded-bl-none border p-s typo-transcription-body-01 text-fg-secondary',
            variant === 'floating'
              ? 'border-line-default bg-surface-elevated'
              : 'border-surface-muted bg-surface-elevated',
          )}
          role="status"
        >
          답변을 생성하고 있습니다…
        </p>
      ) : null}

      {/* 초기 로딩과 실패는 대화가 비어 있을 때만 안내한다. 기존 대화를 가리지 않는다. */}
      {isLoading && messages.length === 0 ? (
        <p className="m-0 typo-transcription-body-01 text-fg-secondary" role="status">
          AI Chat을 준비하고 있습니다…
        </p>
      ) : null}

      {!isLoading && loadError && messages.length === 0 ? (
        <div className="flex flex-col items-start gap-xs" role="alert">
          <p className="m-0 typo-transcription-body-01 text-fg-secondary">{loadError}</p>
          {onRetryLoad ? (
            <Button onClick={onRetryLoad} size="small" variant="primaryLine">
              다시 시도
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
