import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { CompletedMeeting } from '../../../entities/meeting'
import { ProjectLatestMeetingSummary } from './ProjectLatestMeetingSummary'
import { ProjectMeetingHistory } from './ProjectMeetingHistory'

const meetings: CompletedMeeting[] = [
  {
    recordId: 'meeting-record-2',
    meetingId: 'demo',
    projectId: 'project-1',
    projectTitle: '서비스 디자인',
    meetingTitle: '두 번째 회의',
    durationSeconds: 3723,
    completedAt: new Date(2026, 6, 27, 12, 0).toISOString(),
    host: {
      id: 'you',
      name: '윤금서',
      avatarKey: 'you',
    },
    overview: '온보딩 개선 우선순위와 완료 기준을 중심으로 논의',
    keywords: ['온보딩 플로우', '일정 재조율'],
    decisions: ['온보딩 개선을 우선순위로 확정'],
  },
  {
    recordId: 'meeting-record-1',
    meetingId: 'demo',
    projectId: 'project-1',
    projectTitle: '서비스 디자인',
    meetingTitle: '첫 번째 회의',
    durationSeconds: 600,
    completedAt: new Date(2026, 6, 26, 12, 0).toISOString(),
    host: {
      id: 'pm',
      name: '이소민',
      avatarKey: 'pm',
    },
    overview: '이전 회의 요약',
    keywords: ['일정'],
    decisions: ['일정을 재확인'],
  },
]

describe('project meeting dashboard', () => {
  it('renders the newest meeting summary and opens its detail', async () => {
    const user = userEvent.setup()
    const onOpenMeetingSummary = vi.fn()

    render(
      <ProjectLatestMeetingSummary
        meeting={meetings[0]}
        onOpenMeetingSummary={onOpenMeetingSummary}
      />,
    )

    expect(screen.getByText('두 번째 회의')).toBeInTheDocument()
    expect(screen.getByText('26.07.27')).toBeInTheDocument()
    expect(screen.getByText('온보딩 개선 우선순위와 완료 기준을 중심으로 논의')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '자세히 보기' }))

    expect(onOpenMeetingSummary).toHaveBeenCalledWith('meeting-record-2')
  })

  it('renders meeting history newest first with duration, date, and host', () => {
    render(<ProjectMeetingHistory meetings={meetings} />)

    const rows = screen.getAllByRole('listitem')
    expect(within(rows[0]!).getByText('두 번째 회의')).toBeInTheDocument()
    expect(within(rows[0]!).getByText('온보딩 플로우 · 일정 재조율')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('첫 번째 회의')).toBeInTheDocument()
    expect(within(rows[0]!).getByText('01:02:03')).toBeInTheDocument()
    expect(within(rows[0]!).getByText('26.07.27')).toBeInTheDocument()
    expect(within(rows[0]!).getByText('윤금서')).toBeInTheDocument()
  })

  it.each([
    { missingCallback: 'both', onDeleteMeeting: undefined, onRenameMeeting: undefined },
    { missingCallback: 'delete', onDeleteMeeting: undefined, onRenameMeeting: vi.fn() },
    { missingCallback: 'rename', onDeleteMeeting: vi.fn(), onRenameMeeting: undefined },
  ])(
    'does not render record actions when the $missingCallback mutation callback is unavailable',
    ({ onDeleteMeeting, onRenameMeeting }) => {
      render(
        <ProjectMeetingHistory
          meetings={meetings}
          onDeleteMeeting={onDeleteMeeting}
          onRenameMeeting={onRenameMeeting}
        />,
      )

      expect(screen.queryByRole('button', { name: '두 번째 회의 더보기' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '첫 번째 회의 더보기' })).not.toBeInTheDocument()
    },
  )

  it('shows processing and completion status only on the matching meeting row', () => {
    const { rerender } = render(
      <ProjectMeetingHistory
        meetings={meetings}
        presentation={{
          recordId: 'meeting-record-2',
          status: 'processing',
        }}
      />,
    )

    let rows = screen.getAllByRole('listitem')
    expect(within(rows[0]!).getByRole('status', { name: '회의 기록 정리 중' })).toBeInTheDocument()
    expect(
      within(rows[1]!).queryByRole('status', { name: '회의 기록 정리 중' }),
    ).not.toBeInTheDocument()

    rerender(
      <ProjectMeetingHistory
        meetings={meetings}
        presentation={{
          recordId: 'meeting-record-2',
          status: 'completed',
        }}
      />,
    )

    rows = screen.getAllByRole('listitem')
    expect(
      within(rows[0]!).getByRole('status', { name: '회의 기록 정리 완료' }),
    ).toBeInTheDocument()
    expect(
      within(rows[1]!).queryByRole('status', { name: '회의 기록 정리 완료' }),
    ).not.toBeInTheDocument()
  })

  it('disables record actions only for the processing meeting', () => {
    render(
      <ProjectMeetingHistory
        meetings={meetings}
        onDeleteMeeting={vi.fn()}
        onRenameMeeting={vi.fn()}
        presentation={{
          recordId: 'meeting-record-2',
          status: 'processing',
        }}
      />,
    )

    expect(screen.getByRole('button', { name: '두 번째 회의 더보기' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '첫 번째 회의 더보기' })).toBeEnabled()
  })

  it('opens a meeting from its content but not from the more button', async () => {
    const user = userEvent.setup()
    const onOpenMeetingDetail = vi.fn()

    render(
      <ProjectMeetingHistory
        meetings={meetings}
        onDeleteMeeting={vi.fn()}
        onOpenMeetingDetail={onOpenMeetingDetail}
        onRenameMeeting={vi.fn()}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: '두 번째 회의 회의 기록 열기',
      }),
    )
    expect(onOpenMeetingDetail).toHaveBeenCalledWith('meeting-record-2')

    onOpenMeetingDetail.mockClear()
    await user.click(screen.getByRole('button', { name: '두 번째 회의 더보기' }))
    expect(onOpenMeetingDetail).not.toHaveBeenCalled()
  })
})
