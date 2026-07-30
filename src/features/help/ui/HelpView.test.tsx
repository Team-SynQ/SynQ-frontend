import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { HelpView } from './HelpView'

describe('HelpView', () => {
  it('renders the readable help introduction state', () => {
    render(<HelpView />)

    expect(screen.getByRole('heading', { name: '도움말' })).toBeInTheDocument()

    const introductionTab = screen.getByRole('tab', { name: 'SynQ 소개 다시보기' })
    expect(introductionTab).toHaveAttribute('aria-selected', 'true')
    expect(introductionTab).toHaveClass('font-semibold', 'typo-title-02', 'text-[#121212]')

    const introductionTitle = screen.getByRole('heading', {
      name: '회의 중, 이해하지 못한 채 넘어간 순간이 있나요?',
    })
    expect(introductionTitle).toBeInTheDocument()

    const boardImage = screen.getByRole('img', { name: /회의 중, 이해하지 못한 채/ })
    expect(boardImage).toHaveAttribute('src', '/assets/images/onboarding-step1.png')
    expect(boardImage).toHaveAttribute('width', '815')
    expect(boardImage).toHaveAttribute('height', '589')
    expect(boardImage).toHaveStyle({ height: '589px', width: '815px' })

    const boardClip = boardImage.parentElement
    const boardFrame = boardClip?.parentElement
    const imageScrollRegion = boardFrame?.parentElement
    const helpContent = imageScrollRegion?.parentElement
    expect(boardClip).toHaveClass('overflow-hidden', 'rounded-m')
    expect(boardFrame).toHaveClass('h-[530px]', 'w-[760px]', 'rounded-m')
    expect(boardFrame?.className).not.toContain('shadow')
    expect(imageScrollRegion).toHaveClass('flex-1', 'overflow-y-auto', 'pt-[44px]')
    expect(helpContent).toHaveClass('ml-[168px]', 'w-[760px]', 'self-start')
    expect(imageScrollRegion).not.toContainElement(introductionTitle.parentElement)
    expect(imageScrollRegion).not.toContainElement(screen.getByRole('status'))
    expect(imageScrollRegion).not.toContainElement(screen.getByRole('button', { name: '다음' }))
    expect(imageScrollRegion?.closest('section')).toHaveClass('gap-s')

    expect(screen.getByRole('button', { name: '다음' })).toHaveClass('w-[375px]')
  })

  it('restarts the introduction and delegates the meeting tutorial tab', async () => {
    const user = userEvent.setup()
    const onOpenMeetingTutorial = vi.fn()
    render(<HelpView onOpenMeetingTutorial={onOpenMeetingTutorial} />)

    await user.click(screen.getByRole('button', { name: '다음' }))
    expect(
      screen.getByRole('heading', {
        name: '회의의 흐름을 놓치지 않고 바로 질문하세요',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAccessibleName('2/3 단계')

    await user.click(screen.getByRole('tab', { name: 'SynQ 소개 다시보기' }))
    expect(
      screen.getByRole('heading', {
        name: '회의 중, 이해하지 못한 채 넘어간 순간이 있나요?',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: '회의 사용법 다시보기' }))
    expect(onOpenMeetingTutorial).toHaveBeenCalledOnce()
  })
})
