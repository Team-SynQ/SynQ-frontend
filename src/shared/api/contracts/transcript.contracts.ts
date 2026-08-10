/**
 * 전사 도메인의 서버 DTO. Swagger 스키마를 그대로 옮긴 형태이며 화면 타입으로는 쓰지 않는다.
 * 화면에서 쓰는 TranscriptSegment로의 변환은 entities/meeting의 transcript.adapter가 담당한다.
 */
export type TranscriptSegmentDto = {
  segmentId: number
  sequenceIndex: number
  startMs: number
  endMs: number
  content: string
  /** Soniox diarization 결과 passthrough. 현재 화면에서는 사용하지 않는다. */
  speakerLabel: string | null
  isModified: boolean
}

export type ListTranscriptSegmentsResult = {
  meetingId: number
  segments: TranscriptSegmentDto[]
}

export type UpdateTranscriptSegmentRequest = {
  content: string
}

export type UpdateTranscriptSegmentResult = {
  segmentId: number
  meetingId: number
  content: string
  isModified: boolean
  updatedAt: string
}
