import { useState, type RefObject } from 'react'

import type { MeetingParticipant } from '../model/meetingControls.types'
import { cn } from '../../../shared/lib/cn'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'

/**
 * 프로필 이미지가 있으면 그리고, 없거나 불러오지 못하면 이름 첫 글자로 대신한다.
 * 실패 폴백이 없으면 src가 깨졌을 때 alt=""인 빈 이미지가 자리만 차지해 프로필이 비어 보인다.
 */
function ParticipantAvatar({ participant }: { participant: MeetingParticipant }) {
  const [failed, setFailed] = useState(false)

  if (participant.avatarSrc && !failed) {
    return (
      <img
        alt=""
        className="size-[24px] shrink-0 rounded-full object-cover"
        data-testid={`participant-avatar-${participant.id}`}
        onError={() => setFailed(true)}
        src={participant.avatarSrc}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-[24px] shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-semibold text-brand-primary"
      data-testid={`participant-avatar-${participant.id}`}
    >
      {participant.name.slice(0, 1)}
    </span>
  )
}

type MeetingParticipantsPopoverProps = {
  open: boolean
  participants: MeetingParticipant[]
  onClose: () => void
  triggerRef?: RefObject<HTMLElement | null>
  className?: string
  id?: string
}

export function MeetingParticipantsPopover({
  open,
  participants,
  onClose,
  triggerRef,
  className,
  id = 'meeting-participants-popover',
}: MeetingParticipantsPopoverProps) {
  const popoverRef = useDismissableLayer<HTMLDivElement>({
    open,
    onDismiss: onClose,
    triggerRef,
  })

  if (!open) return null

  return (
    <div
      aria-label="회의 참여자"
      className={cn(
        'absolute left-0 top-[calc(100%+8px)] z-30 w-[330px] overflow-hidden rounded-m border-stroke-md border-line-default bg-surface-default p-xs shadow-[0_4px_8px_rgb(0_0_0/0.08)]',
        className,
      )}
      id={id}
      ref={popoverRef}
      role="list"
    >
      {participants.map((participant, index) => (
        <div
          className={cn(
            'flex h-[42px] items-center gap-l px-s',
            index < participants.length - 1 && 'border-b border-line-default',
          )}
          key={participant.id}
          role="listitem"
        >
          <div
            className="flex w-[226px] shrink-0 items-center gap-xs"
            data-testid={`participant-info-${participant.id}`}
          >
            <ParticipantAvatar participant={participant} />

            <span className="min-w-0 truncate typo-body-01 text-fg-secondary">
              {participant.name}
              {participant.isCurrentUser ? ' (you)' : ''}
            </span>

            {participant.isHost ? (
              <span className="flex h-[24px] shrink-0 items-center justify-center rounded-xs bg-primary-100 px-xs typo-body-02 text-brand-primary">
                진행자
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
