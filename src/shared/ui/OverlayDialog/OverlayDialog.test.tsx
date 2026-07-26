import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { OverlayDialog } from './OverlayDialog'

function DialogFixture({
  initialOpen = true,
  closeOnEscape = false,
  closeOnBackdrop = false,
  onClose = vi.fn(),
}: {
  initialOpen?: boolean
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  onClose?: () => void
}) {
  const [open, setOpen] = useState(initialOpen)

  return (
    <>
      <button onClick={() => setOpen(true)} type="button">
        대화상자 열기
      </button>
      <OverlayDialog
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
        onClose={() => {
          onClose()
          setOpen(false)
        }}
        open={open}
        titleId="dialog-title"
      >
        <h2 id="dialog-title">회의 종료</h2>
        <button type="button">취소</button>
        <button type="button">종료하기</button>
      </OverlayDialog>
    </>
  )
}

describe('OverlayDialog', () => {
  it('uses an unambiguous 20px radius on every corner', () => {
    render(
      <OverlayDialog open titleId="dialog-title">
        <h2 id="dialog-title">회의 종료</h2>
      </OverlayDialog>,
    )

    expect(screen.getByRole('dialog')).toHaveClass('rounded-[20px]')
  })

  it('renders nothing when closed', () => {
    render(
      <OverlayDialog open={false} titleId="dialog-title">
        <h2 id="dialog-title">회의 종료</h2>
      </OverlayDialog>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('exposes dialog semantics and focuses the first control', () => {
    render(<DialogFixture />)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('button', { name: '취소' })).toHaveFocus()
  })

  it('keeps Tab navigation inside the dialog', async () => {
    const user = userEvent.setup()
    render(<DialogFixture />)

    const cancelButton = screen.getByRole('button', { name: '취소' })
    const confirmButton = screen.getByRole('button', { name: '종료하기' })

    await user.tab({ shift: true })
    expect(confirmButton).toHaveFocus()

    await user.tab()
    expect(cancelButton).toHaveFocus()
  })

  it('closes on Escape only when enabled and restores trigger focus', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DialogFixture closeOnEscape initialOpen={false} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: '대화상자 열기' }))
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: '대화상자 열기' })).toHaveFocus()
  })

  it('ignores Escape when closing is disabled', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DialogFixture onClose={onClose} />)
    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes only when the backdrop itself is pressed and backdrop closing is enabled', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = render(<DialogFixture closeOnBackdrop onClose={onClose} />)

    await user.click(screen.getByRole('heading', { name: '회의 종료' }))
    expect(onClose).not.toHaveBeenCalled()

    const backdrop = container.querySelector('.bg-overlay-black-60')
    expect(backdrop).not.toBeNull()
    await user.click(backdrop!)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
