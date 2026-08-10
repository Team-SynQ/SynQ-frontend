import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  meetingConnectionGateway,
  meetingLifecycleApi,
  meetingRecordGateway,
} from '../entities/meeting'
import type { ProjectNavigationState } from '../features/meeting-processing'
import { resetLiveMeetingMockDb } from '../shared/api/mock/db/liveMeeting.mockDb'
import { resetMeetingLifecycleMockDb } from '../shared/api/mock/db/meetingLifecycle.mockDb'
import { writeMeetingRuntime } from './meeting/model/meetingRuntime.storage'
import { MeetingPage } from './MeetingPage'

function ProjectDestination() {
  const location = useLocation()
  const state = location.state as ProjectNavigationState | null

  return (
    <div>
      <p>프로젝트 메인 {state?.activeProjectId}</p>
      <p>처리 회의 {state?.processingMeetingRecordId ?? '없음'}</p>
    </div>
  )
}

async function renderMeetingPage(
  path = '/meetings/1/live',
  state?: { projectId: string; projectTitle: string },
) {
  const result = render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route element={<MeetingPage />} path="/meetings/:meetingId/live" />
        <Route element={<ProjectDestination />} path="/projects" />
      </Routes>
    </MemoryRouter>,
  )

  await screen.findByRole('button', { name: '참여자 4명 확인' })
  return result
}

describe('MeetingPage controls', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.sessionStorage.clear()
    resetLiveMeetingMockDb()
    resetMeetingLifecycleMockDb()
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
    vi.spyOn(meetingLifecycleApi, 'endMeeting').mockReturnValue(new Promise(() => undefined))
    const user = userEvent.setup()
    await renderMeetingPage()

    await user.click(screen.getByRole('button', { name: '회의 종료' }))
    expect(screen.getByRole('dialog', { name: '회의를 종료할까요?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '종료하기' }))
    expect(
      screen.getByRole('dialog', { name: '회의 내용을 저장하고 있습니다.' }),
    ).toBeInTheDocument()
  })

  it('shows the saved meeting and returns to the completed project', async () => {
    const user = userEvent.setup()
    await renderMeetingPage('/meetings/1/live', {
      projectId: 'project-1',
      projectTitle: '서비스 디자인',
    })

    await user.click(screen.getByRole('button', { name: '회의 종료' }))
    await user.click(screen.getByRole('button', { name: '종료하기' }))

    const dialog = await screen.findByRole('dialog', { name: '회의가 종료되었습니다.' })
    expect(within(dialog).getByText('서비스 디자인')).toBeInTheDocument()
    expect(within(dialog).getByText('2차 대면회의')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: '닫기' }))

    expect(await screen.findByText('프로젝트 메인 project-1')).toBeInTheDocument()
    expect(screen.getByText('처리 회의 meeting-record-1')).toBeInTheDocument()
  })

  it('returns a non-host participant to the project without completing the meeting', async () => {
    const finalizeEndedMeeting = vi.spyOn(meetingRecordGateway, 'finalizeEndedMeeting')
    vi.spyOn(meetingLifecycleApi, 'joinMeeting').mockResolvedValue({
      meetingId: 1,
      title: '2차 대면회의',
      status: 'IN_PROGRESS',
      role: 'MEMBER',
      joinedAt: '2026-08-05T00:00:00.000Z',
      startedAt: '2026-08-05T00:00:00.000Z',
      wsUrl: 'wss://mock.synq/meetings/1',
    })
    const user = userEvent.setup()

    await renderMeetingPage('/meetings/1/live', {
      projectId: 'project-1',
      projectTitle: '서비스 디자인',
    })

    await user.click(screen.getByRole('button', { name: '나가기' }))
    const dialog = screen.getByRole('dialog', { name: '회의를 나가시겠어요?' })
    await user.click(within(dialog).getByRole('button', { name: '나가기' }))

    expect(finalizeEndedMeeting).not.toHaveBeenCalled()
    expect(await screen.findByText('프로젝트 메인 project-1')).toBeInTheDocument()
    expect(screen.getByText('처리 회의 없음')).toBeInTheDocument()
  })

  it('shows a retry control when completed meeting storage fails', async () => {
    const user = userEvent.setup()
    await renderMeetingPage('/meetings/4/live')

    await user.click(screen.getByRole('button', { name: '회의 종료' }))
    await user.click(screen.getByRole('button', { name: '종료하기' }))

    expect(await screen.findByText('회의 내용을 저장하지 못했습니다.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(await screen.findByText('회의 내용을 저장하지 못했습니다.')).toBeInTheDocument()
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

  it('collapses a SynQ hint and restores it from cache when the transcript is selected again', async () => {
    const user = userEvent.setup()
    await renderMeetingPage()

    const transcript = await screen.findByText(/지난주 유저 인터뷰 결과/)
    await user.click(transcript)
    expect(await screen.findByRole('article', { name: 'SynQ 힌트' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'SynQ 힌트 접기' }))
    expect(screen.queryByRole('article', { name: 'SynQ 힌트' })).not.toBeInTheDocument()

    await user.click(transcript)
    expect(await screen.findByRole('article', { name: 'SynQ 힌트' })).toBeInTheDocument()
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
    await renderMeetingPage('/meetings/3/live')

    await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))
    await user.click(screen.getByRole('button', { name: '전사 수정' }))
    const editor = screen.getByRole('textbox', { name: '전사 내용' })
    await user.clear(editor)
    await user.type(editor, '저장에 실패할 초안')
    await user.click(screen.getByRole('button', { name: '확인' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('전사 내용을 수정하지 못했습니다.')
    expect(screen.getByRole('textbox', { name: '전사 내용' })).toHaveValue('저장에 실패할 초안')
  })

  it('retries a failed SynQ hint request', async () => {
    const user = userEvent.setup()
    await renderMeetingPage('/meetings/2/live')

    await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))
    expect(await screen.findByRole('alert')).toHaveTextContent('SynQ 힌트를 불러오지 못했습니다.')

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('팀 질문')).toBeInTheDocument()
    expect(screen.getByText('온보딩 개선의 완료 기준은 무엇인가요?')).toBeInTheDocument()
  })

  it('freezes the host controls and timer while restoring a refreshed meeting', async () => {
    writeMeetingRuntime('1', { activeSeconds: 8, recordingState: 'recording' })
    vi.spyOn(meetingConnectionGateway, 'restoreConnection').mockReturnValue(
      new Promise(() => undefined),
    )

    await renderMeetingPage()

    expect(await screen.findByText('연결 상태 불안정')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
    expect(await screen.findByText('00:08')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회의 일시정지' })).toBeDisabled()
  })
})
