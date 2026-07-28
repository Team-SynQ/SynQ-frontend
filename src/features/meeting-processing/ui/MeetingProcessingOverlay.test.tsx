import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MeetingProcessingOverlay } from './MeetingProcessingOverlay'
import { MeetingProcessingStatusIcon } from './MeetingProcessingStatusIcon'

describe('meeting processing visuals', () => {
  it('blocks the project view with an accessible loading status only while open', () => {
    const { rerender } = render(<MeetingProcessingOverlay open={false} />)

    expect(
      screen.queryByRole('status', { name: '회의 불러오는 중' }),
    ).not.toBeInTheDocument()

    rerender(<MeetingProcessingOverlay open />)

    expect(screen.getByRole('status', { name: '회의 불러오는 중' })).toHaveClass(
      'fixed',
      'inset-0',
      'bg-overlay-black-60',
    )
  })

  it('announces whether one meeting history row is processing or complete', () => {
    const { rerender } = render(<MeetingProcessingStatusIcon status="processing" />)

    expect(screen.getByRole('status', { name: '회의 기록 정리 중' })).toBeInTheDocument()

    rerender(<MeetingProcessingStatusIcon status="completed" />)

    expect(screen.getByRole('status', { name: '회의 기록 정리 완료' })).toBeInTheDocument()
  })
})
