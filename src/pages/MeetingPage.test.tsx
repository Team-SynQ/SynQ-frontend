import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { MeetingPage } from './MeetingPage'

function renderMeetingPage() {
  return render(
    <MemoryRouter initialEntries={['/meetings/demo/live']}>
      <Routes>
        <Route element={<MeetingPage />} path="/meetings/:meetingId/live" />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MeetingPage controls', () => {
  it('opens and dismisses the participant list', async () => {
    const user = userEvent.setup()
    renderMeetingPage()

    const trigger = screen.getByRole('button', { name: '참여자 4명 확인' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    const participantList = screen.getByRole('list', { name: '회의 참여자' })
    expect(trigger).toHaveAttribute('aria-controls', participantList.id)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('윤금서/Design (you)')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('list', { name: '회의 참여자' })).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('closes each popover when its trigger is pressed again', async () => {
    const user = userEvent.setup()
    renderMeetingPage()

    const participantsTrigger = screen.getByRole('button', { name: '참여자 4명 확인' })
    await user.click(participantsTrigger)
    await user.click(participantsTrigger)
    expect(screen.queryByRole('list', { name: '회의 참여자' })).not.toBeInTheDocument()

    const moreMenuTrigger = screen.getByRole('button', { name: '회의 메뉴 더보기' })
    expect(moreMenuTrigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(moreMenuTrigger)
    expect(moreMenuTrigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(moreMenuTrigger)
    expect(screen.queryByRole('menu', { name: '회의 메뉴' })).not.toBeInTheDocument()
    expect(moreMenuTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('edits the meeting title from the more menu', async () => {
    const user = userEvent.setup()
    renderMeetingPage()

    await user.click(screen.getByRole('button', { name: '회의 메뉴 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))

    const dialog = screen.getByRole('dialog', { name: '회의 제목 수정' })
    const titleInput = within(dialog).getByLabelText('회의 제목')
    await user.clear(titleInput)
    await user.type(titleInput, '3차 회의')
    await user.click(within(dialog).getByRole('button', { name: '제목 변경하기' }))

    expect(screen.queryByRole('dialog', { name: '회의 제목 수정' })).not.toBeInTheDocument()
    expect(screen.getByTitle('3차 회의')).toBeInTheDocument()
  })

  it('moves from end confirmation to the saving dialog', async () => {
    const user = userEvent.setup()
    renderMeetingPage()

    await user.click(screen.getByRole('button', { name: '회의 종료' }))
    expect(screen.getByRole('dialog', { name: '회의를 종료할까요?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '종료하기' }))
    expect(screen.getByRole('dialog', { name: '회의 내용을 저장하고 있습니다.' })).toBeInTheDocument()
  })
})
