import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AccountNameEditDialog } from './AccountNameEditDialog'

describe('AccountNameEditDialog', () => {
  it('renders the Figma modal dimensions and unchanged disabled state', () => {
    render(
      <AccountNameEditDialog currentName="홍길동" onCancel={vi.fn()} onSubmit={vi.fn()} open />,
    )

    expect(screen.getByRole('dialog').parentElement).toHaveClass('bg-overlay-dark-60!')
    expect(screen.getByRole('dialog')).toHaveClass('max-w-[380px]!', 'gap-m!', 'px-m!', 'py-l!')
    expect(screen.getByLabelText('이름')).toHaveValue('홍길동')
    expect(screen.getByText('3/20')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toHaveClass('w-[91px]')
    expect(screen.getByRole('button', { name: '이름 변경하기' })).toBeDisabled()
  })

  it('enables submission for a changed name and submits a trimmed value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AccountNameEditDialog currentName="홍길동" onCancel={vi.fn()} onSubmit={onSubmit} open />,
    )

    const input = screen.getByLabelText('이름')
    await user.clear(input)
    await user.type(input, ' 새 이름 ')
    await user.click(screen.getByRole('button', { name: '이름 변경하기' }))

    expect(onSubmit).toHaveBeenCalledWith('새 이름')
  })

  it('limits the name to 20 characters and updates the counter', async () => {
    const user = userEvent.setup()
    render(
      <AccountNameEditDialog currentName="홍길동" onCancel={vi.fn()} onSubmit={vi.fn()} open />,
    )

    const input = screen.getByLabelText('이름')
    await user.clear(input)
    await user.type(input, '가'.repeat(24))

    expect(input).toHaveValue('가'.repeat(20))
    expect(screen.getByText('20/20')).toBeInTheDocument()
  })

  it('closes from the cancel button', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <AccountNameEditDialog currentName="홍길동" onCancel={onCancel} onSubmit={vi.fn()} open />,
    )

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
