import chevronDownIcon from '../../../shared/assets/icons/chevron-down.svg'
import { Button } from '../../../shared/ui'
import type { TranscriptHintState } from '../model/transcript.types'
import { TranscriptFeedback } from './TranscriptFeedback'

export type TranscriptHintCardProps = {
  state: Exclude<TranscriptHintState, { status: 'idle' }>
  onRetry?: (transcriptId: string) => void
}

export function TranscriptHintCard({ state, onRetry }: TranscriptHintCardProps) {
  return (
    <article aria-label="SynQ 힌트" className="mt-xs min-h-[106px] rounded-m bg-surface-muted p-s">
      <header className="mb-s flex items-center justify-between gap-s">
        <div className="min-w-0">
          <h3 className="m-0 typo-body-01 text-gray-800">SynQ 힌트</h3>
          {state.status === 'ready' && state.hint.notice ? (
            <p className="m-0 mt-xs typo-caption text-gray-500">{state.hint.notice}</p>
          ) : null}
        </div>
        <Button
          aria-label="SynQ 힌트 접기"
          className="size-[32px] px-0!"
          size="small"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={chevronDownIcon} />
        </Button>
      </header>

      {state.status === 'loading' ? (
        <div className="flex min-h-[58px] items-center justify-center">
          <span className="sr-only">SynQ 힌트를 불러오는 중입니다.</span>
          <span
            aria-hidden="true"
            className="flex size-[32px] items-center justify-center rounded-full bg-surface-elevated"
          >
            <svg
              className="size-[28px] animate-spin motion-reduce:animate-none"
              fill="none"
              viewBox="0 0 28 28"
            >
              <circle
                className="text-line-default"
                cx="14"
                cy="14"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                className="text-brand-primary"
                d="M14 4a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </span>
        </div>
      ) : null}

      {state.status === 'error' ? (
        <TranscriptFeedback
          message={state.message}
          onRetry={onRetry ? () => onRetry(state.transcriptId) : undefined}
        />
      ) : null}

      {state.status === 'ready' ? (
        <div className="flex flex-col gap-xs">
          <HintRow description={state.hint.meaning} label="의미" />
          <HintRow description={state.hint.personalImpact} label="내 영향" />
          <HintRow description={state.hint.teamQuestion} label="팀 질문" />
        </div>
      ) : null}
    </article>
  )
}

function HintRow({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex min-h-[42px] items-center gap-s">
      <span className="flex w-[81px] shrink-0 items-center justify-center rounded-s bg-surface-elevated px-[12px] py-xs typo-body-01 text-fg-primary">
        {label}
      </span>
      <span className="min-w-0 typo-transcription-body-01 text-fg-primary">{description}</span>
    </div>
  )
}
