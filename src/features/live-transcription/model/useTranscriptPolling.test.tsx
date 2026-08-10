import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  ListTranscriptSegmentsResult,
  TranscriptSegmentDto,
} from '../../../shared/api/contracts/transcript.contracts'
import { useTranscriptPolling } from './useTranscriptPolling'

function createDto(overrides: Partial<TranscriptSegmentDto> = {}): TranscriptSegmentDto {
  return {
    segmentId: 1,
    sequenceIndex: 0,
    startMs: 1000,
    endMs: 2000,
    content: '첫 문장',
    speakerLabel: null,
    isModified: false,
    ...overrides,
  }
}

function createResult(segments: TranscriptSegmentDto[]): ListTranscriptSegmentsResult {
  return { meetingId: 7, segments }
}

/** fake timer 환경에서 대기 중인 조회 promise와 상태 갱신을 흘려보낸다. */
async function advance(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe('useTranscriptPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('활성화되면 즉시 한 번 조회한다', async () => {
    const listSegments = vi.fn().mockResolvedValue(createResult([createDto()]))

    const { result } = renderHook(() =>
      useTranscriptPolling({ enabled: true, meetingId: 7, listSegments }),
    )
    await advance()

    expect(listSegments).toHaveBeenCalledWith(7)
    expect(result.current.segments).toHaveLength(1)
    expect(result.current.segments[0]).toMatchObject({ id: '1', text: '첫 문장' })
  })

  it('주기마다 다시 조회하고 새 세그먼트를 누적한다', async () => {
    const listSegments = vi
      .fn()
      .mockResolvedValueOnce(createResult([createDto()]))
      .mockResolvedValueOnce(
        createResult([
          createDto(),
          createDto({ segmentId: 2, startMs: 4000, content: '둘째 문장' }),
        ]),
      )

    const { result } = renderHook(() =>
      useTranscriptPolling({ enabled: true, meetingId: 7, intervalMs: 3000, listSegments }),
    )
    await advance()
    expect(result.current.segments).toHaveLength(1)

    await advance(3000)

    expect(listSegments).toHaveBeenCalledTimes(2)
    expect(result.current.segments.map((segment) => segment.id)).toEqual(['1', '2'])
  })

  it('비활성화 상태에서는 조회하지 않는다', async () => {
    const listSegments = vi.fn().mockResolvedValue(createResult([createDto()]))

    renderHook(() => useTranscriptPolling({ enabled: false, meetingId: 7, listSegments }))
    await advance(9000)

    expect(listSegments).not.toHaveBeenCalled()
  })

  it('편집 중인 세그먼트는 폴링 결과로 덮어쓰지 않는다', async () => {
    const listSegments = vi
      .fn()
      .mockResolvedValueOnce(createResult([createDto({ content: '원래 문장' })]))
      .mockResolvedValueOnce(createResult([createDto({ content: '서버가 바꾼 문장' })]))

    const { result, rerender } = renderHook(
      ({ editingSegmentId }: { editingSegmentId: string | null }) =>
        useTranscriptPolling({
          enabled: true,
          meetingId: 7,
          intervalMs: 3000,
          editingSegmentId,
          listSegments,
        }),
      { initialProps: { editingSegmentId: null as string | null } },
    )
    await advance()
    expect(result.current.segments[0].text).toBe('원래 문장')

    rerender({ editingSegmentId: '1' })
    await advance(3000)

    expect(listSegments).toHaveBeenCalledTimes(2)
    expect(result.current.segments[0].text).toBe('원래 문장')
  })

  it('조회에 실패해도 기존 전사를 유지하고 오류만 노출한다', async () => {
    const listSegments = vi
      .fn()
      .mockResolvedValueOnce(createResult([createDto()]))
      .mockRejectedValueOnce(new Error('전사 세그먼트를 불러오지 못했습니다.'))

    const { result } = renderHook(() =>
      useTranscriptPolling({ enabled: true, meetingId: 7, intervalMs: 3000, listSegments }),
    )
    await advance()
    expect(result.current.segments).toHaveLength(1)

    await advance(3000)

    expect(result.current.segments).toHaveLength(1)
    expect(result.current.error).toBe('전사 세그먼트를 불러오지 못했습니다.')
  })

  it('회의가 바뀌면 이전 회의의 전사를 비운다', async () => {
    const listSegments = vi
      .fn()
      .mockResolvedValueOnce(createResult([createDto()]))
      .mockResolvedValue(createResult([]))

    const { result, rerender } = renderHook(
      ({ meetingId }: { meetingId: number }) =>
        useTranscriptPolling({ enabled: true, meetingId, listSegments }),
      { initialProps: { meetingId: 7 } },
    )
    await advance()
    expect(result.current.segments).toHaveLength(1)

    rerender({ meetingId: 8 })
    await advance()

    expect(result.current.segments).toHaveLength(0)
    expect(listSegments).toHaveBeenLastCalledWith(8)
  })
})
