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

    await user.click(screen.getByRole('button', { name: '참여자 4명 확인' }))
    const trigger = screen.getByRole('button', { name: '참여자 4명 확인' })
    const participantList = screen.getByRole('list', { name: '회의 참여자' })
    expect(trigger).toHaveAttribute('aria-controls', participantList.id)
    expect(screen.getByText('윤금서/Design (you)')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('list', { name: '회의 참여자' })).not.toBeInTheDocument()
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
