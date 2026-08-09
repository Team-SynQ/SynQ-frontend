import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MeetingTutorialNavigation } from './MeetingTutorialNavigation'

describe('MeetingTutorialNavigation', () => {
  it('renders three non-interactive indicators for the current step', () => {
    const { container } = render(
      <MeetingTutorialNavigation onComplete={vi.fn()} onStepChange={vi.fn()} step={2} />,
    )

    expect(screen.getByRole('status', { name: '현재 2 / 3단계' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-tutorial-step-indicator]')).toHaveLength(3)
    expect(container.querySelector('[aria-current="step"]')).toHaveAttribute(
      'data-tutorial-step-indicator',
      '2',
    )
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it.each([
    { currentStep: 1, nextStep: 2 },
    { currentStep: 2, nextStep: 3 },
  ] as const)(
    'advances step $currentStep with the next button',
    async ({ currentStep, nextStep }) => {
      const user = userEvent.setup()
      const onStepChange = vi.fn()

      render(
        <MeetingTutorialNavigation
          onComplete={vi.fn()}
          onStepChange={onStepChange}
          step={currentStep}
        />,
      )

      await user.click(screen.getByRole('button', { name: '다음' }))
      expect(onStepChange).toHaveBeenCalledWith(nextStep)
    },
  )

  it('completes the tutorial from the last step', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(<MeetingTutorialNavigation onComplete={onComplete} onStepChange={vi.fn()} step={3} />)

    await user.click(screen.getByRole('button', { name: '회의 시작하기' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
