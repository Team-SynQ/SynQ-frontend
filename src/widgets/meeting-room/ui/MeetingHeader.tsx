import membersIcon from '../../../shared/assets/icons/members.svg'
import moreVerticalIcon from '../../../shared/assets/icons/more-vertical.svg'
import pauseIcon from '../../../shared/assets/icons/pause.svg'
import { formatElapsedTime } from '../../../entities/meeting'
import type {
  MeetingHeaderActions,
  MeetingHeaderViewModel,
} from '../../../entities/meeting'
import { Button, LiveStatus } from '../../../shared/ui'
import type { ReactNode, RefObject } from 'react'

export type MeetingHeaderProps = {
  model: MeetingHeaderViewModel
  actions: MeetingHeaderActions
  participantsOpen: boolean
  participantsTriggerRef?: RefObject<HTMLButtonElement | null>
  participantsPopover?: ReactNode
  moreMenuOpen: boolean
  moreMenuTriggerRef?: RefObject<HTMLButtonElement | null>
  moreMenuPopover?: ReactNode
}

export function MeetingHeader({
  model,
  actions,
  participantsOpen,
  participantsTriggerRef,
  participantsPopover,
  moreMenuOpen,
  moreMenuTriggerRef,
  moreMenuPopover,
}: MeetingHeaderProps) {
  const recordingControlLabel = model.recordingState === 'recording'
    ? '녹음 일시 정지'
    : '녹음 재개'

  return (
    <header className="flex h-[90px] min-w-0 items-center justify-between gap-s bg-surface-elevated px-l py-m">
      <div className="flex min-w-0 items-center gap-s">
        <strong className="max-w-[180px] truncate typo-title-01" title={model.projectTitle}>
          {model.projectTitle}
        </strong>
        <span
          className="max-w-[180px] truncate typo-title-02 text-fg-secondary"
          title={model.meetingTitle}
        >
          {model.meetingTitle}
        </span>
        <div className="relative flex shrink-0">
          <Button
            aria-expanded={participantsOpen}
            aria-controls="meeting-participants-popover"
            aria-haspopup="dialog"
            aria-label={`참여자 ${model.participantCount}명 확인`}
            className="size-[32px] rounded-full! px-0!"
            onClick={actions.onOpenParticipants}
            ref={participantsTriggerRef}
            size="small"
            variant="basic"
          >
            <img alt="" aria-hidden="true" className="size-[32px]" src={membersIcon} />
          </Button>
          {participantsPopover}
        </div>
        <LiveStatus className="h-[32px] border-0 bg-semantic-error-surface px-m font-normal" />
      </div>

      <div className="flex shrink-0 items-center gap-s whitespace-nowrap">
        <time className="p-xs typo-transcription-body-01 text-fg-secondary">
          {formatElapsedTime(model.elapsedSeconds)}
        </time>
        <Button
          aria-label={recordingControlLabel}
          aria-pressed={model.recordingState === 'paused'}
          className="size-[42px] rounded-full px-0!"
          onClick={actions.onToggleRecording}
          size="medium"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[42px]" src={pauseIcon} />
        </Button>
        <Button onClick={actions.onEndMeeting} size="medium">
          {model.isHost ? '회의 종료' : '나가기'}
        </Button>
        <div className="relative flex shrink-0">
          <Button
            aria-expanded={moreMenuOpen}
            aria-controls="meeting-more-menu"
            aria-haspopup="menu"
            aria-label="회의 메뉴 더보기"
            className="size-[32px] px-0!"
            onClick={actions.onOpenMoreMenu}
            ref={moreMenuTriggerRef}
            size="small"
            variant="basic"
          >
            <img alt="" aria-hidden="true" className="size-[24px]" src={moreVerticalIcon} />
          </Button>
          {moreMenuPopover}
        </div>
      </div>
    </header>
  )
}
