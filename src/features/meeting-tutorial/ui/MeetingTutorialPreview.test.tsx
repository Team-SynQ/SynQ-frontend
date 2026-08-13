import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MeetingTutorialPreview } from './MeetingTutorialPreview'

const staticFrames = [
  {
    figmaNodeId: '1961:18027',
    imageSrc: '/assets/images/help-meeting-tutorial-step1.png',
    step: 1,
  },
  {
    figmaNodeId: '1961:18711',
    imageSrc: '/assets/images/help-meeting-tutorial-step2.png',
    step: 2,
  },
  {
    figmaNodeId: '1961:22695',
    imageSrc: '/assets/images/help-meeting-tutorial-step3.png',
    step: 3,
  },
] as const

describe('MeetingTutorialPreview', () => {
  it.each(staticFrames)('renders the Figma capture as the complete $step frame', (frame) => {
    const { container } = render(<MeetingTutorialPreview step={frame.step} />)
    const preview = screen.getByRole('img', { name: `회의 사용법 ${frame.step}단계 안내 화면` })

    expect(preview).toHaveAttribute('data-figma-node-id', frame.figmaNodeId)
    expect(preview).toHaveAttribute('src', frame.imageSrc)
    expect(preview).toHaveAttribute('height', '530')
    expect(preview).toHaveAttribute('width', '880')
    expect(preview).toHaveClass(
      'h-[530px]',
      'w-[880px]',
      'rounded-m',
      'object-cover',
      'shadow-tutorial-preview',
    )
    expect(container.querySelector('[data-meeting-tutorial-step]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-meeting-tutorial-frame]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-overlay-slot]')).not.toBeInTheDocument()
  })
})
