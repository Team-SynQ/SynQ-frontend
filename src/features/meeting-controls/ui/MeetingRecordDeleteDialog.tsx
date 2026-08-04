import { useId, type FormEvent } from 'react'

import { Button, OverlayDialog } from '../../../shared/ui'

type MeetingRecordDeleteDialogProps = {
  meetingTitle: string
  open: boolean
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function MeetingRecordDeleteDialog({
  meetingTitle,
  open,
  pending = false,
  onCancel,
  onConfirm,
}: MeetingRecordDeleteDialogProps) {
  const titleId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pending) onConfirm()
  }

  return (
    <OverlayDialog
      backdropClassName="bg-transparent!"
      className="max-w-[380px] gap-l px-l py-l shadow-[0_4px_16px_rgb(0_0_0/0.12)]"
      closeOnEscape={!pending}
      onClose={pending ? undefined : onCancel}
      open={open}
      titleId={titleId}
    >
      <form aria-busy={pending} className="flex flex-col gap-l" onSubmit={handleSubmit}>
        <h2
          className="m-0 whitespace-pre-line text-center typo-title-02 text-fg-primary"
          id={titleId}
        >
          {`‘${meetingTitle}’\n회의 기록을 지우시겠습니까?`}
        </h2>
        <div className="flex gap-s">
          <Button
            className="w-[112px]"
            disabled={pending}
            onClick={onCancel}
            size="large"
            variant="fillGray100"
          >
            취소
          </Button>
          <Button
            aria-busy={pending}
            className="min-w-0 flex-1"
            disabled={pending}
            size="large"
            type="submit"
          >
            지우기
          </Button>
        </div>
      </form>
    </OverlayDialog>
  )
}
