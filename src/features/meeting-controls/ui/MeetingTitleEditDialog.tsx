import { useId, useState, type FormEvent } from 'react'

import { validateMeetingTitle } from '../lib/validateMeetingTitle'
import { Button, OverlayDialog } from '../../../shared/ui'

type MeetingTitleEditDialogProps = {
  open: boolean
  currentTitle: string
  maxLength?: number
  onCancel: () => void
  onSubmit: (title: string) => void
}

export function MeetingTitleEditDialog({
  open,
  currentTitle,
  maxLength = 50,
  onCancel,
  onSubmit,
}: MeetingTitleEditDialogProps) {
  const titleId = useId()

  return (
    <OverlayDialog
      className="max-w-[460px] gap-m px-m py-l shadow-[0_4px_16px_rgb(0_0_0/0.12)]"
      closeOnEscape
      onClose={onCancel}
      open={open}
      titleId={titleId}
    >
      {open ? (
        <MeetingTitleEditForm
          currentTitle={currentTitle}
          key={currentTitle}
          maxLength={maxLength}
          onCancel={onCancel}
          onSubmit={onSubmit}
          titleId={titleId}
        />
      ) : null}
    </OverlayDialog>
  )
}

type MeetingTitleEditFormProps = Omit<MeetingTitleEditDialogProps, 'open'> & {
  titleId: string
}

function MeetingTitleEditForm({
  currentTitle,
  maxLength = 50,
  onCancel,
  onSubmit,
  titleId,
}: MeetingTitleEditFormProps) {
  const [draft, setDraft] = useState(currentTitle)
  const inputId = useId()
  const canSubmit = validateMeetingTitle(draft, currentTitle, maxLength)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(draft.trim())
  }

  return (
    <form className="flex flex-col gap-m" onSubmit={handleSubmit}>
        <header className="text-center">
          <h2 className="typo-title-02 text-fg-primary" id={titleId}>
            회의 제목 수정
          </h2>
        </header>

        <div className="flex flex-col gap-xs">
          <span className="flex items-end justify-between px-xs">
            <label className="typo-body-01 text-fg-primary" htmlFor={inputId}>
              회의 제목
            </label>
            <span className="typo-body-02 text-fg-secondary">최대 {maxLength}자</span>
          </span>
          <input
            className="h-[42px] w-full rounded-m border-stroke-md border-line-default bg-surface-default px-s typo-body-02 text-fg-secondary outline-none transition-colors placeholder:text-fg-tertiary focus:border-brand-primary"
            id={inputId}
            maxLength={maxLength}
            onChange={(event) => setDraft(event.target.value)}
            value={draft}
          />
        </div>

        <div className="mt-xs flex gap-s">
          <Button className="w-[91px]" onClick={onCancel} size="large" variant="fillGray100">
            취소
          </Button>
          <Button className="min-w-0 flex-1" disabled={!canSubmit} size="large" type="submit">
            제목 변경하기
          </Button>
        </div>
    </form>
  )
}
