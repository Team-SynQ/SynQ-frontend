import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App'
import { projectApi } from '../entities/project'
import { userApi } from '../entities/user'
import { ApiError } from '../shared/api/apiError'
import { projectMockActorFixture } from '../shared/api/mock/fixtures/projects.fixture'
import { userService } from '../shared/api/services/user.service'

const invitationInfoFixture = {
  projectId: 42,
  title: '회의 보조 AI, 씽큐',
  description: '회의를 돕는 AI 서비스',
  currentMemberCount: 5,
  maxMemberCount: 10,
  alreadyJoined: false,
  expiresAt: '2026-12-31T00:00:00.000Z',
  owner: {
    userId: 7,
    name: '김소유',
    profileImageUrl: null,
    roleCategory: 'PLANNING_OPERATION' as const,
  },
}

async function renderInviteAt(path: string) {
  window.history.pushState({}, '', path)
  const result = render(<App />)
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
  vi.spyOn(userService, 'getMe').mockResolvedValue({
    isSuccess: true,
    code: 'COMMON200',
    message: '성공입니다.',
    result: {
      userId: projectMockActorFixture.userId,
      name: projectMockActorFixture.name,
      email: projectMockActorFixture.email,
      provider: 'KAKAO',
      profileImageUrl: null,
    },
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  window.sessionStorage.clear()
  window.localStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('ProjectInvitePage', () => {
  it('shows the invitation confirm dialog from invitation info', async () => {
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockResolvedValue(invitationInfoFixture)

    await renderInviteAt('/invite/valid-token')

    expect(
      await screen.findByRole('heading', {
        name: '‘회의 보조 AI, 씽큐’ 프로젝트에 참여하시겠습니까?',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('현재 인원 5명, 최대 10명')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '참여 요청하기' })).toBeInTheDocument()

    // 소유자 이름·역할과 소유자 뱃지가 함께 보입니다.
    expect(screen.getByLabelText('프로젝트 소유자 김소유')).toBeInTheDocument()
    expect(screen.getByText('김소유/기획/운영')).toBeInTheDocument()
    expect(screen.getByText('소유자')).toBeInTheDocument()
  })

  it('keeps the confirm dialog readable when the owner info is missing', async () => {
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockResolvedValue({
      ...invitationInfoFixture,
      owner: undefined,
    })

    await renderInviteAt('/invite/valid-token')

    expect(await screen.findByRole('button', { name: '참여 요청하기' })).toBeInTheDocument()
    expect(screen.queryByText(/김소유/)).not.toBeInTheDocument()
    expect(screen.queryByText('소유자')).not.toBeInTheDocument()
  })

  async function completeRoleAndPerspectiveSetup(user: ReturnType<typeof userEvent.setup>) {
    const roleButton = screen.getByAltText('개발/기술').closest('button')
    expect(roleButton).not.toBeNull()
    await user.click(roleButton!)
    await user.click(screen.getByRole('button', { name: '다음' }))

    await screen.findByRole('heading', { name: /어떤 내용을 중요하게 보고 싶나요/ })
    await user.click(screen.getByRole('button', { name: '일정' }))
    await user.click(screen.getByRole('button', { name: '다음' }))

    await screen.findByRole('heading', { name: '선택 결과 미리보기' })
  }

  it('역할·관점을 고른 뒤 참여 요청을 보내고 승인 대기 안내와 함께 돌아간다', async () => {
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockResolvedValue(invitationInfoFixture)
    const createJoinRequest = vi.spyOn(projectApi, 'createProjectJoinRequest').mockResolvedValue({
      requestId: 7,
      projectId: 42,
      status: 'PENDING',
      requestedAt: '2026-08-13T00:00:00.000Z',
    })
    const user = userEvent.setup()

    await renderInviteAt('/invite/valid-token')
    await user.click(await screen.findByRole('button', { name: '참여 요청하기' }))

    // 요청에 역할·관점이 함께 실려야 하므로 설정을 먼저 거칩니다.
    const roleHeading = await screen.findByRole('heading', { name: /어떤 역할로 참여하시나요/ })
    expect(roleHeading).toHaveTextContent('회의 보조 AI, 씽큐')
    expect(window.location.pathname).toBe('/invite/setup/role')
    expect(createJoinRequest).not.toHaveBeenCalled()

    await completeRoleAndPerspectiveSetup(user)
    await user.click(screen.getByRole('button', { name: '설정 완료' }))

    await waitFor(() =>
      expect(createJoinRequest).toHaveBeenCalledWith(42, {
        inviteToken: 'valid-token',
        settingSource: 'PROJECT_CUSTOM',
        roleCategory: 'DEV_TECH',
        perspectives: ['SCHEDULE'],
      }),
    )
    await waitFor(() => expect(window.location.pathname).toBe('/projects'))
    expect(await screen.findByText('요청 전송 성공')).toBeInTheDocument()
  })

  it('세션이 만료돼 요청이 401이면 초대 토큰을 보관하고 로그인으로 보낸다', async () => {
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockResolvedValue(invitationInfoFixture)
    vi.spyOn(projectApi, 'createProjectJoinRequest').mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다.'),
    )
    const user = userEvent.setup()

    await renderInviteAt('/invite/valid-token')
    await user.click(await screen.findByRole('button', { name: '참여 요청하기' }))
    await screen.findByRole('heading', { name: /어떤 역할로 참여하시나요/ })

    await completeRoleAndPerspectiveSetup(user)
    await user.click(screen.getByRole('button', { name: '설정 완료' }))

    await waitFor(() => expect(window.location.pathname).toBe('/login'))
    expect(window.sessionStorage.getItem('pendingInviteToken')).toBe('valid-token')
  })

  it('참여 요청 전송에 실패하면 이동하지 않고 고른 값을 지킨다', async () => {
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockResolvedValue(invitationInfoFixture)
    vi.spyOn(projectApi, 'createProjectJoinRequest').mockRejectedValue(
      new Error('참여 요청을 보내지 못했습니다.'),
    )
    const user = userEvent.setup()

    await renderInviteAt('/invite/valid-token')
    await user.click(await screen.findByRole('button', { name: '참여 요청하기' }))
    await screen.findByRole('heading', { name: /어떤 역할로 참여하시나요/ })

    await completeRoleAndPerspectiveSetup(user)
    await user.click(screen.getByRole('button', { name: '설정 완료' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('참여 요청을 보내지 못했습니다.')
    expect(window.location.pathname).toBe('/invite/setup/preview')
    expect(screen.getByText('개발/기술')).toBeInTheDocument()
    expect(screen.getByText('일정')).toBeInTheDocument()
  })

  it('shows the generic rejected dialog for an invalid invitation link', async () => {
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockRejectedValue(new Error('expired'))

    await renderInviteAt('/invite/expired-token')

    expect(
      await screen.findByRole('heading', { name: '프로젝트 참여가 승인되지 않았어요.' }),
    ).toBeInTheDocument()
  })

  it('skips straight to the approved dialog and mainboard when already joined', async () => {
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockResolvedValue({
      ...invitationInfoFixture,
      alreadyJoined: true,
    })
    const user = userEvent.setup()

    await renderInviteAt('/invite/valid-token')

    expect(
      await screen.findByRole('heading', { name: '‘회의 보조 AI, 씽큐’ 참여가 승인되었어요.' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '참여 요청하기' })).not.toBeInTheDocument()

    // 이미 참여한 사용자는 설정 플로우 없이 바로 메인보드로 돌아갑니다.
    await user.click(screen.getByRole('button', { name: '프로젝트 보기' }))

    await waitFor(() => expect(window.location.pathname).toBe('/projects'))
  })

  it('stores the invite token and moves to login when logged out', async () => {
    window.localStorage.clear()
    vi.spyOn(projectApi, 'getProjectInvitationInfo').mockResolvedValue(invitationInfoFixture)
    const joinProject = vi.spyOn(projectApi, 'joinProject')
    const user = userEvent.setup()

    await renderInviteAt('/invite/valid-token')
    await user.click(await screen.findByRole('button', { name: '참여 요청하기' }))

    expect(joinProject).not.toHaveBeenCalled()
    expect(window.sessionStorage.getItem('pendingInviteToken')).toBe('valid-token')
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })
})
