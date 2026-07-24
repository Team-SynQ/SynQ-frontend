import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TranscriptionInterruptedDialog } from './TranscriptionInterruptedDialog'

describe('TranscriptionInterruptedDialog', () => {
  it('omits the drop shadow shown on the standard meeting dialogs', () => {
    render(<TranscriptionInterruptedDialog onClose={vi.fn()} open />)

    expect(screen.getByRole('dialog')).toHaveClass('shadow-none')
  })

  it('renders nothing when closed', () => {
    render(<TranscriptionInterruptedDialog onClose={vi.fn()} open={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the interruption copy and closes from the button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<TranscriptionInterruptedDialog onClose={onClose} open />)

    expect(screen.getByText('전사가 일시 중단되었습니다.')).toBeInTheDocument()
    expect(screen.getByText('연결 상태와 마이크 권한을 확인해 주세요.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
