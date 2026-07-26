import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { resetLiveMeetingMockDb } from '../shared/api/mock/db/liveMeeting.mockDb'
import { MeetingPage } from './MeetingPage'

async function renderMeetingPage(path = '/meetings/demo/live') {
  const result = render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<MeetingPage />} path="/meetings/:meetingId/live" />
      </Routes>
    </MemoryRouter>,
  )

  await screen.findByRole('button', { name: '참여자 4명 확인' })
  return result
}

describe('MeetingPage controls', () => {
  beforeEach(() => {
    resetLiveMeetingMockDb()
  })

  it('opens and dismisses the participant list', async () => {
    const user = userEvent.setup()
    await renderMeetingPage()

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
    await renderMeetingPage()

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
    await renderMeetingPage()

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
    await renderMeetingPage()

    await user.click(screen.getByRole('button', { name: '회의 종료' }))
    expect(screen.getByRole('dialog', { name: '회의를 종료할까요?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '종료하기' }))
    expect(
      screen.getByRole('dialog', { name: '회의 내용을 저장하고 있습니다.' }),
    ).toBeInTheDocument()
  })

  it('moves between docked and floating while preserving the draft', async () => {
    const user = userEvent.setup()
    const { container } = await renderMeetingPage()

    const root = container.querySelector('[data-ai-chat-mode]')
    const input = screen.getByRole('textbox', { name: 'AI Chat 질문' })

    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')

    await user.type(input, '회의 범위 질문')
    await user.click(screen.getByRole('button', { name: 'AI Chat 창 축소' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'floating')
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('회의 범위 질문')

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 확장' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('회의 범위 질문')
  })

  it('returns launcher to its entry mode while preserving the draft', async () => {
    const user = userEvent.setup()
    const { container } = await renderMeetingPage()
    const root = container.querySelector('[data-ai-chat-mode]')

    await user.type(screen.getByRole('textbox', { name: 'AI Chat 질문' }), '런처 왕복 질문')
    await user.click(screen.getByRole('button', { name: 'AI Chat 런처로 축소' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'launcher')
    await user.click(screen.getByRole('button', { name: 'AI Chat 열기' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('런처 왕복 질문')

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 축소' }))
    await user.click(screen.getByRole('button', { name: 'AI Chat 런처로 축소' }))
    await user.click(screen.getByRole('button', { name: 'AI Chat 열기' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'floating')
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('런처 왕복 질문')
  })

  it('keeps floating mode while existing meeting controls open and close', async () => {
    const user = userEvent.setup()
    const { container } = await renderMeetingPage()

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 축소' }))
    expect(container.querySelector('[data-ai-chat-mode]')).toHaveAttribute(
      'data-ai-chat-mode',
      'floating',
    )

    await user.click(screen.getByRole('button', { name: '참여자 4명 확인' }))
    expect(screen.getByRole('list', { name: '회의 참여자' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(container.querySelector('[data-ai-chat-mode]')).toHaveAttribute(
      'data-ai-chat-mode',
      'floating',
    )
  })

  it('moves a selected transcript snapshot to AI Chat and focuses an empty draft', async () => {
    const user = userEvent.setup()
    await renderMeetingPage()

    await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))
    await user.click(screen.getByRole('button', { name: 'AI에게 질문하기' }))

    expect(screen.getByRole('region', { name: 'AI 질문 전사 컨텍스트' })).toHaveTextContent(
      '지난주 유저 인터뷰 결과',
    )
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveFocus()
  })

  it('commits a successful transcript edit and shows the edited marker', async () => {
    const user = userEvent.setup()
    await renderMeetingPage()

    await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))
    await user.click(screen.getByRole('button', { name: '전사 수정' }))
    const editor = screen.getByRole('textbox', { name: '전사 내용' })
    await user.clear(editor)
    await user.type(editor, '수정된 전사 문장')
    await user.click(screen.getByRole('button', { name: '확인' }))

    expect(await screen.findByText('수정된 전사 문장')).toBeInTheDocument()
    expect(screen.getByText('수정됨')).toBeInTheDocument()
  })

  it('keeps a failed transcript draft visible without committing it', async () => {
    const user = userEvent.setup()
    await renderMeetingPage('/meetings/demo-edit-error/live')

    await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))
    await user.click(screen.getByRole('button', { name: '전사 수정' }))
    const editor = screen.getByRole('textbox', { name: '전사 내용' })
    await user.clear(editor)
    await user.type(editor, '저장에 실패할 초안')
    await user.click(screen.getByRole('button', { name: '확인' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '전사 내용을 수정하지 못했습니다.',
    )
    expect(screen.getByRole('textbox', { name: '전사 내용' })).toHaveValue(
      '저장에 실패할 초안',
    )
  })

  it('retries a failed SynQ hint request', async () => {
    const user = userEvent.setup()
    await renderMeetingPage('/meetings/demo-hint-error/live')

    await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'SynQ 힌트를 불러오지 못했습니다.',
    )

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('팀 질문')).toBeInTheDocument()
    expect(screen.getByText('온보딩 개선의 완료 기준은 무엇인가요?')).toBeInTheDocument()
  })
})
