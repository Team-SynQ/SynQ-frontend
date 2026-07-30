import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { defaultAccountPerspectives, type AccountPerspective } from '../model/accountSettings.types'
import { AccountPerspectiveEditDialog } from './AccountPerspectiveEditDialog'

const perspective = defaultAccountPerspectives[1]

describe('AccountPerspectiveEditDialog', () => {
  it('renders the current role and focus with an unchanged disabled action', () => {
    render(
      <AccountPerspectiveEditDialog
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        open
        perspective={perspective}
      />,
    )

    expect(screen.getByRole('dialog', { name: '역할/관점 수정하기' })).toHaveClass(
      'h-[680px]',
      'max-w-[460px]!',
    )
    expect(screen.getByRole('button', { name: '데이터/리서치' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('checkbox', { name: '기능 범위' })).toBeChecked()
    expect(screen.getByRole('button', { name: '역할·관점 수정하기' })).toBeDisabled()
  })

  it('closes and shows success feedback after saving resolves', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<DialogHarness onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: '개발/기술' }))
    await user.click(screen.getByRole('checkbox', { name: '기술 리스크' }))
    await user.click(screen.getByRole('button', { name: '역할·관점 수정하기' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          roleLabel: '개발/기술',
          focusTags: ['기능 범위', '기술 리스크'],
          icon: '/assets/images/role-dev.png',
        }),
      ),
    )
    expect(screen.queryByRole('dialog', { name: '역할/관점 수정하기' })).not.toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '설정 저장 성공' })).toHaveTextContent(
      '역할·관점 설정이 저장되었습니다.',
    )
  })

  it('keeps the dialog open and shows error feedback after saving rejects', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('save failed'))
    render(<DialogHarness onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: '개발/기술' }))
    await user.click(screen.getByRole('button', { name: '역할·관점 수정하기' }))

    expect(await screen.findByRole('status', { name: '설정 저장 실패' })).toHaveTextContent(
      '역할·관점 설정을 저장하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(screen.getByRole('dialog', { name: '역할/관점 수정하기' })).toBeInTheDocument()
  })
})

function DialogHarness({
  onSubmit,
}: {
  onSubmit: (perspective: AccountPerspective) => Promise<void> | void
}) {
  const [open, setOpen] = useState(true)

  return (
    <AccountPerspectiveEditDialog
      onCancel={() => setOpen(false)}
      onSubmit={onSubmit}
      open={open}
      perspective={perspective}
    />
  )
}
