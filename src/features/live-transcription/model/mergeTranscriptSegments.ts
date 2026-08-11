import type { TranscriptSegment } from './transcript.types'

type MergeTranscriptSegmentsInput = {
  current: TranscriptSegment[]
  incoming: TranscriptSegment[]
  /** 사용자가 편집 중인 세그먼트. 서버 값으로 덮어쓰지 않는다. */
  protectedSegmentId?: string | null
}

/**
 * 폴링 결과를 현재 목록에 병합한다.
 *
 * 서버가 전체 목록을 내려주므로 기본은 교체지만, 두 가지를 지킨다.
 * - 편집 중인 세그먼트는 사용자가 보고 있는 값을 유지한다.
 * - 서버에 아직 없는 세그먼트(실시간 수신분)는 지우지 않고 남긴다.
 */
export function mergeTranscriptSegments({
  current,
  incoming,
  protectedSegmentId = null,
}: MergeTranscriptSegmentsInput): TranscriptSegment[] {
  const merged = new Map<string, TranscriptSegment>()

  current.forEach((segment) => merged.set(segment.id, segment))
  incoming.forEach((segment) => {
    if (segment.id === protectedSegmentId && merged.has(segment.id)) return
    merged.set(segment.id, segment)
  })

  return [...merged.values()].sort(
    (a, b) => a.startedAtSeconds - b.startedAtSeconds || a.sequenceIndex - b.sequenceIndex,
  )
}
