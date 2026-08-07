import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MeetingTutorialFrame } from './MeetingTutorialFrame'

describe('MeetingTutorialFrame', () => {
  it('shows skip before the final tutorial step', () => {
    render(<MeetingTutorialFrame onSkip={vi.fn()} showSkip />)

    expect(screen.getByRole('button', { name: '건너뛰기' })).toBeInTheDocument()
  })

  it('removes skip from the final tutorial step', () => {
    render(<MeetingTutorialFrame onSkip={vi.fn()} showSkip={false} />)

    expect(screen.queryByRole('button', { name: '건너뛰기' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '다시 보지 않기' })).toBeInTheDocument()
  })
})
