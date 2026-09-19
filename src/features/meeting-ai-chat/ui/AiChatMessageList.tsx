import { Button } from '../../../shared/ui'
import { cn } from '../../../shared/lib/cn'
import { useStickyScrollToBottom } from '../../../shared/lib/useStickyScrollToBottom'
import type { AiChatMessage } from '../model/aiChat.types'
import { AiChatMarkdown } from './AiChatMarkdown'
import { AiChatTypingIndicator } from './AiChatTypingIndicator'

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
  const lastMessage = messages[messages.length - 1]
  /**
   * 대화가 길어졌다는 신호. 답변 대기 안내도 목록 아래에 붙어 높이를 바꾼다.
   */
  const { scrollRef, onScroll } = useStickyScrollToBottom<HTMLDivElement>(
    `${messages.length}:${lastMessage?.id ?? ''}:${lastMessage?.content.length ?? 0}:${isAwaitingAnswer}`,
  )

  return (
    <div
      aria-label="AI Chat 메시지"
      aria-live="polite"
      aria-relevant="additions text"
      className={cn(
        'flex min-h-0 min-w-0 flex-col gap-m overflow-y-auto border-x border-line-default bg-surface-muted',
        variant === 'floating' ? 'px-m py-[28px]' : 'p-m',
      )}
      onScroll={onScroll}
      ref={scrollRef}
      role="log"
      tabIndex={0}
    >
      {messages.map((message) => {
        const isAssistant = message.role === 'assistant'
        const sources = isAssistant ? (message.sources ?? []) : []

        return (
          <div
            className={cn(
              // 폭은 패널을 따라간다. 사용자가 패널을 넓히면 말풍선도 넓어져야 빈 공간이 생기지 않는다.
              // 다만 한 줄이 지나치게 길면 읽기 어려워 상한을 둔다.
              'flex min-w-0 flex-col gap-xs',
              variant === 'floating' ? 'max-w-[min(300px,85%)]' : 'max-w-[min(720px,85%)]',
              isAssistant ? 'items-start self-start' : 'items-end self-end',
            )}
            key={message.id}
          >
            <article
              className={cn(
                'min-w-0 rounded-m p-s break-words typo-transcription-body-01',
                // 말풍선 자체에도 상한을 둔다. 바깥 래퍼가 같은 폭을 잡고 있어 값이 어긋나면 안 된다.
                variant === 'floating' ? 'max-w-[min(300px,85%)]' : 'max-w-[min(720px,85%)]',
                // 질문은 입력한 줄바꿈을 살린다. 답변은 마크다운이 구조를 담당하므로 걸지 않는다.
                !isAssistant && 'whitespace-pre-wrap',
                isAssistant
                  ? cn(
                      'rounded-bl-none border bg-surface-elevated text-gray-700',
                      variant === 'floating' ? 'border-line-default' : 'border-surface-muted',
                    )
                  : 'rounded-br-none bg-gray-700 text-fg-inverse',
              )}
            >
              {/* 답변만 마크다운으로 해석한다. 사용자가 입력한 질문은 적은 그대로 보여준다. */}
              {isAssistant ? <AiChatMarkdown content={message.content} /> : message.content}
            </article>

            {/* 어떤 자료를 보고 답했는지 말풍선 아래에 남긴다. 답변 본문과 섞이지 않게 바깥에 둔다. */}
            {sources.length > 0 ? (
              <p className="m-0 px-s typo-caption text-fg-secondary">
                <span className="sr-only">참고 자료: </span>
                {sources.map((source) => source.label).join('  |  ')}
              </p>
            ) : null}
          </div>
        )
      })}

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
          {/* 화면에는 점 애니메이션만 두되, 읽어 주는 문구는 남겨야 무슨 상태인지 알 수 있다. */}
          <span className="sr-only">답변을 생성하고 있습니다…</span>
          <AiChatTypingIndicator />
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
