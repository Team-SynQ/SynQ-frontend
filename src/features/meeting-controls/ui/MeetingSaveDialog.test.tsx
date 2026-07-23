import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MeetingSaveDialog } from './MeetingSaveDialog'

describe('MeetingSaveDialog', () => {
  it('renders a non-dismissable saving state without buttons', () => {
    render(<MeetingSaveDialog open state="saving" />)

    expect(screen.getByRole('heading', { name: '회의 내용을 저장하고 있습니다.' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders the saved meeting summary and closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <MeetingSaveDialog
        meetingTitle="2차 대면회의"
        onClose={onClose}
        open
        projectTitle="SynQ"
        state="success"
      />,
    )

    expect(screen.getByRole('heading', { name: '회의가 종료되었습니다.' })).toBeInTheDocument()
    expect(screen.getByText('SynQ')).toBeInTheDocument()
    expect(screen.getByText('2차 대면회의')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '저장 완료' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('offers a retry when saving fails', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(<MeetingSaveDialog onRetry={onRetry} open state="failure" />)

    expect(screen.getByText('회의 내용을 저장하지 못했습니다.')).toBeInTheDocument()
    expect(screen.getByText('다시 시도해 주세요.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
