import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MeetingTitleEditDialog } from './MeetingTitleEditDialog'

describe('MeetingTitleEditDialog', () => {
  it('uses the Figma title-edit surface and field dimensions', () => {
    render(
      <MeetingTitleEditDialog
        currentTitle="2차 대면회의"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        open
      />,
    )

    expect(screen.getByRole('dialog')).toHaveClass(
      'max-w-[460px]',
      'rounded-[20px]',
      'shadow-[0_4px_16px_rgb(0_0_0/0.12)]',
    )
    expect(screen.getByLabelText('회의 제목')).toHaveClass('h-[42px]', 'rounded-m', 'typo-body-02')
    expect(screen.getByRole('button', { name: '취소' })).toHaveClass('w-[91px]')
  })

  it('initializes from the current title with a disabled submit button', () => {
    render(
      <MeetingTitleEditDialog
        currentTitle="2차 대면회의"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        open
      />,
    )

    expect(screen.getByLabelText('회의 제목')).toHaveValue('2차 대면회의')
    expect(screen.getByRole('button', { name: '제목 변경하기' })).toBeDisabled()
  })

  it('enables submission for a changed title and submits a trimmed value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <MeetingTitleEditDialog
        currentTitle="2차 대면회의"
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        open
      />,
    )

    const input = screen.getByLabelText('회의 제목')
    await user.clear(input)
    await user.type(input, ' 3차 회의 ')

    const submitButton = screen.getByRole('button', { name: '제목 변경하기' })
    expect(submitButton).toBeEnabled()
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith('3차 회의')
  })

  it('limits the title input to 50 characters', () => {
    render(
      <MeetingTitleEditDialog
        currentTitle="2차 대면회의"
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        open
      />,
    )

    expect(screen.getByLabelText('회의 제목')).toHaveAttribute('maxlength', '50')
  })

  it('supports a custom title length limit', () => {
    render(
      <MeetingTitleEditDialog
        currentTitle="2차 대면회의"
        maxLength={30}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        open
      />,
    )

    expect(screen.getByLabelText('회의 제목')).toHaveAttribute('maxlength', '30')
    expect(screen.getByText('최대 30자')).toBeInTheDocument()
  })

  it('resets the draft from the latest current title when reopened', async () => {
    const user = userEvent.setup()
    const props = {
      onCancel: vi.fn(),
      onSubmit: vi.fn(),
    }
    const { rerender } = render(
      <MeetingTitleEditDialog currentTitle="2차 대면회의" open {...props} />,
    )

    const input = screen.getByLabelText('회의 제목')
    await user.clear(input)
    await user.type(input, '임시 제목')

    rerender(<MeetingTitleEditDialog currentTitle="3차 회의" open={false} {...props} />)
    rerender(<MeetingTitleEditDialog currentTitle="3차 회의" open {...props} />)

    expect(screen.getByLabelText('회의 제목')).toHaveValue('3차 회의')
  })

  it('저장 실패 문구를 입력한 제목과 함께 보여 준다', async () => {
    const user = userEvent.setup()

    render(
      <MeetingTitleEditDialog
        currentTitle="2차 대면회의"
        errorMessage="회의 제목을 수정하지 못했습니다."
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        open
      />,
    )

    const input = screen.getByLabelText('회의 제목')
    await user.clear(input)
    await user.type(input, '3차 회의')

    expect(screen.getByRole('alert')).toHaveTextContent('회의 제목을 수정하지 못했습니다.')
    expect(input).toHaveValue('3차 회의')
  })

  it('locks editing and dismissal while a title update is pending', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <MeetingTitleEditDialog
        currentTitle="4차 대면 회의"
        onCancel={onCancel}
        onSubmit={vi.fn()}
        open
        pending
      />,
    )

    expect(screen.getByLabelText('회의 제목')).toBeDisabled()
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '제목 변경하기' })).toBeDisabled()

    await user.keyboard('{Escape}')

    expect(onCancel).not.toHaveBeenCalled()
  })
})
