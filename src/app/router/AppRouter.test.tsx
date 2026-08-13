import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../../App'
import { meetingLifecycleApi, meetingTranscriptionGateway } from '../../entities/meeting'
import { projectApi } from '../../entities/project'
import { userApi } from '../../entities/user'
import { projectMockActorFixture } from '../../shared/api/mock/fixtures/projects.fixture'
import { authService } from '../../shared/api/services/auth.service'
import { meetingService } from '../../shared/api/services/meeting.service'
import { transcriptService } from '../../shared/api/services/transcript.service'
import { userService } from '../../shared/api/services/user.service'

async function renderAppAt(path: string) {
  window.history.pushState({}, '', path)
  const result = render(<App />)
  // 로그인 가드가 내 정보를 받아올 때까지 한 번 흘려보냅니다.
  await act(async () => {})
  return result
}

beforeEach(() => {
  window.localStorage.setItem('accessToken', 'test-access-token')
  vi.spyOn(userApi, 'getMe').mockResolvedValue({
    userId: projectMockActorFixture.userId,
    name: projectMockActorFixture.name,
    email: projectMockActorFixture.email,
    provider: 'KAKAO',
    profileImageUrl: null,
  })
  vi.spyOn(userApi, 'getMyRoleProfiles').mockResolvedValue([])
  vi.spyOn(projectApi, 'listProjects').mockResolvedValue([])

  // 회의 진행 화면은 실제 API를 쓴다. 라우팅만 확인하므로 전송 계층은 막아 둔다.
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
    paused: false,
    activeSeconds: 0,
  }))
  vi.spyOn(transcriptService, 'listSegments').mockImplementation(async (meetingId) => ({
    meetingId,
    segments: [],
  }))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.useRealTimers()
  window.sessionStorage.clear()
  window.localStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('AppRouter', () => {
  it('moves landing to onboarding after the existing animation timer', async () => {
    vi.useFakeTimers()
    await renderAppAt('/')

    expect(screen.getByAltText('SynQ 심볼 로고')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(window.location.pathname).toBe('/onboarding')
    expect(
      screen.getByRole('heading', {
        name: '회의 중, 이해하지 못한 채 넘어간 순간이 있나요?',
      }),
    ).toBeInTheDocument()
  })

  it('opens onboarding directly and moves to login when skipped', async () => {
    const user = userEvent.setup()
    await renderAppAt('/onboarding')

    expect(
      screen.getByRole('heading', {
        name: '회의 중, 이해하지 못한 채 넘어간 순간이 있나요?',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '건너뛰기' }))

    expect(screen.getByRole('button', { name: '카카오로 계속하기' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it('stores an OAuth state before starting Kakao login', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_KAKAO_CLIENT_ID', 'test-kakao-client')
    vi.stubEnv('VITE_KAKAO_REDIRECT_URI', 'http://localhost:5173/login/callback')
    await renderAppAt('/login')

    await user.click(screen.getByRole('button', { name: '카카오로 계속하기' }))

    expect(window.sessionStorage.getItem('kakaoOAuthState')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('rejects a Kakao callback whose OAuth state does not match', async () => {
    const kakaoLogin = vi.spyOn(authService, 'kakaoLogin')
    window.sessionStorage.setItem('kakaoOAuthState', 'expected-state')

    await renderAppAt('/login/callback?code=test-code&state=unexpected-state')

    await waitFor(() => {
      expect(screen.getByText('소셜 인증 실패')).toBeInTheDocument()
    })
    expect(kakaoLogin).not.toHaveBeenCalled()
    expect(window.sessionStorage.getItem('kakaoOAuthState')).toBeNull()
  })

  it('submits a Kakao code only when the OAuth state matches', async () => {
    vi.stubEnv('VITE_KAKAO_REDIRECT_URI', 'http://localhost:5173/login/callback')
    const kakaoLogin = vi.spyOn(authService, 'kakaoLogin').mockResolvedValue({
      isSuccess: true,
      code: 'COMMON200',
      message: '성공입니다.',
      result: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        isNewUser: true,
        onboardingCompleted: false,
      },
    })
    window.sessionStorage.setItem('kakaoOAuthState', 'matching-state')

    await renderAppAt('/login/callback?code=test-code&state=matching-state')

    await waitFor(() => {
      expect(kakaoLogin).toHaveBeenCalledWith({
        code: 'test-code',
        redirectUri: 'http://localhost:5173/login/callback',
      })
    })
    expect(window.sessionStorage.getItem('kakaoOAuthState')).toBeNull()
  })

  it('redirects the setup index route to role selection', async () => {
    await renderAppAt('/setup')

    await waitFor(() => expect(window.location.pathname).toBe('/setup/role'))
  })

  it('moves role and perspective selections to the preview URL', async () => {
    vi.spyOn(userService, 'createRoleProfile').mockResolvedValue({
      isSuccess: true,
      code: 'COMMON201',
      message: '성공적으로 응답이 생성되었습니다.',
      result: {
        id: 1,
        isDefault: false,
        role: '개발/기술',
        detailRole: '개발/기술',
        perspectives: ['일정'],
      },
    })

    const user = userEvent.setup()
    await renderAppAt('/setup/role')

    const roleButton = screen.getByAltText('개발/기술').closest('button')
    expect(roleButton).not.toBeNull()

    await user.click(roleButton!)
    await user.click(screen.getByRole('button', { name: '다음' }))

    await waitFor(() => expect(window.location.pathname).toBe('/setup/perspectives'))

    await user.click(screen.getByRole('button', { name: '일정' }))
    await user.click(screen.getByRole('button', { name: '다음' }))

    await waitFor(() => expect(window.location.pathname).toBe('/setup/preview'))
    expect(screen.getByRole('heading', { name: '선택 결과 미리보기' })).toBeInTheDocument()
    expect(screen.getByText('개발/기술')).toBeInTheDocument()
    expect(screen.getByText('일정')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '설정 완료' }))

    await waitFor(() => expect(window.location.pathname).toBe('/projects'))
  })

  it('신규 가입자가 온보딩을 마치면 보관해 둔 초대 화면으로 돌아간다', async () => {
    vi.spyOn(userService, 'createRoleProfile').mockResolvedValue({
      isSuccess: true,
      code: 'COMMON201',
      message: '성공적으로 응답이 생성되었습니다.',
      result: {
        id: 1,
        isDefault: false,
        role: '개발/기술',
        detailRole: '개발/기술',
        perspectives: ['일정'],
      },
    })
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockResolvedValue({
      projectId: 1,
      title: '서비스 디자인',
      description: null,
      currentMemberCount: 2,
      maxMemberCount: 6,
      alreadyJoined: false,
      expiresAt: '2026-08-20T00:00:00.000Z',
    })
    // 로그인 콜백이 온보딩이 필요한 사용자의 초대 토큰을 남겨 둔 상태입니다.
    window.sessionStorage.setItem('pendingInviteToken', 'invite-token-1')

    const user = userEvent.setup()
    await renderAppAt('/setup/role')

    const roleButton = screen.getByAltText('개발/기술').closest('button')
    await user.click(roleButton!)
    await user.click(screen.getByRole('button', { name: '다음' }))
    await waitFor(() => expect(window.location.pathname).toBe('/setup/perspectives'))

    await user.click(screen.getByRole('button', { name: '일정' }))
    await user.click(screen.getByRole('button', { name: '다음' }))
    await waitFor(() => expect(window.location.pathname).toBe('/setup/preview'))

    await user.click(screen.getByRole('button', { name: '설정 완료' }))

    await waitFor(() => expect(window.location.pathname).toBe('/invite/invite-token-1'))
    expect(window.sessionStorage.getItem('pendingInviteToken')).toBeNull()
  })

  it('opens the empty project mainboard directly', async () => {
    vi.spyOn(projectApi, 'listProjects').mockResolvedValue([])

    await renderAppAt('/projects')

    expect(await screen.findByRole('button', { name: '프로젝트 생성하기' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/projects')
    expect(screen.getByText(projectMockActorFixture.name)).toBeInTheDocument()
    expect(screen.getByText(projectMockActorFixture.email)).toBeInTheDocument()
  })

  it('opens account settings directly', async () => {
    await renderAppAt('/settings/account')

    expect(screen.getByRole('heading', { name: '계정 정보 및 보안' })).toBeInTheDocument()
    expect(screen.getAllByText(projectMockActorFixture.email)).toHaveLength(2)
    expect(window.location.pathname).toBe('/settings/account')
  })

  it('opens help from the sidebar profile menu', async () => {
    const user = userEvent.setup()
    await renderAppAt('/settings/account')

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(projectMockActorFixture.name),
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: '도움말' }))

    expect(window.location.pathname).toBe('/settings/help')
    expect(screen.getByRole('heading', { name: '도움말' })).toBeInTheDocument()
  })

  it('opens policy documents directly', async () => {
    await renderAppAt('/settings/policy')

    expect(window.location.pathname).toBe('/settings/policy')
    expect(screen.getByRole('heading', { name: '정책 문서' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '이용 약관' })).toHaveAttribute('aria-selected', 'true')
  })

  it('opens project creation from the account settings sidebar', async () => {
    const user = userEvent.setup()
    await renderAppAt('/settings/account')

    await user.click(screen.getByRole('button', { name: '프로젝트 추가' }))

    expect(window.location.pathname).toBe('/projects')
    expect(await screen.findByRole('heading', { name: '프로젝트 생성' })).toBeInTheDocument()
  })

  it('opens account settings from the project sidebar menu', async () => {
    const user = userEvent.setup()
    await renderAppAt('/projects')

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(projectMockActorFixture.name),
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: '계정 정보 및 보안' }))

    expect(window.location.pathname).toBe('/settings/account')
    expect(screen.getByRole('heading', { name: '계정 정보 및 보안' })).toBeInTheDocument()
  })

  it('opens the existing live meeting page directly', async () => {
    await renderAppAt('/meetings/1/live')

    expect(await screen.findByRole('button', { name: '회의 종료' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/meetings/1/live')
  })

  it('opens the implemented meeting detail using the route record id', async () => {
    vi.spyOn(meetingService, 'getOverallSummary').mockResolvedValue({
      meetingId: 999,
      version: 1,
      title: '신규 온보딩 개선 및 출시 일정 논의',
      generatedAt: '2026-08-05T00:00:00.000Z',
      keyTopics: ['온보딩', '일정'],
      oneLineSummary: '온보딩 개선 및 출시 일정 논의',
      discussionSections: [],
      decisions: [],
      tentativeDirections: [],
      confirmationItems: [],
    })
    vi.spyOn(meetingService, 'getPersonalSummary').mockResolvedValue({
      meetingId: 999,
      userId: 1,
      version: 1,
      role: 'HOST',
      generatedAt: '2026-08-05T00:00:00.000Z',
      personalSummary: '개인 요약 내용',
      keyPoints: [],
      myActionItems: [],
      followUpQuestions: [],
    })

    await renderAppAt('/meetings/999/detail')

    expect(
      await screen.findByRole('heading', {
        name: '신규 온보딩 개선 및 출시 일정 논의',
      }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/meetings/999/detail')
  })

  it('uses the route record id when editing a meeting detail title', async () => {
    const user = userEvent.setup()
    const updateTitleSpy = vi.spyOn(meetingService, 'updateMeetingTitle').mockResolvedValue({
      meetingId: 999,
      title: '변경된 상세 제목',
      userModified: true,
    })
    vi.spyOn(meetingService, 'getOverallSummary').mockResolvedValue({
      meetingId: 999,
      version: 1,
      title: '신규 온보딩 개선 및 출시 일정 논의',
      generatedAt: '2026-08-05T00:00:00.000Z',
      keyTopics: [],
      oneLineSummary: '',
      discussionSections: [],
      decisions: [],
      tentativeDirections: [],
      confirmationItems: [],
    })

    await renderAppAt('/meetings/999/detail')

    expect(
      await screen.findByRole('heading', {
        name: '신규 온보딩 개선 및 출시 일정 논의',
      }),
    ).toBeInTheDocument()

    const menuBtn = screen.getByRole('button', { name: /회의 설정|더보기/ })
    await user.click(menuBtn)

    const editOption = await screen.findByText('회의 제목 수정하기')
    await user.click(editOption)

    const titleInput = screen.getByPlaceholderText('회의 제목을 입력해 주세요')
    await user.clear(titleInput)
    await user.type(titleInput, '변경된 상세 제목')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(updateTitleSpy).toHaveBeenCalledWith(999, '변경된 상세 제목')
  })

  it('keeps the active meeting state isolated from a stale title update', async () => {
    const user = userEvent.setup()
    let resolveTitleUpdate:
      ((value: { meetingId: number; title: string; userModified: boolean }) => void) | undefined

    vi.spyOn(meetingService, 'getOverallSummary').mockImplementation(async (meetingId) => {
      if (meetingId === 456) {
        return {
          meetingId: 456,
          version: 1,
          title: '두 번째 회의 상세',
          generatedAt: '2026-08-05T00:00:00.000Z',
          keyTopics: [],
          oneLineSummary: '',
          discussionSections: [],
          decisions: [],
          tentativeDirections: [],
          confirmationItems: [],
        }
      }
      return {
        meetingId: 123,
        version: 1,
        title: '첫 번째 회의 상세',
        generatedAt: '2026-08-05T00:00:00.000Z',
        keyTopics: [],
        oneLineSummary: '',
        discussionSections: [],
        decisions: [],
        tentativeDirections: [],
        confirmationItems: [],
      }
    })

    const updateTitleSpy = vi.spyOn(meetingService, 'updateMeetingTitle').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveTitleUpdate = resolve
        }),
    )

    await renderAppAt('/meetings/123/detail')

    expect(await screen.findByRole('heading', { name: '첫 번째 회의 상세' })).toBeInTheDocument()

    const menuBtn = screen.getByRole('button', { name: /회의 설정|더보기/ })
    await user.click(menuBtn)

    const editOption = await screen.findByText('회의 제목 수정하기')
    await user.click(editOption)

    const titleInput = screen.getByPlaceholderText('회의 제목을 입력해 주세요')
    await user.clear(titleInput)
    await user.type(titleInput, '첫 번째 회의 변경 제목')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(updateTitleSpy).toHaveBeenCalledWith(123, '첫 번째 회의 변경 제목')

    if (!resolveTitleUpdate) throw new Error('title update was not started')
    const finishTitleUpdate = resolveTitleUpdate

    act(() => {
      window.history.pushState({}, '', '/meetings/456/detail')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(await screen.findByRole('heading', { name: '두 번째 회의 상세' })).toBeInTheDocument()

    const secondMenuBtn = screen.getByRole('button', { name: /회의 설정|더보기/ })
    await user.click(secondMenuBtn)

    const secondEditOption = await screen.findByText('회의 제목 수정하기')
    await user.click(secondEditOption)

    const secondTitleInput = screen.getByPlaceholderText('회의 제목을 입력해 주세요')
    await user.clear(secondTitleInput)
    await user.type(secondTitleInput, '두 번째 회의 편집 중')

    await act(async () => {
      finishTitleUpdate({ meetingId: 123, title: '첫 번째 회의 변경 제목', userModified: true })
    })

    expect(screen.getByRole('heading', { name: '두 번째 회의 상세' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '첫 번째 회의 변경 제목' }),
    ).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('회의 제목을 입력해 주세요')).toHaveValue(
      '두 번째 회의 편집 중',
    )
  })

  it('shows a recoverable error when a meeting detail cannot be loaded', async () => {
    vi.spyOn(meetingService, 'getOverallSummary').mockRejectedValue(
      new Error('meeting record not found'),
    )

    await renderAppAt('/meetings/deleted-record/detail')

    expect(await screen.findByRole('alert')).toHaveTextContent('회의 기록을 불러오지 못했습니다.')
    expect(screen.getByRole('button', { name: '메인보드로 이동' })).toBeInTheDocument()
  })

  it('allows direct access to a setup step without stored selections', async () => {
    await renderAppAt('/setup/preview')

    expect(screen.getByRole('heading', { name: '선택 결과 미리보기' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/setup/preview')
  })

  it('redirects unknown URLs to the landing route', async () => {
    await renderAppAt('/unknown')

    expect(screen.getByAltText('SynQ 심볼 로고')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })
})
