import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { MeetingHeaderViewModel } from '../../../entities/meeting'
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
}

const actions = {
  onEndMeeting: vi.fn(),
  onOpenMoreMenu: vi.fn(),
  onOpenParticipants: vi.fn(),
  onToggleRecording: vi.fn(),
}

describe('MeetingHeader', () => {
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
