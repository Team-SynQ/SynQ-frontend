import { useId } from 'react'

import { OverlayDialog } from '../../../shared/ui'
import type { AccountPerspectiveDraft } from '../model/accountSettings.types'
import { AccountPerspectiveForm } from './AccountPerspectiveForm'

export type AccountPerspectiveAddDialogProps = {
  onCancel: () => void
  onSubmit: (perspective: AccountPerspectiveDraft) => Promise<void> | void
  open: boolean
}

export function AccountPerspectiveAddDialog({
  onCancel,
  onSubmit,
  open,
}: AccountPerspectiveAddDialogProps) {
  const titleId = useId()

  const handleSubmit = async (perspective: AccountPerspectiveDraft) => {
    try {
      await onSubmit(perspective)
    } catch {
      return
    }

    onCancel()
  }

  return (
    <OverlayDialog
      backdropClassName="bg-overlay-dark-60!"
      className="h-[680px] max-w-[460px]! gap-m! overflow-hidden px-m! py-l! shadow-[0_4px_16px_rgb(0_0_0/0.12)]"
      closeOnEscape
      onClose={onCancel}
      open={open}
      titleId={titleId}
    >
      <header className="shrink-0 text-center">
        <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
          새 역할/관점 추가하기
        </h2>
      </header>

      {open ? (
        <AccountPerspectiveForm
          onCancel={onCancel}
          onSubmit={handleSubmit}
          submitLabel="역할·관점 추가하기"
        />
      ) : null}
    </OverlayDialog>
  )
}
