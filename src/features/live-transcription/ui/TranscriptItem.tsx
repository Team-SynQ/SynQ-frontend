import { formatTranscriptTime } from '../../../entities/meeting'
import editIcon from '../../../shared/assets/icons/edit.svg'
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'
import type { TranscriptSegment } from '../model/transcript.types'
import type { TranscriptEditState, TranscriptHintState } from '../model/transcript.types'
import { TranscriptEditor } from './TranscriptEditor'
import { TranscriptHintCard } from './TranscriptHintCard'

export type TranscriptItemProps = {
  segment: TranscriptSegment
  /** 회의 시작 시각. 있으면 전사 시각을 벽시계로 표시한다. */
  meetingStartedAt?: string | null
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
  meetingStartedAt,
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

  /**
   * 다른 전사를 수정하는 중이면 이 전사의 액션을 감춘다.
   * 액션이 hover로도 열리므로, 열어 두면 작성 중인 초안을 버리고 다른 전사 편집으로 넘어갈 수 있다.
   */
  const isEditingAnySegment = editState.status === 'editing'
  /** 힌트가 있는 전사는 선택하지 않아도 마우스를 올리거나 포커스가 들어오면 액션을 보여 준다. */
  const revealsActionsOnHover = !isSelected && Boolean(segment.hasHint)
  const showsActions =
    !isEditingAnySegment && !segment.isInterim && (isSelected || revealsActionsOnHover)

  return (
    <article aria-label={segment.text} className="flex w-full flex-col gap-xs" role="listitem">
      <div
        className={cn(
          'group flex w-full flex-col rounded-m p-s',
          isSelected ? 'bg-surface-muted' : 'bg-transparent',
        )}
      >
        <div className="flex min-h-[32px] items-center justify-between gap-s">
          <div className="flex items-center gap-xs">
            <time className="typo-body-01 text-gray-400">
              {formatTranscriptTime(segment.startedAtSeconds, meetingStartedAt)}
            </time>
            {segment.isEdited ? <span className="typo-caption text-gray-500">수정됨</span> : null}
            {segment.hasHint ? (
              <span className="typo-caption text-brand-primary">SynQ 힌트</span>
            ) : null}
          </div>
          {showsActions ? (
            <div
              className={cn(
                'items-center gap-s',
                // 포커스로도 열어야 키보드로 쓸 수 있다. 전사 본문 버튼에 탭이 닿으면 함께 뜬다.
                isSelected ? 'flex' : 'hidden group-focus-within:flex group-hover:flex',
              )}
            >
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
            aria-pressed={isSelected}
            className={cn(
              'mt-xs w-full text-left typo-transcription-body-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
              segment.isInterim ? 'text-gray-400' : 'text-fg-primary',
            )}
            disabled={segment.isInterim}
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
