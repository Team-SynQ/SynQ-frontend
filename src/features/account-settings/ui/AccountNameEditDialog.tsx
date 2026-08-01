import { useId, useState, type FormEvent } from 'react'

import { Button, InputBox, OverlayDialog } from '../../../shared/ui'

const ACCOUNT_NAME_MAX_LENGTH = 20

export type AccountNameEditDialogProps = {
  currentName: string
  onCancel: () => void
  onSubmit: (name: string) => Promise<void> | void
  open: boolean
}

export function AccountNameEditDialog({
  currentName,
  onCancel,
  onSubmit,
  open,
}: AccountNameEditDialogProps) {
  const titleId = useId()

  return (
    <OverlayDialog
      backdropClassName="bg-overlay-dark-60!"

      className="max-w-[380px]! gap-m! px-m! py-l! shadow-[0_4px_16px_rgb(0_0_0/0.12)]"
      closeOnEscape
      onClose={onCancel}
      open={open}
      titleId={titleId}
    >
      {open ? (
        <AccountNameEditForm
          currentName={currentName}
          key={currentName}
          onCancel={onCancel}
          onSubmit={onSubmit}
          titleId={titleId}
        />
      ) : null}
    </OverlayDialog>
  )
}

type AccountNameEditFormProps = Omit<AccountNameEditDialogProps, 'open'> & {
  titleId: string
}

function AccountNameEditForm({
  currentName,
  onCancel,
  onSubmit,
  titleId,
}: AccountNameEditFormProps) {
  const [draft, setDraft] = useState(currentName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const normalizedDraft = draft.trim()
  const canSubmit =
    normalizedDraft.length > 0 &&
    draft.length <= ACCOUNT_NAME_MAX_LENGTH &&
    normalizedDraft !== currentName.trim() &&
    !isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      await onSubmit(normalizedDraft)
    } catch {
      // Keep the modal open so the user can retry when persistence fails.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="text-center">
        <h2 className="typo-title-02 text-fg-primary" id={titleId}>
          이름 변경
        </h2>
      </header>

      <form className="flex w-full flex-col gap-l" onSubmit={(event) => void handleSubmit(event)}>
        <InputBox
          aria-label="이름"
          maxLength={ACCOUNT_NAME_MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          rightSlot={
            <span aria-hidden="true" className="typo-body-02 text-gray-500">
              {draft.length}/{ACCOUNT_NAME_MAX_LENGTH}
            </span>
          }
          size="medium"
          value={draft}
          visualState="filled"
        />

        <div className="flex w-full gap-s">
          <Button
            className="w-[91px]"
            disabled={isSubmitting}
            onClick={onCancel}
            size="large"
            variant="fillGray100"
          >
            취소
          </Button>
          <Button className="min-w-0 flex-1" disabled={!canSubmit} size="large" type="submit">
            이름 변경하기
          </Button>
        </div>
      </form>
    </>
  )
}
