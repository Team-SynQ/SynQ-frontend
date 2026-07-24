import refreshIcon from '../../../shared/assets/icons/refresh.svg'
import { Button } from '../../../shared/ui'
import type {
  TranscriptPanelActions,
  TranscriptPanelState,
} from '../model/transcript.types'
import { SpeakingIndicator } from './SpeakingIndicator'
import { TranscriptEmptyState } from './TranscriptEmptyState'
import { TranscriptItem } from './TranscriptItem'

export type TranscriptPanelProps = {
  state: TranscriptPanelState
  actions: TranscriptPanelActions
}

export function TranscriptPanel({ state, actions }: TranscriptPanelProps) {
  return (
    <section
      aria-labelledby="meeting-transcript-title"
      className="grid min-h-0 grid-rows-[60px_minmax(0,1fr)] bg-surface-default"
    >
      <header className="flex items-center justify-between border border-line-default bg-surface-elevated px-l">
        <h1 className="m-0 typo-title-02 text-gray-700" id="meeting-transcript-title">
          전체 전사
        </h1>
        <Button
          aria-label="전체 전사 새로고침"
          className="size-[32px] px-0!"
          onClick={actions.onRefresh}
          size="small"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={refreshIcon} />
        </Button>
      </header>

      <div className="min-h-0 overflow-y-auto border-x border-b border-line-default px-l py-m">
        {state.kind === 'waiting' ? (
          <TranscriptEmptyState />
        ) : (
          <div aria-live="polite" aria-relevant="additions text" className="flex flex-col gap-s" role="log">
            {state.segments.map((segment) => (
              <TranscriptItem
                key={segment.id}
                onSelect={actions.onSelectSegment}
                segment={segment}
              />
            ))}
            {state.isSpeaking ? <SpeakingIndicator /> : null}
          </div>
        )}
      </div>
    </section>
  )
}
