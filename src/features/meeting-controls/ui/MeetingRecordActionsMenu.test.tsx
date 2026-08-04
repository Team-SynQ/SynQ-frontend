import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MeetingRecordActionsMenu } from './MeetingRecordActionsMenu'

function createRect({
  bottom,
  left,
  right,
  top,
}: {
  bottom: number
  left: number
  right: number
  top: number
}): DOMRect {
  return {
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
    toJSON: () => ({}),
  }
}

describe('MeetingRecordActionsMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders in a portal and flips above a trigger near the viewport bottom', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    const trigger = document.createElement('button')
    document.body.append(trigger)
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(
      createRect({ bottom: 784, left: 1200, right: 1224, top: 760 }),
    )

    render(
      <MeetingRecordActionsMenu
        meetingTitle="4차 대면 회의"
        onDelete={vi.fn()}
        onDismiss={vi.fn()}
        onEditTitle={vi.fn()}
        open
        triggerRef={{ current: trigger }}
      />,
    )

    expect(screen.getByRole('menu')).toHaveClass('fixed')
    expect(screen.getByRole('menu')).toHaveStyle({
      left: '1059px',
      top: '652px',
    })
    expect(screen.getByRole('menuitem', { name: '제목 수정하기' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '기록 삭제하기' })).toBeInTheDocument()
  })

  it('dismisses on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    const trigger = document.createElement('button')
    document.body.append(trigger)
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(
      createRect({ bottom: 124, left: 100, right: 124, top: 100 }),
    )
    const onDismiss = vi.fn()

    render(
      <MeetingRecordActionsMenu
        meetingTitle="4차 대면 회의"
        onDelete={vi.fn()}
        onDismiss={onDismiss}
        onEditTitle={vi.fn()}
        open
        triggerRef={{ current: trigger }}
      />,
    )

    await user.keyboard('{Escape}')

    expect(onDismiss).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => expect(trigger).toHaveFocus())
  })

  it('focuses the first action and supports arrow-key selection', async () => {
    const user = userEvent.setup()
    const trigger = document.createElement('button')
    document.body.append(trigger)
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(
      createRect({ bottom: 124, left: 100, right: 124, top: 100 }),
    )
    const onDelete = vi.fn()

    render(
      <MeetingRecordActionsMenu
        meetingTitle="4차 대면 회의"
        onDelete={onDelete}
        onDismiss={vi.fn()}
        onEditTitle={vi.fn()}
        open
        triggerRef={{ current: trigger }}
      />,
    )

    expect(screen.getByRole('menuitem', { name: '제목 수정하기' })).toHaveFocus()

    await user.keyboard('{ArrowDown}{Enter}')

    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
