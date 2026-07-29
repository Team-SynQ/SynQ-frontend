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

  it('opens the existing live meeting page directly', async () => {
    renderAppAt('/meetings/demo/live')

    expect(await screen.findByRole('button', { name: '회의 종료' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/meetings/demo/live')
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
