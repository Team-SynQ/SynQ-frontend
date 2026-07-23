import type { RefObject } from 'react'

import editIcon from '../../../shared/assets/icons/edit.svg'
import { cn } from '../../../shared/lib/cn'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'

type MeetingMoreMenuProps = {
  open: boolean
  onEditTitle: () => void
  onClose: () => void
  triggerRef?: RefObject<HTMLElement | null>
  className?: string
  id?: string
}

export function MeetingMoreMenu({
  open,
  onEditTitle,
  onClose,
  triggerRef,
  className,
  id = 'meeting-more-menu',
}: MeetingMoreMenuProps) {
  const menuRef = useDismissableLayer<HTMLDivElement>({
    open,
    onDismiss: onClose,
    restoreFocusRef: triggerRef,
  })

  if (!open) return null

  const handleEditTitle = () => {
    onClose()
    onEditTitle()
  }

  return (
    <div
      aria-label="회의 메뉴"
      className={cn(
        'absolute right-0 top-[calc(100%+8px)] z-30 h-[58px] w-[165px] rounded-m border-stroke-md border-line-default bg-surface-default p-[7px] shadow-[0_4px_8px_rgb(0_0_0/0.08)]',
        className,
      )}
      id={id}
      ref={menuRef}
      role="menu"
    >
      <button
        className="flex h-[42px] w-full items-center gap-xs rounded-s px-s py-[10px] text-left typo-body-01 text-fg-secondary hover:bg-surface-muted"
        onClick={handleEditTitle}
        role="menuitem"
        type="button"
      >
        <img
          alt=""
          className="size-[24px] shrink-0"
          data-testid="meeting-more-menu-icon"
          src={editIcon}
        />
        <span>제목 수정하기</span>
      </button>
    </div>
  )
}
