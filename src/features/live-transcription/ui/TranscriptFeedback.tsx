import { Button } from '../../../shared/ui'

export type TranscriptFeedbackProps = {
  message: string
  onRetry?: () => void
}

export function TranscriptFeedback({ message, onRetry }: TranscriptFeedbackProps) {
  return (
    <div
      className="flex min-h-[42px] items-center justify-between gap-s rounded-m border border-line-default bg-overlay-dark-02 px-s py-xs typo-body-02 text-fg-secondary"
      role="alert"
    >
      <span>{message}</span>
      {onRetry ? (
        <Button onClick={onRetry} size="small" variant="fillGray100">
          다시 시도
        </Button>
      ) : null}
    </div>
  )
}
