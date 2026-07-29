import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  MEETING_HISTORY_PROCESSING_MS,
  MEETING_SUMMARY_PROCESSING_MS,
  useMeetingProcessingFlow,
} from './useMeetingProcessingFlow'

describe('useMeetingProcessingFlow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stays idle when there is no completed meeting record to process', () => {
    const { result } = renderHook(() => useMeetingProcessingFlow({}))

    expect(result.current.phase).toBe('idle')
    expect(result.current.processingRecordId).toBeUndefined()
  })

  it('moves from summary processing to history processing at the configured boundary', () => {
    const { result } = renderHook(() =>
      useMeetingProcessingFlow({ recordId: 'meeting-record-new' }),
    )

    expect(result.current.phase).toBe('summaryProcessing')
    expect(result.current.processingRecordId).toBe('meeting-record-new')

    act(() => {
      vi.advanceTimersByTime(MEETING_SUMMARY_PROCESSING_MS - 1)
    })
    expect(result.current.phase).toBe('summaryProcessing')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.phase).toBe('historyProcessing')
  })

  it('shows completion only after the history processing duration', () => {
    const { result } = renderHook(() =>
      useMeetingProcessingFlow({ recordId: 'meeting-record-new' }),
    )

    act(() => {
      vi.advanceTimersByTime(MEETING_SUMMARY_PROCESSING_MS)
      vi.advanceTimersByTime(MEETING_HISTORY_PROCESSING_MS - 1)
    })
    expect(result.current.phase).toBe('historyProcessing')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.phase).toBe('completionVisible')
  })

  it('dismisses only a visible completion state', () => {
    const { result } = renderHook(() =>
      useMeetingProcessingFlow({ recordId: 'meeting-record-new' }),
    )

    act(() => {
      result.current.dismissCompletion()
    })
    expect(result.current.phase).toBe('summaryProcessing')

    act(() => {
      vi.advanceTimersByTime(MEETING_SUMMARY_PROCESSING_MS + MEETING_HISTORY_PROCESSING_MS)
    })
    expect(result.current.phase).toBe('completionVisible')

    act(() => {
      result.current.dismissCompletion()
    })
    expect(result.current.phase).toBe('settled')
  })

  it('settles an active flow immediately when the surrounding page cannot continue it', () => {
    const { result } = renderHook(() => useMeetingProcessingFlow({ recordId: 'missing-record' }))

    act(() => {
      result.current.settle()
    })

    expect(result.current.phase).toBe('settled')

    act(() => {
      vi.runAllTimers()
    })
    expect(result.current.phase).toBe('settled')
  })

  it('cancels pending phase changes after unmount', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = renderHook(() =>
      useMeetingProcessingFlow({ recordId: 'meeting-record-new' }),
    )

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
