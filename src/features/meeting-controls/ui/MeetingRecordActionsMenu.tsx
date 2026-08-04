import { useCallback, useLayoutEffect, useState, type KeyboardEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import editIcon from '../../../shared/assets/icons/edit.svg'
import trashIcon from '../../../shared/assets/icons/trash.svg'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'

const MENU_WIDTH = 165
const MENU_HEIGHT = 100
const MENU_GAP = 8
const VIEWPORT_PADDING = 8

type MeetingRecordActionsMenuProps = {
  meetingTitle: string
  open: boolean
  onDelete: () => void
  onDismiss: () => void
  onEditTitle: () => void
  triggerRef: RefObject<HTMLElement | null>
}

function getMenuPosition(rect: DOMRect) {
  const left = Math.min(
    Math.max(rect.right - MENU_WIDTH, VIEWPORT_PADDING),
    window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING,
  )
  const below = rect.bottom + MENU_GAP
  const top =
    below + MENU_HEIGHT <= window.innerHeight - VIEWPORT_PADDING
      ? below
      : Math.max(VIEWPORT_PADDING, rect.top - MENU_GAP - MENU_HEIGHT)

  return { left, top }
}

export function MeetingRecordActionsMenu({
  meetingTitle,
  open,
  onDelete,
  onDismiss,
  onEditTitle,
  triggerRef,
}: MeetingRecordActionsMenuProps) {
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const menuRef = useDismissableLayer<HTMLDivElement>({
    open,
    onDismiss,
    triggerRef,
  })
  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (trigger) setPosition(getMenuPosition(trigger.getBoundingClientRect()))
  }, [triggerRef])

  useLayoutEffect(() => {
    if (!open) return

    updatePosition()
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [menuRef, open, updatePosition])

  if (!open) return null

  const actions = [
    {
      icon: editIcon,
      iconClassName: 'size-[24px]',
      label: '제목 수정하기',
      onSelect: onEditTitle,
    },
    {
      icon: trashIcon,
      iconClassName: 'h-[16px] w-[14px]',
      label: '기록 삭제하기',
      onSelect: onDelete,
    },
  ]

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    )
    const currentIndex = items.findIndex((item) => item === document.activeElement)
    let nextIndex: number | undefined

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
        break
      case 'ArrowUp':
        nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = items.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    items[nextIndex]?.focus()
  }

  return createPortal(
    <div
      aria-label={`${meetingTitle} 회의 기록 메뉴`}
      className="fixed z-[70] flex h-[100px] w-[165px] flex-col rounded-[16px] border-stroke-md border-line-default bg-surface-default p-[7px] shadow-[0_4px_8px_rgb(0_0_0/0.08)]"
      onKeyDown={handleMenuKeyDown}
      ref={menuRef}
      role="menu"
      style={position}
    >
      {actions.map((action) => (
        <button
          className="flex h-[42px] w-full shrink-0 items-center gap-xs border-b border-line-default px-s py-[10px] text-left typo-body-01 text-fg-secondary last:border-b-0 hover:bg-surface-muted focus-visible:bg-surface-muted"
          key={action.label}
          onClick={() => {
            onDismiss()
            action.onSelect()
          }}
          role="menuitem"
          type="button"
        >
          <span className="flex size-[24px] shrink-0 items-center justify-center">
            <img alt="" aria-hidden="true" className={action.iconClassName} src={action.icon} />
          </span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>,
    document.body,
  )
}
