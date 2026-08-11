import type { HintDto, HintRecordDto } from '../../../shared/api/contracts/hint.contracts'
import type { TranscriptHintResponse } from '../../../shared/api/contracts/meeting.contracts'

/**
 * 서버 DTO를 화면 타입으로 변환한다.
 *
 * - myImpact -> personalImpact: 화면과 spec이 쓰는 이름이다.
 * - segmentId(number) -> transcriptId(string): 전사 어댑터와 같은 규칙으로 맞춘다.
 * - source·importance·triggerReason: 자동 생성 힌트용 메타데이터라 현재 화면에서 쓰지 않는다.
 *   AI 이벤트(SSE) 연동에서 다룬다.
 */
export function toTranscriptHint(transcriptId: string, dto: HintDto): TranscriptHintResponse {
  return {
    transcriptId,
    meaning: dto.meaning,
    personalImpact: dto.myImpact,
    teamQuestion: dto.teamQuestion,
  }
}

export function toTranscriptHintRecord(dto: HintRecordDto): TranscriptHintResponse {
  return toTranscriptHint(String(dto.segmentId), dto)
}
