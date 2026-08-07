import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MeetingTutorialPage } from './MeetingTutorialPage'

function LiveDestination() {
  const location = useLocation()

  return <div data-route-state={JSON.stringify(location.state)}>회의 화면</div>
}

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/meetings/42/tutorial', state: { projectId: '7' } }]}
    >
      <Routes>
        <Route element={<MeetingTutorialPage />} path="/meetings/:meetingId/tutorial" />
        <Route element={<LiveDestination />} path="/meetings/:meetingId/live" />
      </Routes>
    </MemoryRouter>,
  )
}

const tutorialTargetRects: Record<
  string,
  { height: number; left: number; top: number; width: number }
> = {
  'ai-chat-panel': { height: 936, left: 938, top: 88, width: 502 },
  'record-section-1': { height: 80, left: 250, top: 201, width: 1156 },
  'record-section-2': { height: 80, left: 250, top: 297, width: 1156 },
  'record-section-3': { height: 80, left: 250, top: 393, width: 1156 },
  'record-section-4': { height: 80, left: 250, top: 489, width: 1156 },
  'selected-utterance': { height: 106, left: 32, top: 598, width: 876 },
  'synq-hint': { height: 216, left: 32, top: 712, width: 876 },
  'transcript-1': { height: 126, left: 32, top: 186, width: 876 },
  'transcript-2': { height: 126, left: 32, top: 328, width: 876 },
  'transcript-3': { height: 101, left: 32, top: 470, width: 876 },
}

function createRect({
  height,
  left,
  top,
  width,
}: {
  height: number
  left: number
  top: number
  width: number
}) {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

describe('MeetingTutorialPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    Element.prototype.scrollIntoView = vi.fn()
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      const targetId = this.getAttribute('data-tutorial-target')
      return createRect(
        (targetId ? tutorialTargetRects[targetId] : undefined) ?? {
          height: 1024,
          left: 0,
          top: 0,
          width: 1440,
        },
      )
    })
  })

  afterEach(() => vi.restoreAllMocks())

  it('advances in order and starts the meeting from step three', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('dialog', { name: '회의 튜토리얼 1단계' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다음' }))
    expect(screen.getByRole('dialog', { name: '회의 튜토리얼 2단계' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다음' }))
    expect(screen.getByRole('dialog', { name: '회의 튜토리얼 3단계' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '건너뛰기' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '다시 보지 않기' }))
    await user.click(screen.getByRole('button', { name: '회의 시작하기' }))

    expect(screen.getByText('회의 화면')).toHaveAttribute(
      'data-route-state',
      JSON.stringify({ projectId: '7' }),
    )
    expect(window.localStorage.getItem('synq:meeting-tutorial:hidden')).toBe('true')
  })

  it('keeps the existing skip route before the final step', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '건너뛰기' }))

    expect(screen.getByText('회의 화면')).toBeInTheDocument()
    expect(window.localStorage.getItem('synq:meeting-tutorial:hidden')).toBeNull()
  })
})
