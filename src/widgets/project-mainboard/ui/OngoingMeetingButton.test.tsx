import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OngoingMeetingButton } from './OngoingMeetingButton'

describe('OngoingMeetingButton', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('회의 시작 시각 기준 경과 시간을 1초마다 갱신한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-12T10:00:30Z'))

    render(<OngoingMeetingButton onJoin={vi.fn()} startedAt="2026-08-12T10:00:00Z" />)

    expect(screen.getByText('00:30')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('00:31')).toBeInTheDocument()
  })

  it('시작 시각을 해석할 수 없어도 버튼을 그린다', () => {
    render(<OngoingMeetingButton onJoin={vi.fn()} startedAt="알 수 없는 시각" />)

    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('누르면 참가를 요청한다', () => {
    const onJoin = vi.fn()
    render(<OngoingMeetingButton onJoin={onJoin} startedAt="2026-08-12T10:00:00Z" />)

    fireEvent.click(screen.getByRole('button', { name: '진행 중인 회의 참가하기' }))

    expect(onJoin).toHaveBeenCalledTimes(1)
  })
})
