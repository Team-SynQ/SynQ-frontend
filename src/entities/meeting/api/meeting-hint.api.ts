import type { TranscriptHintResponse } from '../../../shared/api/contracts/meeting.contracts'
import { hintService } from '../../../shared/api/services/hint.service'
import { toTranscriptHint, toTranscriptHintRecord } from './hint.adapter'

export type MeetingHintApi = {
  createSegmentHint(meetingId: number, transcriptId: string): Promise<TranscriptHintResponse>
  listHintRecords(meetingId: number): Promise<TranscriptHintResponse[]>
}

export const meetingHintApi: MeetingHintApi = {
  async createSegmentHint(meetingId, transcriptId) {
    const segmentId = Number(transcriptId)
    // 서버에 저장되지 않은 전사(중간 인식 등)는 숫자 id가 아니다. NaN이 URL에 실리기 전에 끊는다.
    if (!Number.isSafeInteger(segmentId) || segmentId <= 0) {
      throw new Error('아직 저장되지 않은 전사입니다.')
    }

    const hint = await hintService.createSegmentHint(meetingId, segmentId)
    return toTranscriptHint(transcriptId, hint)
  },

  async listHintRecords(meetingId) {
    const result = await hintService.listHintRecords(meetingId)
    // 힌트가 없을 때 서버가 배열을 생략할 수 있다.
    return (result.hints ?? []).map(toTranscriptHintRecord)
  },
}
