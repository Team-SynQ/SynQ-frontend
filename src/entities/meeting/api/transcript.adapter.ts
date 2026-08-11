import type { TranscriptSegmentResponse } from '../../../shared/api/contracts/meeting.contracts'
import type { TranscriptSegmentDto } from '../../../shared/api/contracts/transcript.contracts'

/**
 * 서버 DTO를 화면 타입으로 변환한다.
 *
 * - segmentId(number) -> id(string): 화면과 기존 테스트가 문자열 id를 전제한다.
 * - startMs -> startedAtSeconds: 화면은 회의 시작 기준 경과 시간을 표시하므로 초 단위면 충분하다.
 * - speakerLabel: 화자 분리를 하지 않기로 해서 화면에서 사용하지 않는다.
 * - editedAt: 목록 조회 응답에 수정 시각이 없어 null로 둔다. 수정 응답의 updatedAt만 시각을 준다.
 */
export function toTranscriptSegment(dto: TranscriptSegmentDto): TranscriptSegmentResponse {
  return {
    id: String(dto.segmentId),
    sequenceIndex: dto.sequenceIndex,
    startedAtSeconds: dto.startMs / 1000,
    text: dto.content,
    isEdited: dto.isModified,
    editedAt: null,
  }
}

/**
 * 설계상 정렬 기준은 start_ms ASC, seq ASC다. 서버도 같은 순서로 내려주지만,
 * 폴링 결과와 실시간 수신분이 섞일 수 있어 클라이언트에서도 순서를 확정한다.
 */
export function toTranscriptSegments(dtos: TranscriptSegmentDto[]): TranscriptSegmentResponse[] {
  return [...dtos]
    .sort((a, b) => a.startMs - b.startMs || a.sequenceIndex - b.sequenceIndex)
    .map(toTranscriptSegment)
}
