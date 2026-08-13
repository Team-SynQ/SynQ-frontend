import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { readMeetingRuntime, writeMeetingRuntime } from './meetingRuntime.storage'
import { useMeetingRuntime } from './useMeetingRuntime'

describe('useMeetingRuntime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // 서버가 보내 준 누적 시간으로 맞춘다. 진행자는 요청 응답에서, 참여자는 WebSocket 알림에서 받는다.
  it('syncs the paused state and elapsed time from the server', () => {
    const { result } = renderHook(() =>
      useMeetingRuntime({
        enabled: true,
        meetingId: '1',
        restoreConnection: vi.fn().mockResolvedValue(undefined),
      }),
    )

    expect(result.current).toMatchObject({
      activeSeconds: 0,
      canProgress: true,
      connectionState: 'connected',
      recordingState: 'recording',
    })

    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.activeSeconds).toBe(3)

    act(() => result.current.syncPauseState(true, 3))
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current).toMatchObject({
      activeSeconds: 3,
      canProgress: false,
      recordingState: 'paused',
    })

    act(() => result.current.syncPauseState(false, 3))
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.activeSeconds).toBe(5)
  })

  // 진행자와 참여자가 같은 값을 봐야 하므로 저장된 값보다 서버 값이 우선이다.
  it('prefers the server runtime over the persisted one', async () => {
    writeMeetingRuntime('1', { activeSeconds: 8, recordingState: 'recording' })

    const { result } = renderHook(() =>
      useMeetingRuntime({
        enabled: true,
        meetingId: '1',
        restoreConnection: vi.fn().mockResolvedValue(undefined),
        serverActiveSeconds: 42,
        serverPaused: true,
      }),
    )

    await act(async () => Promise.resolve())
    expect(result.current).toMatchObject({
      activeSeconds: 42,
      canProgress: false,
      recordingState: 'paused',
    })
  })

  it('restores recording intent while excluding reconnection downtime', async () => {
    writeMeetingRuntime('1', { activeSeconds: 8, recordingState: 'recording' })
    let resolveConnection!: () => void
    const connection = new Promise<void>((resolve) => {
      resolveConnection = resolve
    })

    const { result } = renderHook(() =>
      useMeetingRuntime({
        enabled: true,
        meetingId: '1',
        restoreConnection: () => connection,
      }),
    )

    expect(result.current).toMatchObject({
      activeSeconds: 8,
      canProgress: false,
      connectionNotice: 'unstable',
      connectionState: 'reconnecting',
      recordingState: 'recording',
    })

    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.activeSeconds).toBe(8)

    await act(async () => resolveConnection())
    expect(result.current).toMatchObject({
      connectionNotice: 'restored',
      connectionState: 'connected',
    })

    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.activeSeconds).toBe(10)
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.connectionNotice).toBeNull()
  })

  it('keeps a manually paused meeting paused after reconnection', async () => {
    writeMeetingRuntime('1', { activeSeconds: 8, recordingState: 'paused' })
    const { result } = renderHook(() =>
      useMeetingRuntime({
        enabled: true,
        meetingId: '1',
        restoreConnection: vi.fn().mockResolvedValue(undefined),
      }),
    )

    await act(async () => Promise.resolve())
    act(() => vi.advanceTimersByTime(3000))

    expect(result.current).toMatchObject({
      activeSeconds: 8,
      canProgress: false,
      recordingState: 'paused',
    })
  })

  it('freezes one duration for end retries and clears it after success', () => {
    const { result } = renderHook(() =>
      useMeetingRuntime({
        enabled: true,
        meetingId: '1',
        restoreConnection: vi.fn().mockResolvedValue(undefined),
      }),
    )

    act(() => vi.advanceTimersByTime(4000))
    let firstDuration = 0
    act(() => {
      firstDuration = result.current.freezeForEnd()
    })
    act(() => vi.advanceTimersByTime(3000))

    expect(firstDuration).toBe(4)
    expect(result.current.freezeForEnd()).toBe(4)
    expect(result.current.activeSeconds).toBe(4)

    act(() => result.current.clear())
    expect(readMeetingRuntime('1')).toBeNull()
  })
})
