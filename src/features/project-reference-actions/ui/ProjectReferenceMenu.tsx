import { useId, useState, type FormEvent, type RefObject } from 'react'

import editIcon from '../../../shared/assets/icons/edit.svg'
import trashIcon from '../../../shared/assets/icons/trash.svg'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'
import { Button, InputBox, OverlayDialog } from '../../../shared/ui'

type ProjectReferenceMenuProps = {
  id: string
  materialName: string
  open: boolean
  onClose: () => void
  onDelete: () => void
  onEditTitle: () => void
  triggerRef?: RefObject<HTMLElement | null>
}

export function ProjectReferenceMenu({
  id,
  materialName,
  open,
  onClose,
  onDelete,
  onEditTitle,
  triggerRef,
}: ProjectReferenceMenuProps) {
  const menuRef = useDismissableLayer<HTMLDivElement>({
    open,
    onDismiss: onClose,
    triggerRef,
  })

  if (!open) return null

  const actions = [
    {
      icon: editIcon,
      iconClassName: 'size-[24px]',
      iconHeight: 24,
      iconWidth: 24,
      label: '제목 수정하기',
      onSelect: onEditTitle,
    },
    {
      icon: trashIcon,
      iconClassName: 'h-[16px] w-[14px]',
      iconHeight: 16,
      iconWidth: 14,
      label: '삭제하기',
      onSelect: onDelete,
    },
  ]

  return (
    <div
      aria-label={`${materialName} 자료 메뉴`}
      className="absolute right-0 top-[calc(100%+8px)] z-30 flex h-[100px] w-[165px] flex-col rounded-[16px] border-stroke-md border-line-default bg-surface-default p-[7px] shadow-[0_4px_8px_rgb(0_0_0/0.08)]"
      id={id}
      ref={menuRef}
      role="menu"
    >
      {actions.map((action) => (
        <button
          className="flex h-[42px] w-full shrink-0 items-center gap-xs border-b border-line-default px-s py-[10px] text-left typo-body-01 text-fg-secondary last:border-b-0 hover:bg-surface-muted"
          key={action.label}
          onClick={() => {
            onClose()
            action.onSelect()
          }}
          role="menuitem"
          type="button"
        >
          <span className="flex size-[24px] shrink-0 items-center justify-center">
            <img
              alt=""
              aria-hidden="true"
              className={action.iconClassName}
              height={action.iconHeight}
              src={action.icon}
              width={action.iconWidth}
            />
          </span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}

type ProjectReferenceEditDialogProps = {
  currentName: string
  open: boolean
  pending?: boolean
  onCancel: () => void
  onConfirm: (nextName: string) => void
}

export function ProjectReferenceEditDialog({
  currentName,
  open,
  pending = false,
  onCancel,
  onConfirm,
}: ProjectReferenceEditDialogProps) {
  const titleId = useId()

  return (
    <OverlayDialog
      className="max-w-[380px]! gap-m! px-m! py-l! shadow-[0_4px_16px_rgb(0_0_0/0.12)]!"
      closeOnEscape={!pending}
      onClose={onCancel}
      open={open}
      titleId={titleId}
    >
      {open ? (
        <ProjectReferenceEditForm
          currentName={currentName}
          key={currentName}
          onCancel={onCancel}
          onConfirm={onConfirm}
          pending={pending}
          titleId={titleId}
        />
      ) : null}
    </OverlayDialog>
  )
}

type ProjectReferenceEditFormProps = Omit<ProjectReferenceEditDialogProps, 'open'> & {
  titleId: string
}

function ProjectReferenceEditForm({
  currentName,
  pending = false,
  onCancel,
  onConfirm,
  titleId,
}: ProjectReferenceEditFormProps) {
  const maxLength = 50
  const [draft, setDraft] = useState(currentName)
  const nextName = draft.trim()
  const canSubmit = nextName.length > 0 && nextName !== currentName

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || pending) return
    onConfirm(nextName)
  }

  return (
    <form className="flex flex-col gap-m" onSubmit={handleSubmit}>
      <h2 className="m-0 text-center typo-title-02 text-fg-primary" id={titleId}>
        자료 제목 수정
      </h2>
      <InputBox
        aria-label="자료 제목"
        autoFocus
        maxLength={maxLength}
        onChange={(event) => setDraft(event.target.value)}
        rightSlot={
          <span className="shrink-0 typo-body-02 text-fg-secondary">
            {draft.length}/{maxLength}
          </span>
        }
        value={draft}
        visualState={draft ? 'filled' : 'default'}
      />
      <ProjectReferenceDialogActions
        cancelWidthClassName="w-[91px]"
        confirmDisabled={!canSubmit}
        confirmLabel="제목 변경하기"
        onCancel={onCancel}
        pending={pending}
      />
    </form>
  )
}

type ProjectReferenceDeleteDialogProps = {
  materialName: string
  open: boolean
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ProjectReferenceDeleteDialog({
  materialName,
  open,
  pending = false,
  onCancel,
  onConfirm,
}: ProjectReferenceDeleteDialogProps) {
  const titleId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pending) onConfirm()
  }

  return (
    <OverlayDialog
      className="max-w-[380px]!"
      closeOnEscape={!pending}
      onClose={onCancel}
      open={open}
      titleId={titleId}
    >
      <form className="flex flex-col gap-l" onSubmit={handleSubmit}>
        <h2
          className="m-0 whitespace-pre-line text-center typo-title-02 text-fg-primary"
          id={titleId}
        >
          {`‘${materialName}’\n자료를 지우시겠습니까?`}
        </h2>
        <ProjectReferenceDialogActions
          cancelWidthClassName="w-[112px]"
          confirmLabel="지우기"
          onCancel={onCancel}
          pending={pending}
        />
      </form>
    </OverlayDialog>
  )
}

type ProjectReferenceDialogActionsProps = {
  cancelWidthClassName: string
  confirmDisabled?: boolean
  confirmLabel: string
  pending: boolean
  onCancel: () => void
}

function ProjectReferenceDialogActions({
  cancelWidthClassName,
  confirmDisabled = false,
  confirmLabel,
  pending,
  onCancel,
}: ProjectReferenceDialogActionsProps) {
  return (
    <div className="flex gap-s">
      <Button
        className={cancelWidthClassName}
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
        disabled={confirmDisabled || pending}
        size="large"
        type="submit"
      >
        {confirmLabel}
      </Button>
    </div>
  )
}
