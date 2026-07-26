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
})
