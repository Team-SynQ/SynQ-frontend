import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { CompletedMeeting } from '../../../entities/meeting'
import { MeetingRecordActions } from './MeetingRecordActions'

const meeting: CompletedMeeting = {
  recordId: 'meeting-record-1',
  meetingId: 'demo',
  projectId: 'project-1',
  projectTitle: '서비스 디자인',
  meetingTitle: '4차 대면 회의',
  durationSeconds: 600,
  completedAt: '2026-07-27T01:00:00.000Z',
  host: {
    id: 'you',
    name: '윤금서',
    avatarKey: 'you',
  },
  overview: '회의 요약',
  keywords: ['일정'],
  decisions: ['결정'],
}

async function openActions(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '4차 대면 회의 더보기' }))
}

describe('MeetingRecordActions', () => {
  it('closes the title dialog and shows success after a rename resolves', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn().mockResolvedValue(undefined)
    render(<MeetingRecordActions meeting={meeting} onDelete={vi.fn()} onRename={onRename} />)

    await openActions(user)
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))
    const input = screen.getByLabelText('회의 제목')
    await user.clear(input)
    await user.type(input, '변경된 회의')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(onRename).toHaveBeenCalledWith(meeting.recordId, '변경된 회의')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByText('회의 기록 제목 변경 성공')).toBeInTheDocument()
  })

  it('keeps data unchanged through the callback and shows failure after a rename rejects', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn().mockRejectedValue(new Error('request failed'))
    render(<MeetingRecordActions meeting={meeting} onDelete={vi.fn()} onRename={onRename} />)

    await openActions(user)
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))
    const input = screen.getByLabelText('회의 제목')
    await user.clear(input)
    await user.type(input, '실패할 회의')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByText('회의 기록 제목 변경 실패')).toBeInTheDocument()
  })

  it('keeps the delete dialog locked until deletion resolves', async () => {
    const user = userEvent.setup()
    let resolveDelete: (() => void) | undefined
    const onDelete = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve
        }),
    )
    render(<MeetingRecordActions meeting={meeting} onDelete={onDelete} onRename={vi.fn()} />)

    await openActions(user)
    await user.click(screen.getByRole('menuitem', { name: '기록 삭제하기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '지우기' })).toBeDisabled()

    resolveDelete?.()

    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes the delete dialog after deletion rejects', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockRejectedValue(new Error('request failed'))
    render(<MeetingRecordActions meeting={meeting} onDelete={onDelete} onRename={vi.fn()} />)

    await openActions(user)
    await user.click(screen.getByRole('menuitem', { name: '기록 삭제하기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
