import infoIcon from '../../../shared/assets/icons/info.svg'
import {
  meetingEntryModalContent,
  type MeetingEntryModalVariant,
} from '../model/meetingEntryModal.config'

import { Modal } from '../../../shared/ui'

export type MeetingEntryModalProps = {
  open?: boolean
  variant: MeetingEntryModalVariant
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}

type NoticeProps = {
  children: string
  bare?: boolean
}

function Notice({ children, bare = false }: NoticeProps) {
  return (
    <div
      className={
        bare
          ? 'flex w-full items-start gap-[10px]'
          : 'flex w-full items-start gap-[10px] rounded-m bg-surface-muted px-s py-[14px]'
      }
    >
      <img alt="" aria-hidden="true" className="size-[24px] shrink-0" src={infoIcon} />
      <p className="m-0 flex-1 typo-transcription-body-01 tracking-[-0.4px] text-fg-secondary">
        {children}
      </p>
    </div>
  )
}

export function MeetingEntryModal({
  open = true,
  variant,
  onPrimaryAction,
  onSecondaryAction,
}: MeetingEntryModalProps) {
  if (!open) return null

  const content = meetingEntryModalContent[variant]
  const isSingleAction = content.actions.secondary === undefined
  const notice = 'notice' in content ? content.notice : undefined
  const description = 'description' in content ? content.description : undefined

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-dark-60 px-s py-m"
      data-meeting-entry-modal={variant}
    >
      <Modal
        cancelLabel={isSingleAction ? content.actions.primary : content.actions.secondary}
        className="shadow-none [&_button]:leading-[1.6] [&_button]:tracking-[-0.8px] [&_h2]:whitespace-pre-line [&_h2]:leading-[1.6] [&_h2]:tracking-[-0.8px] [&>div:first-child>p]:leading-[1.6] [&>div:first-child>p]:tracking-[-0.4px]"
        confirmLabel={content.actions.primary}
        description={description}
        onCancel={isSingleAction ? onPrimaryAction : onSecondaryAction}
        onConfirm={onPrimaryAction}
        title={content.title}
        type={isSingleAction ? 'info' : 'confirm'}
      >
        {notice ? <Notice bare={isSingleAction}>{notice}</Notice> : null}
      </Modal>
    </div>
  )
}
