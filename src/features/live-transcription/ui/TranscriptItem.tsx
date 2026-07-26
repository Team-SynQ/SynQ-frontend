import { formatElapsedTime } from '../../../entities/meeting'
import editIcon from '../../../shared/assets/icons/edit.svg'
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'
import type { TranscriptSegment } from '../model/transcript.types'
import type { TranscriptEditState, TranscriptHintState } from '../model/transcript.types'
import { TranscriptEditor } from './TranscriptEditor'
import { TranscriptHintCard } from './TranscriptHintCard'

export type TranscriptItemProps = {
  segment: TranscriptSegment
  isSelected: boolean
  editState: TranscriptEditState
  hintState: TranscriptHintState
  onSelect?: (segmentId: string) => void
  onAskAi?: (segmentId: string) => void
  onStartEdit?: (segmentId: string) => void
  onEditDraftChange?: (value: string) => void
  onCancelEdit?: () => void
  onCollapseHint?: (segmentId: string) => void
  onSaveEdit?: () => void
  onRetryHint?: (segmentId: string) => void
}

export function TranscriptItem({
  segment,
  isSelected,
  editState,
  hintState,
  onSelect,
  onAskAi,
  onStartEdit,
  onEditDraftChange,
  onCancelEdit,
  onCollapseHint,
  onSaveEdit,
  onRetryHint,
}: TranscriptItemProps) {
  const isEditing = editState.status === 'editing' && editState.transcriptId === segment.id
  const segmentHintState =
    hintState.status !== 'idle' && hintState.transcriptId === segment.id ? hintState : null

  return (
    <article
      aria-label={segment.text}
      aria-selected={isSelected}
      className="flex w-full flex-col gap-xs"
      role="option"
    >
      <div
        className={cn(
          'flex w-full flex-col rounded-m p-s',
          isSelected ? 'bg-surface-muted' : 'bg-transparent',
        )}
      >
        <div className="flex min-h-[32px] items-center justify-between gap-s">
          <div className="flex items-center gap-xs">
            <time className="typo-body-01 text-gray-400">
              {formatElapsedTime(segment.startedAtSeconds)}
            </time>
            {segment.isEdited ? <span className="typo-caption text-gray-500">수정됨</span> : null}
          </div>
          {isSelected && !isEditing ? (
            <div className="flex items-center gap-s">
              <Button
                aria-label="전사 수정"
                className="size-[32px] px-0!"
                onClick={() => onStartEdit?.(segment.id)}
                size="small"
                variant="basic"
              >
                <img alt="" aria-hidden="true" className="size-[24px]" src={editIcon} />
              </Button>
              <Button onClick={() => onAskAi?.(segment.id)} size="small" variant="primaryFill">
                AI에게 질문하기
              </Button>
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <div className="mt-xs">
            <TranscriptEditor
              onCancel={onCancelEdit}
              onChange={onEditDraftChange}
              onSave={onSaveEdit}
              state={editState}
            />
          </div>
        ) : (
          <button
            className="mt-xs w-full text-left typo-transcription-body-01 text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            onClick={() => onSelect?.(segment.id)}
            type="button"
          >
            {segment.text}
          </button>
        )}
      </div>

      {isSelected && !isEditing && segmentHintState ? (
        <TranscriptHintCard
          onCollapse={onCollapseHint}
          onRetry={onRetryHint}
          state={segmentHintState}
        />
      ) : null}
    </article>
  )
}
