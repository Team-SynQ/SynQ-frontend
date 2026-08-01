import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { AccountPerspectiveDraft } from '../model/accountSettings.types'
import { AccountPerspectiveAddDialog } from './AccountPerspectiveAddDialog'

describe('AccountPerspectiveAddDialog', () => {
  it('renders the empty Figma state with a disabled add action', () => {
    render(<AccountPerspectiveAddDialog onCancel={vi.fn()} onSubmit={vi.fn()} open />)

    expect(screen.getByRole('dialog', { name: '새 역할/관점 추가하기' })).toHaveClass(
      'h-[680px]',
      'max-w-[460px]!',
    )
    expect(screen.getByRole('button', { name: '기획/운영' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('checkbox', { name: '일정' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: '역할·관점 추가하기' })).toBeDisabled()
  })

  it('submits a selected role and focus then closes', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<DialogHarness onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: '개발/기술' }))
    await user.click(screen.getByRole('checkbox', { name: '기술 리스크' }))
    await user.click(screen.getByRole('button', { name: '역할·관점 추가하기' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        detailRole: undefined,
        focusDescription: '기술 리스크',
        focusTags: ['기술 리스크'],
        icon: '/assets/images/role-dev.png',
        roleLabel: '개발/기술',
      }),
    )
    expect(screen.queryByRole('dialog', { name: '새 역할/관점 추가하기' })).not.toBeInTheDocument()
  })
})

function DialogHarness({
  onSubmit,
}: {
  onSubmit: (perspective: AccountPerspectiveDraft) => Promise<void> | void
}) {
  const [open, setOpen] = useState(true)

  return (
    <AccountPerspectiveAddDialog onCancel={() => setOpen(false)} onSubmit={onSubmit} open={open} />
  )
}
