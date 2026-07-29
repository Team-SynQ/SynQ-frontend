import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MeetingExitDialog } from './MeetingExitDialog'

describe('MeetingExitDialog', () => {
  it.each([
    ['leave' as const, '회의를 나가시겠어요?', '나가기'],
    ['end' as const, '회의를 종료할까요?', '종료하기'],
  ])('renders the %s mode copy', (mode, title, confirmLabel) => {
    render(<MeetingExitDialog mode={mode} onCancel={vi.fn()} onConfirm={vi.fn()} open />)

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: confirmLabel })).toBeInTheDocument()
    expect(screen.getByText('회의 내용은 프로젝트에 저장됩니다.')).toBeInTheDocument()
    expect(screen.getByText('상세 회의 정리 기능은 추후 제공될 예정입니다.')).toBeInTheDocument()
  })

  it('calls cancel and confirm actions', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()

    render(<MeetingExitDialog mode="end" onCancel={onCancel} onConfirm={onConfirm} open />)

    await user.click(screen.getByRole('button', { name: '취소' }))
    await user.click(screen.getByRole('button', { name: '종료하기' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
