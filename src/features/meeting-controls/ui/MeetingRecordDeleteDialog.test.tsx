import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MeetingRecordDeleteDialog } from './MeetingRecordDeleteDialog'

describe('MeetingRecordDeleteDialog', () => {
  it('uses the Figma transparent backdrop and meeting title copy', () => {
    render(
      <MeetingRecordDeleteDialog
        meetingTitle="4차 대면 회의"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open
      />,
    )

    expect(screen.getByRole('dialog').parentElement).toHaveClass('bg-transparent!')
    expect(screen.getByRole('heading')).toHaveTextContent(
      '‘4차 대면 회의’ 회의 기록을 지우시겠습니까?',
    )
    expect(screen.getByRole('button', { name: '취소' })).toHaveClass('w-[112px]')
  })

  it('locks controls and Escape dismissal while deleting', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <MeetingRecordDeleteDialog
        meetingTitle="4차 대면 회의"
        onCancel={onCancel}
        onConfirm={vi.fn()}
        open
        pending
      />,
    )

    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '지우기' })).toBeDisabled()

    await user.keyboard('{Escape}')

    expect(onCancel).not.toHaveBeenCalled()
  })
})
