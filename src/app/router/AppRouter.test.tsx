import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '../../App'
import * as meetingMockService from '../../shared/api/mock/services/meeting.mock'
import { projectMockActorFixture } from '../../shared/api/mock/fixtures/projects.fixture'

function renderAppAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  window.sessionStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('AppRouter', () => {
  it('moves landing to onboarding after the existing animation timer', () => {
    vi.useFakeTimers()
    renderAppAt('/')

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
    renderAppAt('/onboarding')

    expect(
      screen.getByRole('heading', {
        name: '회의 중, 이해하지 못한 채 넘어간 순간이 있나요?',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '건너뛰기' }))

    expect(screen.getByRole('button', { name: '카카오로 계속하기' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it('bypasses social login and opens role setup', async () => {
    const user = userEvent.setup()
    renderAppAt('/login')

    await user.click(screen.getByRole('button', { name: '카카오로 계속하기' }))

    expect(window.location.pathname).toBe('/setup/role')
  })

  it('redirects the setup index route to role selection', () => {
    renderAppAt('/setup')

    expect(window.location.pathname).toBe('/setup/role')
  })

  it('moves role and perspective selections to the preview URL', async () => {
    const user = userEvent.setup()
    renderAppAt('/setup/role')

    const roleButton = screen.getByAltText('개발/기술').closest('button')
    expect(roleButton).not.toBeNull()

    await user.click(roleButton!)
    await user.click(screen.getByRole('button', { name: '다음' }))

    expect(window.location.pathname).toBe('/setup/perspectives')

    await user.click(screen.getByRole('button', { name: '일정' }))
    await user.click(screen.getByRole('button', { name: '다음' }))

    expect(window.location.pathname).toBe('/setup/preview')
    expect(screen.getByRole('heading', { name: '선택 결과 미리보기' })).toBeInTheDocument()
    expect(screen.getByText('개발/기술')).toBeInTheDocument()
    expect(screen.getByText('일정')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '설정 완료' }))

    expect(window.location.pathname).toBe('/projects')
  })

  it('opens the empty project mainboard directly', () => {
    renderAppAt('/projects')

    expect(screen.getByRole('button', { name: '프로젝트 생성하기' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/projects')
    expect(screen.getByText(projectMockActorFixture.name)).toBeInTheDocument()
    expect(screen.getByText(projectMockActorFixture.email)).toBeInTheDocument()
  })

  it('opens account settings directly', () => {
    renderAppAt('/settings/account')

    expect(screen.getByRole('heading', { name: '계정 정보 및 보안' })).toBeInTheDocument()
    expect(screen.getAllByText(projectMockActorFixture.email)).toHaveLength(2)
    expect(window.location.pathname).toBe('/settings/account')
  })

  it('opens help from the account settings panel', async () => {
    const user = userEvent.setup()
    renderAppAt('/settings/account')

    await user.click(screen.getByRole('button', { name: '도움말' }))

    expect(window.location.pathname).toBe('/settings/help')
    expect(screen.getByRole('heading', { name: '도움말' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '도움말' })).toHaveAttribute('aria-current', 'page')
  })

  it('opens policy documents directly', () => {
    renderAppAt('/settings/policy')

    expect(window.location.pathname).toBe('/settings/policy')
    expect(screen.getByRole('heading', { name: '정책 문서' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '이용 약관' })).toHaveAttribute('aria-selected', 'true')
  })

  it('opens project creation from the account settings sidebar', async () => {
    const user = userEvent.setup()
    renderAppAt('/settings/account')

    await user.click(screen.getByRole('button', { name: '프로젝트 추가' }))

    expect(window.location.pathname).toBe('/projects')
    expect(await screen.findByRole('heading', { name: '프로젝트 생성' })).toBeInTheDocument()
  })

  it('opens account settings from the project sidebar menu', async () => {
    const user = userEvent.setup()
    renderAppAt('/projects')

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
    renderAppAt('/meetings/1/live')

    expect(await screen.findByRole('button', { name: '회의 종료' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/meetings/1/live')
  })

  it('opens the implemented meeting detail using the route record id', async () => {
    const fetchMeetingDetail = vi.spyOn(meetingMockService, 'fetchMeetingDetail')

    renderAppAt('/meetings/meeting-record-999/detail')

    expect(
      await screen.findByRole('heading', {
        name: '신규 온보딩 개선 및 출시 일정 논의',
      }),
    ).toBeInTheDocument()
    expect(fetchMeetingDetail).toHaveBeenCalledWith('meeting-record-999')
    expect(window.location.pathname).toBe('/meetings/meeting-record-999/detail')
  })

  it('uses the route record id when editing a meeting detail title', async () => {
    const user = userEvent.setup()
    const updateMeetingTitle = vi
      .spyOn(meetingMockService, 'updateMeetingTitle')
      .mockResolvedValue(true)

    renderAppAt('/meetings/meeting-record-999/detail')

    expect(
      await screen.findByRole('heading', {
        name: '신규 온보딩 개선 및 출시 일정 논의',
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '더보기 메뉴' }))
    await user.click(screen.getByRole('button', { name: '회의 제목 수정하기' }))
    const titleInput = screen.getByPlaceholderText('회의 제목을 입력해 주세요')
    await user.clear(titleInput)
    await user.type(titleInput, '변경된 상세 제목')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(await screen.findByRole('heading', { name: '변경된 상세 제목' })).toBeInTheDocument()
    expect(updateMeetingTitle).toHaveBeenCalledWith('meeting-record-999', '변경된 상세 제목')
  })

  it('keeps the active meeting state isolated from a stale title update', async () => {
    const user = userEvent.setup()
    const firstMeeting = await meetingMockService.fetchMeetingDetail('meeting-record-first')
    const secondMeeting = {
      ...firstMeeting,
      recordId: 'meeting-record-second',
      meetingTitle: '두 번째 회의 상세',
    }
    let resolveTitleUpdate: ((updated: boolean) => void) | undefined

    vi.spyOn(meetingMockService, 'fetchMeetingDetail').mockImplementation((recordId) =>
      Promise.resolve(recordId === secondMeeting.recordId ? secondMeeting : firstMeeting),
    )
    const updateMeetingTitle = vi
      .spyOn(meetingMockService, 'updateMeetingTitle')
      .mockImplementation(
        () =>
          new Promise<boolean>((resolve) => {
            resolveTitleUpdate = resolve
          }),
      )

    renderAppAt('/meetings/meeting-record-first/detail')

    expect(
      await screen.findByRole('heading', { name: firstMeeting.meetingTitle }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '더보기 메뉴' }))
    await user.click(screen.getByRole('button', { name: '회의 제목 수정하기' }))
    const titleInput = screen.getByPlaceholderText('회의 제목을 입력해 주세요')
    await user.clear(titleInput)
    await user.type(titleInput, '첫 번째 회의 변경 제목')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))
    expect(updateMeetingTitle).toHaveBeenCalledWith(
      'meeting-record-first',
      '첫 번째 회의 변경 제목',
    )
    if (!resolveTitleUpdate) throw new Error('title update was not started')
    const finishTitleUpdate = resolveTitleUpdate

    act(() => {
      window.history.pushState({}, '', '/meetings/meeting-record-second/detail')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(
      await screen.findByRole('heading', { name: secondMeeting.meetingTitle }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '더보기 메뉴' }))
    await user.click(screen.getByRole('button', { name: '회의 제목 수정하기' }))
    const secondTitleInput = screen.getByPlaceholderText('회의 제목을 입력해 주세요')
    await user.clear(secondTitleInput)
    await user.type(secondTitleInput, '두 번째 회의 편집 중')

    await act(async () => {
      finishTitleUpdate(true)
    })

    expect(screen.getByRole('heading', { name: secondMeeting.meetingTitle })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '첫 번째 회의 변경 제목' }),
    ).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('회의 제목을 입력해 주세요')).toHaveValue(
      '두 번째 회의 편집 중',
    )
  })

  it('shows a recoverable error when a meeting detail cannot be loaded', async () => {
    vi.spyOn(meetingMockService, 'fetchMeetingDetail').mockRejectedValueOnce(
      new Error('meeting record not found'),
    )

    renderAppAt('/meetings/deleted-record/detail')

    expect(await screen.findByRole('alert')).toHaveTextContent('회의 기록을 불러오지 못했습니다.')
    expect(screen.getByRole('button', { name: '메인보드로 이동' })).toBeInTheDocument()
  })

  it('allows direct access to a setup step without stored selections', () => {
    renderAppAt('/setup/preview')

    expect(screen.getByRole('heading', { name: '선택 결과 미리보기' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/setup/preview')
  })

  it('redirects unknown URLs to the landing route', () => {
    renderAppAt('/unknown')

    expect(screen.getByAltText('SynQ 심볼 로고')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })
})
