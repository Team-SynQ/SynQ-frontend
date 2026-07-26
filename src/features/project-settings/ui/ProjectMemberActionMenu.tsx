import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import trashIcon from '../../../shared/assets/icons/trash.svg'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'

const MENU_WIDTH = 164
const MENU_HEIGHT = 58
const MENU_GAP = 8
const VIEWPORT_MARGIN = 16

type MenuPosition = {
  left: number
  top: number
}

type ProjectMemberActionMenuProps = {
  id: string
  memberName: string
  onClose: () => void
  onExport: () => void
  open: boolean
  triggerRef: RefObject<HTMLElement | null>
}

export function ProjectMemberActionMenu({
  id,
  memberName,
  onClose,
  onExport,
  open,
  triggerRef,
}: ProjectMemberActionMenuProps) {
  const [position, setPosition] = useState<MenuPosition>()
  const menuItemRef = useRef<HTMLButtonElement>(null)
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
        spaceBelow >= MENU_HEIGHT + MENU_GAP
          ? triggerRect.bottom + MENU_GAP
          : Math.max(VIEWPORT_MARGIN, triggerRect.top - MENU_HEIGHT - MENU_GAP)

      setPosition({ left, top })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, triggerRef])

  useLayoutEffect(() => {
    if (open && position) menuItemRef.current?.focus()
  }, [open, position])

  if (!open || !position) return null

  return createPortal(
    <div
      aria-label={`${memberName} 멤버 메뉴`}
      className="fixed z-[70] flex h-[58px] w-[164px] rounded-[16px] border-stroke-md border-line-default bg-surface-default p-[7px] shadow-[0_4px_8px_rgb(0_0_0/0.08)]"
      id={id}
      ref={menuRef}
      role="menu"
      style={position}
    >
      <button
        className="flex h-[42px] w-full items-center gap-xs rounded-xs px-s py-[10px] text-left typo-body-01 text-fg-secondary hover:bg-surface-muted active:bg-overlay-dark-08"
        onClick={() => {
          onClose()
          onExport()
        }}
        ref={menuItemRef}
        role="menuitem"
        type="button"
      >
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
        <span>멤버 내보내기</span>
      </button>
    </div>,
    document.body,
  )
}
