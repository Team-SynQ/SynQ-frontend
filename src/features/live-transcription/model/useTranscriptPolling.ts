import { useCallback, useEffect, useRef, useState } from 'react'

import { toTranscriptSegments } from '../../../entities/meeting'
import type { ListTranscriptSegmentsResult } from '../../../shared/api/contracts/transcript.contracts'
import { transcriptService } from '../../../shared/api/services/transcript.service'
import { mergeTranscriptSegments } from './mergeTranscriptSegments'
import type { TranscriptSegment } from './transcript.types'

export const TRANSCRIPT_POLLING_INTERVAL_MS = 3000

type UseTranscriptPollingOptions = {
  /** 진행 중이고 화면이 전사를 따라가야 할 때만 true. 일시정지·종료 중에는 false. */
  enabled: boolean
  meetingId: number
  intervalMs?: number
  /** 편집 중인 세그먼트 id. 폴링 결과가 이 세그먼트를 덮어쓰지 않는다. */
  editingSegmentId?: string | null
  listSegments?: (
    meetingId: number,
    afterSequenceIndex?: number | null,
  ) => Promise<ListTranscriptSegmentsResult>
}

type UseTranscriptPollingResult = {
  segments: TranscriptSegment[]
  error: string | null
  refresh: () => void
}

/** 조회 결과는 회의 id와 함께 보관해, 회의가 바뀌면 이전 전사가 노출되지 않게 한다. */
type PollingState = {
  meetingId: number
  segments: TranscriptSegment[]
  error: string | null
}

const EMPTY_SEGMENTS: TranscriptSegment[] = []

function getErrorMessage(cause: unknown) {
  return cause instanceof Error && cause.message
    ? cause.message
    : '전사 세그먼트를 불러오지 못했습니다.'
}

/**
 * 참여자 화면이 확정된 전사를 따라가기 위한 주기 재조회.
 *
 * 조회 API에 증분 파라미터가 없어 매번 전체 목록을 받는다. 백엔드에 afterSequenceIndex가
 * 추가되면 이 훅의 요청만 바꾸면 되고 병합 로직은 그대로 쓸 수 있다.
 */
export function useTranscriptPolling({
  enabled,
  meetingId,
  intervalMs = TRANSCRIPT_POLLING_INTERVAL_MS,
  editingSegmentId = null,
  listSegments = transcriptService.listSegments,
}: UseTranscriptPollingOptions): UseTranscriptPollingResult {
  const [state, setState] = useState<PollingState>(() => ({
    meetingId,
    segments: EMPTY_SEGMENTS,
    error: null,
  }))
  const editingSegmentIdRef = useRef(editingSegmentId)
  const listSegmentsRef = useRef(listSegments)
  const requestSequenceRef = useRef(0)

  useEffect(() => {
    editingSegmentIdRef.current = editingSegmentId
  }, [editingSegmentId])

  useEffect(() => {
    listSegmentsRef.current = listSegments
  }, [listSegments])

  const fetchSegments = useCallback(() => {
    const requestSequence = ++requestSequenceRef.current
    const requestMeetingId = meetingId

    void listSegmentsRef
      .current(requestMeetingId)
      .then((result) => {
        if (requestSequence !== requestSequenceRef.current) return
        setState((current) => ({
          meetingId: requestMeetingId,
          segments: mergeTranscriptSegments({
            current: current.meetingId === requestMeetingId ? current.segments : EMPTY_SEGMENTS,
            incoming: toTranscriptSegments(result.segments),
            protectedSegmentId: editingSegmentIdRef.current,
          }),
          error: null,
        }))
      })
      .catch((cause: unknown) => {
        if (requestSequence !== requestSequenceRef.current) return
        // 기존 전사는 유지하고 다음 주기에 다시 시도한다.
        setState((current) =>
          current.meetingId === requestMeetingId
            ? { ...current, error: getErrorMessage(cause) }
            : {
                meetingId: requestMeetingId,
                segments: EMPTY_SEGMENTS,
                error: getErrorMessage(cause),
              },
        )
      })
  }, [meetingId])

  useEffect(() => {
    if (!enabled) return

    const isHidden = () => document.visibilityState === 'hidden'

    if (!isHidden()) fetchSegments()

    const timerId = window.setInterval(() => {
      if (isHidden()) return
      fetchSegments()
    }, intervalMs)

    const handleVisibilityChange = () => {
      if (!isHidden()) fetchSegments()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(timerId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, fetchSegments, intervalMs])

  const isCurrentMeeting = state.meetingId === meetingId

  return {
    segments: isCurrentMeeting ? state.segments : EMPTY_SEGMENTS,
    error: isCurrentMeeting ? state.error : null,
    refresh: fetchSegments,
  }
}
