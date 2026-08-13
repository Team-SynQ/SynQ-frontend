import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { MeetingParticipant } from '../model/meetingControls.types'
import { MeetingParticipantsPopover } from './MeetingParticipantsPopover'

const participants: MeetingParticipant[] = [
  {
    id: 'you',
    name: '윤금서',
    isCurrentUser: true,
    isHost: true,
  },
  { id: 'design', name: '이동희' },
  { id: 'pm', name: '이소미' },
  { id: 'server', name: '김도진' },
]

describe('MeetingParticipantsPopover', () => {
  it('renders participants in order with current-user details', () => {
    render(<MeetingParticipantsPopover onClose={vi.fn()} open participants={participants} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveClass('h-[42px]')
    expect(items[0]).toHaveClass('gap-l')
    expect(screen.getByTestId('participant-info-you')).toHaveClass('w-[226px]')
    expect(screen.getByTestId('participant-avatar-you')).toHaveClass('size-[24px]')
    expect(items[0]).toHaveTextContent('윤금서 (you)')
    expect(items[0]).toHaveTextContent('진행자')
    expect(items[1]).toHaveTextContent('이동희')
    expect(items[2]).toHaveTextContent('이소미')
    expect(items[3]).toHaveTextContent('김도진')
  })

  it('프로필 이미지가 있으면 이미지로, 없으면 이름 첫 글자로 그린다', () => {
    render(
      <MeetingParticipantsPopover
        onClose={vi.fn()}
        open
        participants={[
          { id: '1', name: '윤금서', avatarSrc: 'https://cdn.example.com/profile/1.png' },
          { id: '2', name: '이동희' },
        ]}
      />,
    )

    expect(screen.getByTestId('participant-avatar-1')).toHaveAttribute(
      'src',
      'https://cdn.example.com/profile/1.png',
    )
    expect(screen.getByTestId('participant-avatar-2')).toHaveTextContent('이')
  })

  // src가 깨졌을 때 폴백이 없으면 alt=""인 빈 이미지가 자리만 차지해 프로필이 비어 보인다.
  it('프로필 이미지를 불러오지 못하면 이름 첫 글자로 대신한다', () => {
    render(
      <MeetingParticipantsPopover
        onClose={vi.fn()}
        open
        participants={[
          { id: '1', name: '윤금서', avatarSrc: 'https://cdn.example.com/broken.png' },
        ]}
      />,
    )

    fireEvent.error(screen.getByTestId('participant-avatar-1'))

    expect(screen.getByTestId('participant-avatar-1')).toHaveTextContent('윤')
  })

  it('dismisses on Escape', () => {
    const onClose = vi.fn()
    const triggerRef = createRef<HTMLButtonElement>()

    render(
      <>
        <button ref={triggerRef} type="button">
          참여자
        </button>
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
