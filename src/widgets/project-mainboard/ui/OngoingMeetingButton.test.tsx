import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OngoingMeetingButton } from './OngoingMeetingButton'

describe('OngoingMeetingButton', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('서버가 준 누적 활성 시간부터 1초마다 갱신한다', () => {
    vi.useFakeTimers()

    render(<OngoingMeetingButton activeSeconds={30} onJoin={vi.fn()} paused={false} />)

    expect(screen.getByText('00:30')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('00:31')).toBeInTheDocument()
  })

  // 진행자가 회의를 멈추면 이 버튼의 시간도 멈춰야 회의 화면과 어긋나지 않는다.
  it('일시정지 중에는 시간이 흐르지 않는다', () => {
    vi.useFakeTimers()

    render(<OngoingMeetingButton activeSeconds={163} onJoin={vi.fn()} paused />)

    expect(screen.getByText('02:43')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText('02:43')).toBeInTheDocument()
  })

  it('누르면 참가를 요청한다', () => {
    const onJoin = vi.fn()
    render(<OngoingMeetingButton activeSeconds={0} onJoin={onJoin} paused={false} />)

    fireEvent.click(screen.getByRole('button', { name: '진행 중인 회의 참가하기' }))

    expect(onJoin).toHaveBeenCalledTimes(1)
  })
})
