import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { MeetingParticipant } from '../model/meetingControls.types'
import { MeetingParticipantsPopover } from './MeetingParticipantsPopover'

const participants: MeetingParticipant[] = [
  {
    id: 'you',
    name: '윤금서',
    role: 'Design',
    isCurrentUser: true,
    isHost: true,
    isMicrophoneOn: true,
  },
  { id: 'design', name: '이동희', role: 'Design' },
  { id: 'pm', name: '이소미', role: 'PM' },
  { id: 'server', name: '김도진', role: 'Server' },
]

describe('MeetingParticipantsPopover', () => {
  it('renders participants in order with current-user details', () => {
    render(
      <MeetingParticipantsPopover
        onClose={vi.fn()}
        open
        participants={participants}
      />,
    )

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveClass('h-[42px]')
    expect(items[0]).toHaveClass('gap-l')
    expect(screen.getByTestId('participant-info-you')).toHaveClass('w-[226px]')
    expect(screen.getByTestId('participant-avatar-you')).toHaveClass('size-[24px]')
    expect(screen.getByTestId('participant-microphone-you')).toHaveClass('size-[24px]')
    expect(items[0]).toHaveTextContent('윤금서/Design (you)')
    expect(items[0]).toHaveTextContent('진행자')
    expect(items[0]).toHaveTextContent('마이크 사용 중')
    expect(items[1]).toHaveTextContent('이동희/Design')
    expect(items[2]).toHaveTextContent('이소미/PM')
    expect(items[3]).toHaveTextContent('김도진/Server')
  })

  it('dismisses on Escape', () => {
    const onClose = vi.fn()
    const triggerRef = createRef<HTMLButtonElement>()

    render(
      <>
        <button ref={triggerRef} type="button">참여자</button>
        <MeetingParticipantsPopover
          onClose={onClose}
          open
          participants={participants}
          triggerRef={triggerRef}
        />
      </>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
