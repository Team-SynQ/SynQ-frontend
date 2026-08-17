import refreshIcon from '../../../shared/assets/icons/refresh.svg'
import { useStickyScrollToBottom } from '../../../shared/lib/useStickyScrollToBottom'
import { Button } from '../../../shared/ui'
import type {
  TranscriptPanelActions,
  TranscriptPanelState,
  TranscriptSegment,
} from '../model/transcript.types'
import { SpeakingIndicator } from './SpeakingIndicator'
import { TranscriptEmptyState } from './TranscriptEmptyState'
import { TranscriptItem } from './TranscriptItem'

export type TranscriptPanelProps = {
  state: TranscriptPanelState
  actions: TranscriptPanelActions
}

const EMPTY_SEGMENTS: TranscriptSegment[] = []

export function TranscriptPanel({ state, actions }: TranscriptPanelProps) {
  const segments = state.kind === 'active' ? state.segments : EMPTY_SEGMENTS
  const isSpeaking = state.kind === 'active' && state.isSpeaking
  const lastSegment = segments[segments.length - 1]
  /**
   * 목록이 길어졌다는 신호. 중간 인식은 같은 id로 글자만 늘어나므로 길이도 함께 본다.
   * 발화 표시가 붙고 빠지는 것도 높이를 바꾼다.
   * 전사 수정·힌트 펼침은 넣지 않는다. 사용자가 그 자리에서 보고 있는 중이라 움직이면 안 된다.
   */
  const { scrollRef, onScroll } = useStickyScrollToBottom<HTMLDivElement>(
    `${segments.length}:${lastSegment?.id ?? ''}:${lastSegment?.text.length ?? 0}:${isSpeaking}`,
  )

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

      <div
        className="min-h-0 overflow-y-auto border-x border-b border-line-default px-l py-m"
        onScroll={onScroll}
        ref={scrollRef}
      >
        {state.kind === 'waiting' ? (
          <TranscriptEmptyState />
        ) : (
          <div
            aria-live="polite"
            aria-relevant="additions text"
            className="flex flex-col gap-s"
            role="log"
          >
            <div aria-label="회의 전사 목록" className="flex flex-col gap-s" role="list">
              {state.segments.map((segment) => {
                const editState = state.editState ?? { status: 'idle' as const }
                const editing = editState.status === 'editing'

                return (
                  <TranscriptItem
                    editState={editState}
                    hintState={state.hintState ?? { status: 'idle' }}
                    isSelected={state.selectedSegmentId === segment.id}
                    key={segment.id}
                    onAskAi={actions.onAskAi}
                    onCancelEdit={actions.onCancelEdit}
                    onCollapseHint={actions.onCollapseHint}
                    onEditDraftChange={actions.onEditDraftChange}
                    onRetryHint={actions.onRetryHint}
                    onSaveEdit={actions.onSaveEdit}
                    meetingStartedAt={state.meetingStartedAt}
                    onSelect={editing ? undefined : actions.onSelectSegment}
                    onStartEdit={actions.onStartEdit}
                    segment={segment}
                  />
                )
              })}
            </div>
            {state.isSpeaking ? <SpeakingIndicator /> : null}
          </div>
        )}
      </div>
    </section>
  )
}
