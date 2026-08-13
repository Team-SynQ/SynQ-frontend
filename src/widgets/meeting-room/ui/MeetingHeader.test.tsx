import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { MeetingHeaderViewModel } from '../../../entities/meeting'
import pauseIcon from '../../../shared/assets/icons/pause.svg'
import playIcon from '../../../shared/assets/icons/play.svg'
import { MeetingHeader } from './MeetingHeader'

const baseModel: MeetingHeaderViewModel = {
  elapsedSeconds: 0,
  isHost: true,
  liveStatus: 'live',
  meetingId: 'demo',
  meetingTitle: '2차 대면회의',
  participantCount: 4,
  projectTitle: '서비스디자인',
  recordingState: 'recording',
  recordingControlDisabled: false,
}

const actions = {
  onEndMeeting: vi.fn(),
  onOpenMoreMenu: vi.fn(),
  onOpenParticipants: vi.fn(),
  onToggleRecording: vi.fn(),
}

describe('MeetingHeader', () => {
  it('switches between the pause and resume controls', () => {
    const { container, rerender } = render(
      <MeetingHeader
        actions={actions}
        model={baseModel}
        moreMenuOpen={false}
        participantsOpen={false}
      />,
    )

    expect(screen.getByRole('button', { name: '회의 일시정지' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(container.querySelector('button[aria-label="회의 일시정지"] img')).toHaveAttribute(
      'src',
      pauseIcon,
    )

    rerender(
      <MeetingHeader
        actions={actions}
        model={{ ...baseModel, recordingState: 'paused' }}
        moreMenuOpen={false}
        participantsOpen={false}
      />,
    )

    expect(screen.getByRole('button', { name: '회의 다시 시작' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(container.querySelector('button[aria-label="회의 다시 시작"] img')).toHaveAttribute(
      'src',
      playIcon,
    )
  })

  it('disables the recording control while reconnecting', () => {
    render(
      <MeetingHeader
        actions={actions}
        model={{ ...baseModel, recordingControlDisabled: true }}
        moreMenuOpen={false}
        participantsOpen={false}
      />,
    )

    expect(screen.getByRole('button', { name: '회의 일시정지' })).toBeDisabled()
  })

  // 참여자는 회의를 멈출 수 없다.
  it('참여자에게는 일시정지 버튼을 보여 주지 않는다', () => {
    render(
      <MeetingHeader
        actions={actions}
        model={{ ...baseModel, isHost: false }}
        moreMenuOpen={false}
        participantsOpen={false}
      />,
    )

    expect(screen.queryByRole('button', { name: '회의 일시정지' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '회의 다시 시작' })).not.toBeInTheDocument()
  })

  it.each([
    [true, '회의 종료'],
    [false, '나가기'],
  ])('renders the meeting exit action for host=%s', (isHost, label) => {
    render(
      <MeetingHeader
        actions={actions}
        model={{ ...baseModel, isHost }}
        moreMenuOpen={false}
        participantsOpen={false}
      />,
    )

    expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
  })
})
