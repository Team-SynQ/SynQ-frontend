import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MeetingMoreMenu } from './MeetingMoreMenu'

describe('MeetingMoreMenu', () => {
  it('closes and requests title editing from the menu item', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onEditTitle = vi.fn()

    render(
      <MeetingMoreMenu
        onClose={onClose}
        onEditTitle={onEditTitle}
        open
      />,
    )

    const menu = screen.getByRole('menu', { name: '회의 메뉴' })
    expect(menu).toHaveClass(
      'h-[58px]',
      'w-[165px]',
      'p-[7px]',
      'shadow-[0_4px_8px_rgb(0_0_0/0.08)]',
    )

    const menuItem = screen.getByRole('menuitem', { name: '제목 수정하기' })
    expect(menuItem).toHaveClass(
      'h-[42px]',
      'px-s',
      'typo-body-01',
      'text-fg-secondary',
    )
    expect(screen.getByTestId('meeting-more-menu-icon')).toHaveClass('size-[24px]')

    await user.click(menuItem)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onEditTitle).toHaveBeenCalledTimes(1)
  })
})
