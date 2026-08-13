import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  meetingAiChatApi,
  meetingAiEventsGateway,
  meetingConnectionGateway,
  meetingHintApi,
  meetingLifecycleApi,
  meetingParticipantApi,
  meetingRecordGateway,
  meetingTranscriptionGateway,
  type MeetingAiEvent,
  type TranscriptionChannelStatus,
  type TranscriptionMessage,
} from '../entities/meeting'
import type { ProjectNavigationState } from '../features/meeting-processing'
import { resetLiveMeetingMockDb } from '../shared/api/mock/db/liveMeeting.mockDb'
import { meetingService } from '../shared/api/services/meeting.service'
import { transcriptService } from '../shared/api/services/transcript.service'
import {
  readMeetingProjectContext,
  writeMeetingProjectContext,
} from './meeting/model/meetingProjectContext.storage'
import { writeMeetingRuntime } from './meeting/model/meetingRuntime.storage'
import { MeetingPage } from './MeetingPage'

const TRANSCRIPT_TEXT =
  '네, 지난주 유저 인터뷰 결과를 토대로 봤을 때, 제품 측면에서는 온보딩 플로우 개선이 가장 큰 임팩트를 줄 수 있을 것 같습니다.'

function transcriptListResult(meetingId: number) {
  return {
    meetingId,
    segments: [
      {
        segmentId: 1,
        sequenceIndex: 0,
        startMs: 284000,
        endMs: 292000,
        content: TRANSCRIPT_TEXT,
        speakerLabel: null,
        isModified: false,
      },
    ],
  }
}

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
  // 이탈 방지가 useBlocker를 쓰므로 데이터 라우터가 필요하다.
  // 뒤로가기를 재현할 수 있도록 회의 화면 앞에 항목을 하나 둔다.
  const router = createMemoryRouter(
    [
      {
        path: '/meetings/:meetingId/live',
        element: (
          <MeetingPage
            user={{
              userId: 7,
              name: '윤금서',
              email: 'a@b.c',
              provider: 'KAKAO',
              profileImageUrl: null,
            }}
          />
        ),
      },
      { path: '/projects', element: <ProjectDestination /> },
    ],
    { initialEntries: ['/projects', { pathname: path, state }], initialIndex: 1 },
  )
  const result = render(<RouterProvider router={router} />)

  await screen.findByRole('button', { name: '참여자 4명 확인' })
  return { ...result, router }
}

describe('MeetingPage controls', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.sessionStorage.clear()
    resetLiveMeetingMockDb()

    // WebSocket은 열지 않는다. 전사는 조회 API 스텁이 채운다.
    vi.spyOn(meetingTranscriptionGateway, 'connect').mockImplementation((options) => {
      void Promise.resolve().then(() => options.onStatus('connected'))
      return { close: () => {}, sendAudio: () => {} }
    })
    vi.spyOn(meetingLifecycleApi, 'joinMeeting').mockImplementation(async (meetingId) => ({
      meetingId,
      title: '2차 대면회의',
      status: 'IN_PROGRESS',
      role: 'HOST',
      joinedAt: '2026-08-05T00:00:00.000Z',
      startedAt: '2026-08-05T00:00:00.000Z',
      wsUrl: 'wss://api.example.com/ws/meetings/1/stt',
    }))
    vi.spyOn(meetingLifecycleApi, 'endMeeting').mockImplementation(async (meetingId) => ({
      meetingId,
      status: 'COMPLETED',
      endedAt: '2026-08-05T01:00:00.000Z',
    }))
    vi.spyOn(meetingService, 'updateMeetingTitle').mockImplementation(async (meetingId, title) => ({
      meetingId,
      title,
      userModified: true,
    }))
    // AI 이벤트 SSE는 열지 않는다. 필요한 테스트에서만 onEvent를 잡아 쓴다.
    vi.spyOn(meetingAiEventsGateway, 'connect').mockImplementation((options) => {
      void Promise.resolve().then(() => options.onStatus('connected'))
      return { close: () => {} }
    })
    vi.spyOn(meetingHintApi, 'listHintRecords').mockResolvedValue([])
    vi.spyOn(meetingParticipantApi, 'listParticipants').mockResolvedValue([
      { id: '7', name: '윤금서', profileImageUrl: null, isCurrentUser: true, isHost: true },
      { id: '8', name: '이동희', profileImageUrl: null, isCurrentUser: false, isHost: false },
      { id: '9', name: '이소미', profileImageUrl: null, isCurrentUser: false, isHost: false },
      { id: '10', name: '김도진', profileImageUrl: null, isCurrentUser: false, isHost: false },
    ])
    vi.spyOn(meetingAiChatApi, 'loadWelcome').mockResolvedValue({
      messages: [
        {
          id: 'assistant-welcome',
          role: 'assistant',
          content: '회의가 시작되었습니다.',
          context: null,
        },
      ],
      suggestions: [],
    })
    vi.spyOn(meetingAiChatApi, 'loadHistory').mockResolvedValue([])
    vi.spyOn(transcriptService, 'listSegments').mockImplementation(async (meetingId) =>
      transcriptListResult(meetingId),
    )
    vi.spyOn(transcriptService, 'updateSegment').mockImplementation(
      async (meetingId, segmentId, content) => ({
        segmentId,
        meetingId,
        content,
        isModified: true,
        updatedAt: '2026-08-05T00:30:00.000Z',
      }),
    )
  })

  // 헤더가 mock 스냅샷을 그대로 쓰면 다른 프로젝트에서 들어와도 같은 이름이 뜬다.
  it('헤더에 들어온 경로의 프로젝트 이름을 표시한다', async () => {
    await renderMeetingPage('/meetings/1/live', {
      projectId: 'project-9',
      projectTitle: '테스트용',
    })

    expect(screen.getByTitle('테스트용')).toBeInTheDocument()
    expect(readMeetingProjectContext('1')).toEqual({
      projectId: 'project-9',
      projectTitle: '테스트용',
    })
  })

  // 새로고침하면 라우터 state가 사라진다. 저장해 둔 값이 없으면 mock 이름이 뜬다.
  it('새로고침으로 라우터 state를 잃어도 저장된 프로젝트 이름을 복원한다', async () => {
    writeMeetingProjectContext('1', { projectId: 'project-9', projectTitle: '테스트용' })

    await renderMeetingPage()

    expect(screen.getByTitle('테스트용')).toBeInTheDocument()
  })

  it('복원한 프로젝트로 회의를 종료하고 돌아간다', async () => {
    writeMeetingProjectContext('1', { projectId: 'project-9', projectTitle: '테스트용' })
    const user = userEvent.setup()
    await renderMeetingPage()

    await user.click(screen.getByRole('button', { name: '회의 종료' }))
    await user.click(screen.getByRole('button', { name: '종료하기' }))

    const dialog = await screen.findByRole('dialog', { name: '회의가 종료되었습니다.' })
    await user.click(within(dialog).getByRole('button', { name: '닫기' }))

    expect(await screen.findByText('프로젝트 메인 project-9')).toBeInTheDocument()
    // 끝난 회의의 값을 탭에 남겨 두지 않는다.
    expect(readMeetingProjectContext('1')).toBeNull()
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
    expect(screen.getByText('윤금서 (you)')).toBeInTheDocument()

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

    // 저장이 끝난 뒤에야 제목이 바뀐다. 동기로 단언하면 저장 전 화면을 볼 수 있다.
    expect(await screen.findByTitle('3차 회의')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '회의 제목 수정' })).not.toBeInTheDocument()
    // 화면만 바꾸고 저장하지 않으면 회의 기록에는 옛 제목이 남는다.
    expect(meetingService.updateMeetingTitle).toHaveBeenCalledWith(1, '3차 회의')
  })

  it('제목 저장에 실패하면 모달을 열어 둔 채 오류를 알리고 헤더 제목을 지킨다', async () => {
    vi.spyOn(meetingService, 'updateMeetingTitle').mockRejectedValue(
      new Error('회의 제목을 수정하지 못했습니다.'),
    )
    const user = userEvent.setup()
    await renderMeetingPage()

    await user.click(screen.getByRole('button', { name: '회의 메뉴 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))

    const dialog = screen.getByRole('dialog', { name: '회의 제목 수정' })
    const titleInput = within(dialog).getByLabelText('회의 제목')
    await user.clear(titleInput)
    await user.type(titleInput, '저장에 실패할 제목')
    await user.click(within(dialog).getByRole('button', { name: '제목 변경하기' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      '회의 제목을 수정하지 못했습니다.',
    )
    expect(within(dialog).getByLabelText('회의 제목')).toHaveValue('저장에 실패할 제목')
    expect(screen.getByTitle('2차 대면회의')).toBeInTheDocument()
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
    expect(screen.getByText('처리 회의 1')).toBeInTheDocument()
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

  it('가로챈 뒤로가기를 취소하면 회의 화면에 남는다', async () => {
    const user = userEvent.setup()
    const { router } = await renderMeetingPage()

    await act(async () => {
      await router.navigate(-1)
    })

    expect(screen.getByRole('dialog', { name: '회의를 종료할까요?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(screen.queryByRole('dialog', { name: '회의를 종료할까요?' })).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/meetings/1/live')
  })

  it('가로챈 뒤로가기에서 종료를 확인하면 회의를 저장하고 프로젝트로 이동한다', async () => {
    const user = userEvent.setup()
    const { router } = await renderMeetingPage('/meetings/1/live', {
      projectId: 'project-1',
      projectTitle: '서비스 디자인',
    })

    await act(async () => {
      await router.navigate(-1)
    })
    await user.click(screen.getByRole('button', { name: '종료하기' }))

    const dialog = await screen.findByRole('dialog', { name: '회의가 종료되었습니다.' })
    await user.click(within(dialog).getByRole('button', { name: '닫기' }))

    expect(await screen.findByText('프로젝트 메인 project-1')).toBeInTheDocument()
  })

  it('탭 닫기·새로고침에 브라우저 기본 경고를 켠다', async () => {
    await renderMeetingPage()

    const unloadEvent = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unloadEvent)

    expect(unloadEvent.defaultPrevented).toBe(true)
  })

  it('shows a retry control when completed meeting storage fails', async () => {
    vi.spyOn(meetingRecordGateway, 'finalizeEndedMeeting').mockRejectedValue(
      new Error('회의 기록을 저장하지 못했습니다.'),
    )
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
    vi.spyOn(transcriptService, 'updateSegment').mockRejectedValue(
      new Error('전사 내용을 수정하지 못했습니다.'),
    )
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
    vi.spyOn(meetingHintApi, 'createSegmentHint')
      .mockRejectedValueOnce(new Error('SynQ 힌트를 불러오지 못했습니다.'))
      .mockResolvedValueOnce({
        transcriptId: '1',
        meaning: '온보딩 개선이 이번 분기 핵심 우선순위라는 뜻입니다.',
        personalImpact: '일정과 리소스 배분에 영향이 있을 수 있습니다.',
        teamQuestion: '온보딩 개선의 완료 기준은 무엇인가요?',
      })
    const user = userEvent.setup()
    await renderMeetingPage('/meetings/2/live')

    await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))
    expect(await screen.findByRole('alert')).toHaveTextContent('SynQ 힌트를 불러오지 못했습니다.')

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('팀 질문')).toBeInTheDocument()
    expect(screen.getByText('온보딩 개선의 완료 기준은 무엇인가요?')).toBeInTheDocument()
  })

  it('참여자는 서버가 알린 회의 종료를 안내받고 프로젝트로 나간다', async () => {
    vi.spyOn(meetingLifecycleApi, 'joinMeeting').mockResolvedValue({
      meetingId: 1,
      title: '2차 대면회의',
      status: 'IN_PROGRESS',
      role: 'MEMBER',
      joinedAt: '2026-08-05T00:00:00.000Z',
      startedAt: '2026-08-05T00:00:00.000Z',
      wsUrl: 'wss://api.example.com/ws/meetings/1/stt',
    })
    let notify: ((message: TranscriptionMessage) => void) | undefined
    vi.spyOn(meetingTranscriptionGateway, 'connect').mockImplementation((options) => {
      notify = options.onMessage
      void Promise.resolve().then(() => options.onStatus('connected'))
      return { close: () => {}, sendAudio: () => {} }
    })
    const user = userEvent.setup()
    await renderMeetingPage('/meetings/1/live', {
      projectId: 'project-1',
      projectTitle: '서비스 디자인',
    })

    await act(async () => {
      notify?.({ kind: 'meetingEnded' })
    })

    expect(
      await screen.findByRole('dialog', { name: '진행자가 회의를 종료했습니다.' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '확인' }))

    expect(await screen.findByText('프로젝트 메인 project-1')).toBeInTheDocument()
  })

  // 정상 종료 때도 같은 메시지가 브로드캐스트된다. 진행자는 자기 저장 흐름을 타야 한다.
  it('진행자 화면에는 종료 안내가 뜨지 않는다', async () => {
    let notify: ((message: TranscriptionMessage) => void) | undefined
    vi.spyOn(meetingTranscriptionGateway, 'connect').mockImplementation((options) => {
      notify = options.onMessage
      void Promise.resolve().then(() => options.onStatus('connected'))
      return { close: () => {}, sendAudio: () => {} }
    })
    await renderMeetingPage()

    await act(async () => {
      notify?.({ kind: 'meetingEnded' })
    })

    expect(
      screen.queryByRole('dialog', { name: '진행자가 회의를 종료했습니다.' }),
    ).not.toBeInTheDocument()
  })

  it('참여자에게도 연결 상태 불안정을 알린다', async () => {
    vi.spyOn(meetingLifecycleApi, 'joinMeeting').mockResolvedValue({
      meetingId: 1,
      title: '2차 대면회의',
      status: 'IN_PROGRESS',
      role: 'MEMBER',
      joinedAt: '2026-08-05T00:00:00.000Z',
      startedAt: '2026-08-05T00:00:00.000Z',
      wsUrl: 'wss://api.example.com/ws/meetings/1/stt',
    })
    let changeStatus: ((status: TranscriptionChannelStatus) => void) | undefined
    vi.spyOn(meetingTranscriptionGateway, 'connect').mockImplementation((options) => {
      changeStatus = options.onStatus
      void Promise.resolve().then(() => options.onStatus('connected'))
      return { close: () => {}, sendAudio: () => {} }
    })
    await renderMeetingPage()

    await act(async () => {
      changeStatus?.('closed')
    })

    expect(await screen.findByText('연결 상태 불안정')).toBeInTheDocument()
  })

  it('자동 생성된 힌트를 전사에 표시하고 생성 요청 없이 보여 준다', async () => {
    let emit: ((event: MeetingAiEvent) => void) | undefined
    vi.spyOn(meetingAiEventsGateway, 'connect').mockImplementation((options) => {
      emit = options.onEvent
      void Promise.resolve().then(() => options.onStatus('connected'))
      return { close: () => {} }
    })
    const createSegmentHint = vi.spyOn(meetingHintApi, 'createSegmentHint')
    const user = userEvent.setup()
    await renderMeetingPage()

    await act(async () => {
      emit?.({
        kind: 'autoHint',
        hint: {
          transcriptId: '1',
          meaning: '자동으로 만든 의미',
          personalImpact: '자동으로 만든 영향',
          teamQuestion: '자동으로 만든 질문',
        },
      })
    })

    // 사용자가 눌러보기 전에도 힌트가 생겼다는 것을 알 수 있어야 한다.
    expect(await screen.findByText('SynQ 힌트')).toBeInTheDocument()

    await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))

    expect(await screen.findByText('자동으로 만든 의미')).toBeInTheDocument()
    expect(createSegmentHint).not.toHaveBeenCalled()
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
