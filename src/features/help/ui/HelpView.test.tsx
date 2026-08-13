import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { HelpView } from './HelpView'

describe('HelpView', () => {
  it('renders the readable SynQ introduction state', () => {
    render(<HelpView />)

    expect(screen.getByRole('heading', { name: '도움말' })).toBeInTheDocument()

    const introductionTab = screen.getByRole('tab', { name: 'SynQ 소개 다시보기' })
    const meetingTab = screen.getByRole('tab', { name: '회의 사용법 다시보기' })
    expect(introductionTab).toHaveAttribute('aria-selected', 'true')
    expect(introductionTab).toHaveClass('font-semibold!', 'typo-title-02', 'text-fg-primary')
    expect(meetingTab).toHaveClass('font-normal!', 'typo-title-02', 'text-fg-secondary')

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
    expect(boardFrame).toHaveClass('h-[530px]', 'w-[880px]', 'rounded-m')
    expect(boardFrame?.className).not.toContain('shadow')
    expect(imageScrollRegion).toHaveClass('flex-1', 'overflow-y-auto', 'pt-[44px]')
    // 설정 패널이 사라진 뒤에는 부모의 items-center로 콘텐츠 영역 가운데에 정렬됩니다.
    expect(helpContent).toHaveClass('w-[880px]')
    expect(helpContent?.className).not.toContain('ml-[168px]')
    expect(helpContent?.className).not.toContain('self-start')
    expect(imageScrollRegion).not.toContainElement(introductionTitle.parentElement)
    expect(imageScrollRegion).not.toContainElement(screen.getByRole('status'))
    expect(imageScrollRegion).not.toContainElement(screen.getByRole('button', { name: '다음' }))
  })

  it('switches tabs and advances the meeting tutorial frame', async () => {
    const user = userEvent.setup()
    const renderMeetingTutorial = vi.fn((step: number) => (
      <div aria-label={`회의 사용법 ${step}단계 프레임`} role="img" />
    ))
    render(<HelpView renderMeetingTutorial={renderMeetingTutorial} />)

    const meetingTab = screen.getByRole('tab', { name: '회의 사용법 다시보기' })
    await user.click(meetingTab)

    expect(meetingTab).toHaveAttribute('aria-selected', 'true')
    expect(meetingTab).toHaveClass('font-semibold!', 'text-fg-primary')
    expect(screen.getByRole('tab', { name: 'SynQ 소개 다시보기' })).toHaveClass(
      'font-normal!',
      'text-fg-secondary',
    )
    const meetingFrame = screen.getByRole('img', { name: '회의 사용법 1단계 프레임' })
    expect(meetingFrame).toBeInTheDocument()
    expect(meetingFrame.parentElement?.parentElement).toHaveClass('w-[880px]')
    expect(
      screen.getByRole('heading', { name: '놓치지 않도록, 회의는 함께 기록돼요' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다음' }))

    expect(screen.getByRole('img', { name: '회의 사용법 2단계 프레임' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '중요한 발화는 더 깊게 이해할 수 있어요' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAccessibleName('2/3 단계')
    expect(renderMeetingTutorial).toHaveBeenLastCalledWith(2)
  })
})
