import { useId, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import editIcon from '../../../shared/assets/icons/edit.svg'
import starIcon from '../../../shared/assets/icons/star.svg'
import trashIcon from '../../../shared/assets/icons/trash.svg'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'
import { Button, OverlayDialog } from '../../../shared/ui'

const MENU_WIDTH = 196
const COMPACT_MENU_HEIGHT = 99
const EXPANDED_MENU_HEIGHT = 142
const MENU_GAP = 8
const VIEWPORT_MARGIN = 16

type MenuPosition = {
  left: number
  top: number
}

export type AccountPerspectiveActionsMenuProps = {
  canSetDefault: boolean
  id: string
  label: string
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
  onSetDefault: () => void
  open: boolean
  triggerRef: RefObject<HTMLElement | null>
}

export function AccountPerspectiveActionsMenu({
  canSetDefault,
  id,
  label,
  onClose,
  onDelete,
  onEdit,
  onSetDefault,
  open,
  triggerRef,
}: AccountPerspectiveActionsMenuProps) {
  const menuHeight = canSetDefault ? EXPANDED_MENU_HEIGHT : COMPACT_MENU_HEIGHT
  const [position, setPosition] = useState<MenuPosition>()
  const firstItemRef = useRef<HTMLButtonElement>(null)
  const menuRef = useDismissableLayer<HTMLDivElement>({
    open,
    onDismiss: onClose,
    triggerRef,
  })

  useLayoutEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const triggerRect = trigger.getBoundingClientRect()
      const left = Math.min(
        Math.max(VIEWPORT_MARGIN, triggerRect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
      )
      const spaceBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_MARGIN
      const top =
        spaceBelow >= menuHeight + MENU_GAP
          ? triggerRect.bottom + MENU_GAP
          : Math.max(VIEWPORT_MARGIN, triggerRect.top - menuHeight - MENU_GAP)

      setPosition({ left, top })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [menuHeight, open, triggerRef])

  useLayoutEffect(() => {
    if (open && position) firstItemRef.current?.focus()
  }, [open, position])

  if (!open || !position) return null

  return createPortal(
    <div
      aria-label={`${label} 역할·관점 메뉴`}
      className={`fixed z-[70] flex w-[196px] flex-col rounded-[16px] border-stroke-md border-line-default bg-surface-default p-xs shadow-[0_4px_8px_rgb(0_0_0/0.08)] ${canSetDefault ? 'h-[142px]' : 'h-[99px]'}`}
      id={id}
      ref={menuRef}
      role="menu"
      style={position}
    >
      {canSetDefault ? (
        <Button
          className="w-full justify-start! rounded-none! border-b border-line-default px-s"
          leftIcon={<img alt="" aria-hidden="true" className="size-[24px]" src={starIcon} />}
          onClick={() => {
            onClose()
            onSetDefault()
          }}
          ref={firstItemRef}
          role="menuitem"
          size="medium"
          variant="basic"
        >
          기본으로 설정하기
        </Button>
      ) : null}
      <Button
        className="w-full justify-start! rounded-none! border-b border-line-default px-s"
        leftIcon={<img alt="" aria-hidden="true" className="size-[24px]" src={editIcon} />}
        onClick={() => {
          onClose()
          onEdit()
        }}
        ref={canSetDefault ? undefined : firstItemRef}
        role="menuitem"
        size="medium"
        variant="basic"
      >
        역할·관점 수정하기
      </Button>
      <Button
        className="w-full justify-start! rounded-none! px-s"
        leftIcon={
          <span className="flex size-[24px] shrink-0 items-center justify-center">
            <img
              alt=""
              aria-hidden="true"
              className="h-[16px] w-[14px]"
              height="16"
              src={trashIcon}
              width="14"
            />
          </span>
        }
        onClick={() => {
          onClose()
          onDelete()
        }}
        role="menuitem"
        size="medium"
        variant="basic"
      >
        삭제하기
      </Button>
    </div>,
    document.body,
  )
}

export type AccountPerspectiveDeleteUnavailableDialogProps = {
  onClose: () => void
  open: boolean
}

export function AccountPerspectiveDeleteUnavailableDialog({
  onClose,
  open,
}: AccountPerspectiveDeleteUnavailableDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <OverlayDialog
      backdropClassName="bg-overlay-dark-60!"
      closeOnEscape
      descriptionId={descriptionId}
      onClose={onClose}
      open={open}
      titleId={titleId}
    >
      <header className="flex flex-col gap-s">
        <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
          역할·관점 삭제 불가
        </h2>
        <p className="m-0 typo-body-01 text-fg-secondary" id={descriptionId}>
          다른 역할·관점을 기본으로 설정한 뒤 삭제해 주세요.
        </p>
      </header>
      <Button fullWidth onClick={onClose} size="large">
        확인
      </Button>
    </OverlayDialog>
  )
}
