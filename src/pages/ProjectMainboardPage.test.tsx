import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CompletedMeeting } from '../entities/meeting'
import type { ProjectSummary } from '../entities/project'
import {
  MEETING_HISTORY_PROCESSING_MS,
  MEETING_SUMMARY_PROCESSING_MS,
} from '../features/meeting-processing'
import type { ProjectCreateDraft } from '../features/project-create'
import { ProjectMainboardPage } from './ProjectMainboardPage'

function NavigationDestination() {
  const location = useLocation()

  return (
    <p>
      이동 완료 {location.pathname} {JSON.stringify(location.state)}
    </p>
  )
}

function renderProjectMainboardPage(
  props: ComponentProps<typeof ProjectMainboardPage> = {},
  initialEntry: string | { pathname: string; state: unknown } = '/projects',
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ProjectMainboardPage {...props} />} path="/projects" />
        <Route element={<NavigationDestination />} path="/settings/help" />
        <Route element={<NavigationDestination />} path="/settings/policy" />
        <Route element={<NavigationDestination />} path="/meetings/:meetingId/tutorial" />
        <Route element={<NavigationDestination />} path="/meetings/:meetingRecordId/detail" />
      </Routes>
    </MemoryRouter>,
  )
}

const projectOne: ProjectSummary = {
  apiProjectId: 1,
  id: 'project-1',
  name: '서비스 디자인',
  overview: '',
  perspectiveLabel: 'PM',
  perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
  materials: [],
}

const completedMeeting: CompletedMeeting = {
  recordId: 'meeting-record-1',
  meetingId: 'demo',
  projectId: 'project-1',
  projectTitle: '서비스 디자인',
  meetingTitle: '온보딩 개선 회의',
  durationSeconds: 373,
  completedAt: new Date(2026, 6, 27, 12, 0).toISOString(),
  host: {
    id: 'you',
    name: '윤금서',
    avatarKey: 'you',
  },
  overview: '온보딩 개선 우선순위와 완료 기준을 중심으로 논의',
  keywords: ['온보딩 플로우'],
  decisions: ['온보딩 개선을 우선순위로 확정'],
}

const previousMeeting: CompletedMeeting = {
  ...completedMeeting,
  recordId: 'meeting-record-previous',
  meetingTitle: '이전 회의',
  completedAt: new Date(2026, 6, 26, 12, 0).toISOString(),
}

const sidebarUser = {
  email: 'honggildong@gmail.com',
  name: '홍길동',
}

describe('ProjectMainboardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it.each([
    { label: '도움말', path: '/settings/help' },
    { label: '이용약관', path: '/settings/policy' },
  ])('routes the sidebar account menu $label item', async ({ label, path }) => {
    const browserUser = userEvent.setup()
    renderProjectMainboardPage({ user: sidebarUser })

    await browserUser.click(screen.getByRole('button', { name: new RegExp(sidebarUser.name) }))
    await browserUser.click(screen.getByRole('menuitem', { name: label }))

    expect(screen.getByText(new RegExp(`이동 완료 ${path}`))).toBeInTheDocument()
  })

  it('loads the active project meeting history and opens the latest summary', async () => {
    const user = userEvent.setup()
    const loadCompletedMeetings = vi.fn(() => Promise.resolve([completedMeeting]))

    renderProjectMainboardPage({
      loadProjects: () => Promise.resolve([projectOne]),
      loadCompletedMeetings,
    })

    expect(await screen.findAllByText('온보딩 개선 회의')).toHaveLength(2)
    expect(loadCompletedMeetings).toHaveBeenCalledWith('project-1')

    await user.click(screen.getByRole('button', { name: '자세히 보기' }))
    expect(
      await screen.findByText('이동 완료 /meetings/meeting-record-1/detail null'),
    ).toBeInTheDocument()
  })

  it('updates the history row and latest summary after renaming the newest record', async () => {
    const user = userEvent.setup()
    const updateCompletedMeetingTitle = vi.fn(
      async (recordId: string, title: string): Promise<CompletedMeeting> => ({
        ...completedMeeting,
        recordId,
        meetingTitle: title,
      }),
    )

    renderProjectMainboardPage({
      loadProjects: () => Promise.resolve([projectOne]),
      loadCompletedMeetings: () => Promise.resolve([completedMeeting, previousMeeting]),
      updateCompletedMeetingTitle,
    })

    await screen.findAllByText('온보딩 개선 회의')
    await user.click(screen.getByRole('button', { name: '온보딩 개선 회의 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))
    const titleInput = screen.getByLabelText('회의 제목')
    await user.clear(titleInput)
    await user.type(titleInput, '변경된 최신 회의')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(await screen.findAllByText('변경된 최신 회의')).toHaveLength(2)
    expect(updateCompletedMeetingTitle).toHaveBeenCalledWith('meeting-record-1', '변경된 최신 회의')
  })

  it('promotes the next record and shows empty states as records are deleted', async () => {
    const user = userEvent.setup()
    const deleteCompletedMeeting = vi.fn().mockResolvedValue(undefined)

    renderProjectMainboardPage({
      deleteCompletedMeeting,
      loadProjects: () => Promise.resolve([projectOne]),
      loadCompletedMeetings: () => Promise.resolve([completedMeeting, previousMeeting]),
    })

    await screen.findAllByText('온보딩 개선 회의')
    await user.click(screen.getByRole('button', { name: '온보딩 개선 회의 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '기록 삭제하기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(await screen.findAllByText('이전 회의')).toHaveLength(2)
    expect(screen.queryByText('온보딩 개선 회의')).not.toBeInTheDocument()
    const deleteToast = await screen.findByRole('status', { name: '회의 기록 삭제 완료' })
    expect(deleteToast).toBeInTheDocument()
    expect(deleteToast.parentElement).toHaveStyle({ top: '20px' })

    await user.click(screen.getByRole('button', { name: '이전 회의 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '기록 삭제하기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(await screen.findAllByText(/아직 회의 기록이 없습니다/)).toHaveLength(2)
    expect(deleteCompletedMeeting).toHaveBeenNthCalledWith(1, 'meeting-record-1')
    expect(deleteCompletedMeeting).toHaveBeenNthCalledWith(2, 'meeting-record-previous')
  })

  it('keeps meeting data when deletion rejects and shows failure feedback', async () => {
    const user = userEvent.setup()

    renderProjectMainboardPage({
      deleteCompletedMeeting: vi.fn().mockRejectedValue(new Error('request failed')),
      loadProjects: () => Promise.resolve([projectOne]),
      loadCompletedMeetings: () => Promise.resolve([completedMeeting, previousMeeting]),
    })

    await screen.findAllByText('온보딩 개선 회의')
    await user.click(screen.getByRole('button', { name: '온보딩 개선 회의 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '기록 삭제하기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(await screen.findByText('회의 기록 삭제 실패')).toBeInTheDocument()
    expect(screen.getAllByText('온보딩 개선 회의')).toHaveLength(2)
  })

  it('prefers the project selected by return navigation state', async () => {
    const secondProject = { ...projectOne, id: 'project-2', name: '두 번째 프로젝트' }
    const loadCompletedMeetings = vi.fn(() => Promise.resolve([]))

    renderProjectMainboardPage(
      {
        loadProjects: () => Promise.resolve([projectOne, secondProject]),
        loadCompletedMeetings,
      },
      {
        pathname: '/projects',
        state: { activeProjectId: 'project-2' },
      },
    )

    expect(await screen.findByRole('heading', { name: '두 번째 프로젝트' })).toBeInTheDocument()
    await waitFor(() => expect(loadCompletedMeetings).toHaveBeenCalledWith('project-2'))
  })

  it('reveals a completed meeting through the summary and history processing phases', async () => {
    vi.useFakeTimers()

    renderProjectMainboardPage(
      {
        loadProjects: () => Promise.resolve([projectOne]),
        loadCompletedMeetings: () => Promise.resolve([completedMeeting, previousMeeting]),
      },
      {
        pathname: '/projects',
        state: {
          activeProjectId: 'project-1',
          processingMeetingRecordId: 'meeting-record-1',
        },
      },
    )

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.getByRole('status', { name: '회의 불러오는 중' })).toBeInTheDocument()
    expect(screen.queryByText('온보딩 개선 회의')).not.toBeInTheDocument()
    expect(screen.getAllByText('이전 회의')).toHaveLength(2)

    act(() => {
      vi.advanceTimersByTime(MEETING_SUMMARY_PROCESSING_MS)
    })

    expect(screen.queryByRole('status', { name: '회의 불러오는 중' })).not.toBeInTheDocument()
    expect(screen.getAllByText('온보딩 개선 회의')).toHaveLength(2)
    expect(screen.getByRole('status', { name: '회의 기록 정리 중' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(MEETING_HISTORY_PROCESSING_MS)
    })

    expect(screen.getByRole('status', { name: '회의 기록 정리 완료' })).toBeInTheDocument()

    fireEvent.pointerDown(screen.getByRole('main'))

    expect(screen.queryByRole('status', { name: '회의 기록 정리 완료' })).not.toBeInTheDocument()
    expect(screen.getAllByText('온보딩 개선 회의')).toHaveLength(2)
  })

  it('ends the processing overlay when meeting history loading fails', async () => {
    vi.useFakeTimers()

    renderProjectMainboardPage(
      {
        loadProjects: () => Promise.resolve([projectOne]),
        loadCompletedMeetings: () => Promise.reject(new Error('meeting load failed')),
      },
      {
        pathname: '/projects',
        state: {
          activeProjectId: 'project-1',
          processingMeetingRecordId: 'meeting-record-1',
        },
      },
    )

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.getByRole('alert')).toHaveTextContent('회의 기록을 불러오지 못했습니다.')
    expect(screen.queryByRole('status', { name: '회의 불러오는 중' })).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(MEETING_SUMMARY_PROCESSING_MS + MEETING_HISTORY_PROCESSING_MS)
    })

    expect(screen.queryByRole('status', { name: '회의 기록 정리 중' })).not.toBeInTheDocument()
    expect(screen.queryByRole('status', { name: '회의 기록 정리 완료' })).not.toBeInTheDocument()
  })

  it('cancels meeting processing when initial project loading fails', async () => {
    vi.useFakeTimers()
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout')
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')

    renderProjectMainboardPage(
      {
        loadProjects: () => Promise.reject(new Error('project load failed')),
      },
      {
        pathname: '/projects',
        state: {
          activeProjectId: 'project-1',
          processingMeetingRecordId: 'meeting-record-1',
        },
      },
    )

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    const summaryTimerCallIndex = setTimeoutSpy.mock.calls.findIndex(
      ([, delay]) => delay === MEETING_SUMMARY_PROCESSING_MS,
    )
    expect(summaryTimerCallIndex).toBeGreaterThanOrEqual(0)

    const summaryTimerId = setTimeoutSpy.mock.results[summaryTimerCallIndex]?.value
    expect(clearTimeoutSpy).toHaveBeenCalledWith(summaryTimerId)
  })

  it('retries meeting history loading without hiding the project', async () => {
    const user = userEvent.setup()
    const loadCompletedMeetings = vi
      .fn<() => Promise<CompletedMeeting[]>>()
      .mockRejectedValueOnce(new Error('meeting load failed'))
      .mockResolvedValueOnce([completedMeeting])

    renderProjectMainboardPage({
      loadProjects: () => Promise.resolve([projectOne]),
      loadCompletedMeetings,
    })

    expect(await screen.findByRole('heading', { name: '서비스 디자인' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('회의 기록을 불러오지 못했습니다.')

    await user.click(screen.getByRole('button', { name: '다시 불러오기' }))

    expect(await screen.findAllByText('온보딩 개선 회의')).toHaveLength(2)
    expect(loadCompletedMeetings).toHaveBeenCalledTimes(2)
  })

  it('starts a meeting with the active project context', async () => {
    const user = userEvent.setup()
    const requestMicrophonePermission = vi.fn().mockResolvedValue('granted')
    const createMeeting = vi.fn().mockResolvedValue({
      meetingId: 41,
      title: '새 회의',
      status: 'IN_PROGRESS',
      startedAt: '2026-08-05T00:00:00.000Z',
      wsUrl: 'wss://mock.synq/meetings/41',
    })
    renderProjectMainboardPage({
      createMeeting,
      loadProjects: () => Promise.resolve([projectOne]),
      loadCompletedMeetings: () => Promise.resolve([]),
      requestMicrophonePermission,
    })

    await screen.findByRole('heading', { name: '서비스 디자인' })
    await user.click(screen.getByRole('button', { name: '새 회의 시작' }))
    await user.click(screen.getByRole('button', { name: '동의하고 시작' }))

    expect(screen.getByText('마이크 접근 권한이 필요합니다.')).toBeInTheDocument()
    expect(createMeeting).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '권한 허용하기' }))

    expect(requestMicrophonePermission).toHaveBeenCalledOnce()
    expect(createMeeting).toHaveBeenCalledWith(1, { consentAgreed: true })
    expect(await screen.findByText(/이동 완료 \/meetings\/41\/tutorial/)).toHaveTextContent(
      '{"projectId":"project-1","projectTitle":"서비스 디자인"}',
    )
  })

  it('shows the meeting start failure modal and retries creation', async () => {
    const user = userEvent.setup()
    const requestMicrophonePermission = vi.fn().mockResolvedValue('granted')
    const createMeeting = vi
      .fn()
      .mockRejectedValueOnce(new Error('CREATE_FAILED'))
      .mockResolvedValueOnce({
        meetingId: 42,
        title: '새 회의',
        status: 'IN_PROGRESS',
        startedAt: '2026-08-05T00:00:00.000Z',
        wsUrl: 'wss://mock.synq/meetings/42',
      })
    renderProjectMainboardPage({
      createMeeting,
      loadProjects: () => Promise.resolve([{ ...projectOne, id: '1' }]),
      loadCompletedMeetings: () => Promise.resolve([]),
      requestMicrophonePermission,
    })

    await screen.findByRole('heading', { name: '서비스 디자인' })
    await user.click(screen.getByRole('button', { name: '새 회의 시작' }))
    await user.click(screen.getByRole('button', { name: '동의하고 시작' }))
    await user.click(screen.getByRole('button', { name: '권한 허용하기' }))

    expect(await screen.findByText(/회의를 시작하지 못했습니다/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 시도하기' }))

    expect(requestMicrophonePermission).toHaveBeenCalledOnce()
    expect(createMeeting).toHaveBeenCalledTimes(2)
    expect(await screen.findByText(/이동 완료 \/meetings\/42\/tutorial/)).toBeInTheDocument()
  })

  it.each([
    ['denied', /마이크 권한을 확인하지 못했습니다/],
    ['unsupported', '현재 환경에서는 녹음을 사용할 수 없습니다.'],
  ] as const)(
    'does not create a meeting when microphone permission is %s',
    async (permissionResult, expectedTitle) => {
      const user = userEvent.setup()
      const createMeeting = vi.fn()
      renderProjectMainboardPage({
        createMeeting,
        loadProjects: () => Promise.resolve([{ ...projectOne, id: '1' }]),
        loadCompletedMeetings: () => Promise.resolve([]),
        requestMicrophonePermission: vi.fn().mockResolvedValue(permissionResult),
      })

      await screen.findByRole('heading', { name: '서비스 디자인' })
      await user.click(screen.getByRole('button', { name: '새 회의 시작' }))
      await user.click(screen.getByRole('button', { name: '동의하고 시작' }))
      await user.click(screen.getByRole('button', { name: '권한 허용하기' }))

      expect(await screen.findByText(expectedTitle)).toBeInTheDocument()
      expect(createMeeting).not.toHaveBeenCalled()
    },
  )

  it('keeps the empty dashboard until a project is created', async () => {
    renderProjectMainboardPage()

    expect(
      screen.getByRole('button', {
        name: '\uD504\uB85C\uC81D\uD2B8 \uC0DD\uC131\uD558\uAE30',
      }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: '\uD68C\uC758 \uBCF4\uC870 AI, \uC52C\uD050',
        }),
      ).not.toBeInTheDocument()
    })
  })

  it('shows the project only after creation completes', async () => {
    const user = userEvent.setup()
    let finishCreation: ((project: ProjectSummary) => void) | undefined
    const onSubmitProject = vi.fn(
      () =>
        new Promise<ProjectSummary>((resolve) => {
          finishCreation = resolve
        }),
    )

    renderProjectMainboardPage({ onSubmitProject })

    await user.click(
      screen.getByRole('button', {
        name: '\uD504\uB85C\uC81D\uD2B8 \uCD94\uAC00',
      }),
    )
    await user.type(
      screen.getByPlaceholderText(
        '\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
      ),
      '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
    )
    await user.click(screen.getByRole('button', { name: '\uB2E4\uC74C' }))
    await user.click(screen.getByRole('button', { name: '\uC0DD\uC131\uD558\uAE30' }))

    expect(onSubmitProject).toHaveBeenCalledTimes(1)

    const creatingButton = screen.getByRole('button', {
      name: '\uD504\uB85C\uC81D\uD2B8 \uC0DD\uC131 \uC911...',
    })
    expect(creatingButton).toHaveAttribute('aria-busy', 'true')
    expect(creatingButton).toBeDisabled()
    expect(
      screen.queryByRole('heading', {
        name: '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
      }),
    ).not.toBeInTheDocument()

    await act(async () => {
      finishCreation?.({
        apiProjectId: 101,
        id: 'project-created',
        name: '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
        overview: '',
        perspectiveLabel: 'PM',
        perspectiveDescription:
          '\uC77C\uC815, \uBC94\uC704, \uC758\uC0AC\uACB0\uC815 \uC601\uD5A5 \uC911\uC2EC',
        materials: [],
      })
    })

    expect(
      await screen.findByRole('heading', {
        name: '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toHaveAttribute('aria-current', 'page')

    const successToast = await screen.findByRole('status', {
      name: '\uD504\uB85C\uC81D\uD2B8 \uC0DD\uC131 \uC644\uB8CC',
    })
    expect(successToast).toHaveTextContent(
      '\u2018\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8\u2019 \uD504\uB85C\uC81D\uD2B8\uAC00 \uCD94\uAC00\uB410\uC2B5\uB2C8\uB2E4.',
    )
    expect(successToast).toHaveClass('min-h-[118px]')
  })

  it('reopens creation from the sidebar and accumulates created projects', async () => {
    const user = userEvent.setup()
    let createdProjectCount = 0
    const onSubmitProject = vi.fn((draft: ProjectCreateDraft) => {
      createdProjectCount += 1

      return {
        apiProjectId: createdProjectCount,
        id: `project-created-${createdProjectCount}`,
        name: draft.name,
        overview: draft.overview,
        perspectiveLabel: 'PM',
        perspectiveDescription:
          '\uC77C\uC815, \uBC94\uC704, \uC758\uC0AC\uACB0\uC815 \uC601\uD5A5 \uC911\uC2EC',
        materials: [],
      }
    })

    renderProjectMainboardPage({ onSubmitProject })

    const createProject = async (name: string) => {
      await user.click(
        screen.getByRole('button', {
          name: '\uD504\uB85C\uC81D\uD2B8 \uCD94\uAC00',
        }),
      )
      await user.type(
        screen.getByPlaceholderText(
          '\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        ),
        name,
      )
      await user.click(screen.getByRole('button', { name: '\uB2E4\uC74C' }))
      await user.click(screen.getByRole('button', { name: '\uC0DD\uC131\uD558\uAE30' }))
      await screen.findByRole('heading', { name })
    }

    await createProject('\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8')
    await createProject('\uB450 \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8')

    const firstProjectButton = screen.getByRole('button', {
      name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
    })
    const secondProjectButton = screen.getByRole('button', {
      name: '\uB450 \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
    })

    expect(onSubmitProject).toHaveBeenCalledTimes(2)
    expect(secondProjectButton.compareDocumentPosition(firstProjectButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(
      screen.getByRole('button', {
        name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '\uB450 \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toHaveAttribute('aria-current', 'page')

    await user.click(
      screen.getByRole('button', {
        name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('keeps a newly created project above a delayed initial response', async () => {
    const user = userEvent.setup()
    let finishInitialLoad: ((projects: ProjectSummary[]) => void) | undefined
    const loadProjects = vi.fn(
      () =>
        new Promise<ProjectSummary[]>((resolve) => {
          finishInitialLoad = resolve
        }),
    )
    const onSubmitProject = vi.fn((draft: ProjectCreateDraft) => ({
      apiProjectId: 201,
      id: 'latest-project',
      name: draft.name,
      overview: draft.overview,
      perspectiveLabel: 'PM',
      perspectiveDescription: 'schedule and scope',
      materials: [],
    }))

    renderProjectMainboardPage({ loadProjects, onSubmitProject })

    await user.click(
      screen.getByRole('button', {
        name: '\uD504\uB85C\uC81D\uD2B8 \uCD94\uAC00',
      }),
    )
    await user.type(
      screen.getByPlaceholderText(
        '\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
      ),
      'latest project',
    )
    await user.click(screen.getByRole('button', { name: '\uB2E4\uC74C' }))
    await user.click(screen.getByRole('button', { name: '\uC0DD\uC131\uD558\uAE30' }))
    await screen.findByRole('heading', { name: 'latest project' })

    await act(async () => {
      finishInitialLoad?.([
        {
          apiProjectId: 202,
          id: 'fetched-project',
          name: 'fetched project',
          overview: '',
          perspectiveLabel: 'PM',
          perspectiveDescription: 'schedule and scope',
          materials: [],
        },
      ])
    })

    const latestProjectButton = screen.getByRole('button', {
      name: 'latest project',
    })
    const fetchedProjectButton = await screen.findByRole('button', {
      name: 'fetched project',
    })

    expect(latestProjectButton.compareDocumentPosition(fetchedProjectButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(latestProjectButton).toHaveAttribute('aria-current', 'page')
  })

  it('renames and deletes a project reference from its action menu', async () => {
    const user = userEvent.setup()
    const loadProjects = vi.fn(() =>
      Promise.resolve<ProjectSummary[]>([
        {
          apiProjectId: 1,
          id: 'project-1',
          name: '서비스 디자인',
          overview: '',
          perspectiveLabel: 'PM',
          perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
          materials: [
            {
              id: 'material-1',
              kind: 'file',
              name: 'answer-guide.docx',
              createdAt: '2026-05-01T00:00:00.000Z',
            },
          ],
        },
      ]),
    )

    renderProjectMainboardPage({ loadProjects })
    await screen.findByText('answer-guide.docx')

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))

    expect(screen.getByRole('dialog', { name: '자료 제목 수정' })).toBeInTheDocument()

    const titleInput = screen.getByRole('textbox', { name: '자료 제목' })
    await user.clear(titleInput)
    await user.type(titleInput, 'revised-guide.docx')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(await screen.findByRole('status', { name: '자료 제목 수정 완료' })).toHaveTextContent(
      '자료 제목이 수정되었습니다.',
    )
    expect(screen.getByText('revised-guide.docx')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'revised-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))

    expect(
      screen.getByRole('dialog', {
        name: /‘revised-guide\.docx’\s+자료를 지우시겠습니까\?/,
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(await screen.findByRole('status', { name: '자료 삭제 완료' })).toHaveTextContent(
      '“revised-guide.docx” 자료가 삭제되었습니다.',
    )
    expect(screen.queryByText('revised-guide.docx')).not.toBeInTheDocument()
    expect(screen.getByText('등록된 AI 참고 자료가 없습니다')).toBeInTheDocument()
  })

  it('adds a reference to the active project from the Figma upload modal', async () => {
    const user = userEvent.setup()
    const loadProjects = vi.fn(() =>
      Promise.resolve<ProjectSummary[]>([
        {
          apiProjectId: 1,
          id: 'project-1',
          name: '서비스 디자인',
          overview: '',
          perspectiveLabel: 'PM',
          perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
          materials: [],
        },
      ]),
    )
    const addedMaterial = {
      id: 'material-added',
      kind: 'file' as const,
      name: 'roadmap.pdf',
      createdAt: '2026-07-26T00:00:00.000Z',
    }
    const addProjectReferences = vi.fn(() => Promise.resolve([addedMaterial]))
    const file = new File(['content'], 'roadmap.pdf', { type: 'application/pdf' })

    renderProjectMainboardPage({ addProjectReferences, loadProjects })
    await screen.findByRole('heading', { name: '서비스 디자인' })

    await user.click(screen.getByRole('button', { name: 'AI 참고 자료 추가' }))
    expect(screen.getByRole('dialog', { name: 'AI 참고 자료 업로드' })).toBeInTheDocument()
    await user.upload(screen.getByLabelText('AI 참고 자료 파일 선택'), file)
    await waitFor(() => expect(screen.getByRole('button', { name: '추가하기' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: '추가하기' }))

    expect(addProjectReferences).toHaveBeenCalledWith('project-1', {
      files: [file],
      links: [],
    })
    expect(await screen.findByRole('status', { name: '자료 추가 완료' })).toHaveTextContent(
      'AI 참고 자료가 추가되었습니다.',
    )
    expect(await screen.findByText('roadmap.pdf')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'AI 참고 자료 업로드' })).not.toBeInTheDocument()
  })

  it('keeps project reference data and shows the Figma error toasts when mutations fail', async () => {
    const user = userEvent.setup()
    const loadProjects = vi.fn(() =>
      Promise.resolve<ProjectSummary[]>([
        {
          apiProjectId: 1,
          id: 'project-1',
          name: '서비스 디자인',
          overview: '',
          perspectiveLabel: 'PM',
          perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
          materials: [
            {
              id: 'material-1',
              kind: 'file',
              name: 'answer-guide.docx',
              createdAt: '2026-05-01T00:00:00.000Z',
            },
          ],
        },
      ]),
    )
    const renameProjectReference = vi.fn(() => Promise.reject(new Error('rename failed')))
    const deleteProjectReference = vi.fn(() => Promise.reject(new Error('delete failed')))

    renderProjectMainboardPage({
      deleteProjectReference,
      loadProjects,
      renameProjectReference,
    })
    await screen.findByText('answer-guide.docx')

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))
    const titleInput = screen.getByRole('textbox', { name: '자료 제목' })
    await user.clear(titleInput)
    await user.type(titleInput, 'revised-guide.docx')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(await screen.findByRole('status', { name: '자료 제목 수정 실패' })).toHaveTextContent(
      '자료 제목을 수정하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(screen.getByText('answer-guide.docx')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(await screen.findByRole('status', { name: '자료 삭제 실패' })).toHaveTextContent(
      '참고자료를 삭제하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(screen.getByText('answer-guide.docx')).toBeInTheDocument()
  })

  it('deletes a project through the Figma confirmation dialog and shows the success toast', async () => {
    const user = userEvent.setup()
    const project: ProjectSummary = {
      apiProjectId: 301,
      id: 'project-delete',
      name: '서비스 디자인',
      overview: '',
      perspectiveLabel: 'PM',
      perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
      materials: [],
    }
    renderProjectMainboardPage({ loadProjects: vi.fn().mockResolvedValue([project]) })

    await screen.findByRole('heading', { name: project.name })
    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 삭제하기' }))

    const dialog = screen.getByRole('dialog', { name: '프로젝트 삭제' })
    expect(dialog).toHaveClass('h-[680px]', 'max-w-[460px]', 'gap-m', 'py-l')
    expect(within(dialog).getByTestId('project-delete-illustration')).toHaveAttribute(
      'height',
      '127',
    )
    const deleteButton = within(dialog).getByRole('button', { name: '삭제하기' })
    expect(deleteButton).toBeDisabled()
    await user.click(within(dialog).getByRole('checkbox', { name: '주의 사항을 확인했습니다.' }))
    await user.click(deleteButton)

    expect(await screen.findByRole('status', { name: '프로젝트 삭제 성공' })).toHaveTextContent(
      '‘서비스 디자인’ 프로젝트를 삭제했습니다.',
    )
    expect(screen.getByRole('button', { name: '프로젝트 생성하기' })).toBeInTheDocument()
  })

  it('keeps the delete dialog open and shows the Figma error toast when deletion fails', async () => {
    const user = userEvent.setup()
    const project: ProjectSummary = {
      apiProjectId: 302,
      id: 'project-delete-failure',
      name: '서비스 디자인',
      overview: '',
      perspectiveLabel: 'PM',
      perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
      materials: [],
    }
    renderProjectMainboardPage({
      deleteProject: vi.fn().mockRejectedValue(new Error('delete failed')),
      loadProjects: vi.fn().mockResolvedValue([project]),
    })

    await screen.findByRole('heading', { name: project.name })
    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 삭제하기' }))
    const dialog = screen.getByRole('dialog', { name: '프로젝트 삭제' })
    await user.click(within(dialog).getByRole('checkbox', { name: '주의 사항을 확인했습니다.' }))
    await user.click(within(dialog).getByRole('button', { name: '삭제하기' }))

    expect(screen.getByRole('dialog', { name: '프로젝트 삭제' })).toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '프로젝트 삭제 실패' })).toHaveTextContent(
      '프로젝트를 삭제하지 못했습니다. 다시 시도해 주세요.',
    )
  })
  it('updates the active project and sidebar from the project settings modal', async () => {
    const user = userEvent.setup()
    const project: ProjectSummary = {
      apiProjectId: 303,
      id: 'project-edit',
      name: '회의 보조 AI, 씽큐',
      overview: '기존 프로젝트 개요',
      perspectiveLabel: 'PM',
      perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
      materials: [],
    }

    renderProjectMainboardPage({ loadProjects: vi.fn().mockResolvedValue([project]) })

    await screen.findByRole('heading', { name: project.name })
    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 정보 수정하기' }))

    const dialog = screen.getByRole('dialog', { name: '프로젝트 설정' })
    const nameInput = within(dialog).getByRole('textbox', { name: '이름' })
    await user.clear(nameInput)
    await user.type(nameInput, '수정된 씽큐 프로젝트')
    await user.click(within(dialog).getByRole('button', { name: '저장하기' }))

    expect(await screen.findByRole('heading', { name: '수정된 씽큐 프로젝트' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '수정된 씽큐 프로젝트' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
  it('shows an error toast when the initial project list fails', async () => {
    const loadProjects = vi.fn(() => Promise.reject(new Error('network error')))

    renderProjectMainboardPage({ loadProjects })

    const errorToast = await screen.findByRole('status', {
      name: '\uD504\uB85C\uC81D\uD2B8 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
    })

    expect(errorToast).toHaveTextContent(
      '\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
    )
  })
})
