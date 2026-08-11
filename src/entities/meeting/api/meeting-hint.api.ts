import type { TranscriptHintResponse } from '../../../shared/api/contracts/meeting.contracts'
import { hintService } from '../../../shared/api/services/hint.service'
import { toTranscriptHint, toTranscriptHintRecord } from './hint.adapter'

export type MeetingHintApi = {
  createSegmentHint(meetingId: number, transcriptId: string): Promise<TranscriptHintResponse>
  listHintRecords(meetingId: number): Promise<TranscriptHintResponse[]>
}

export const meetingHintApi: MeetingHintApi = {
  async createSegmentHint(meetingId, transcriptId) {
    const hint = await hintService.createSegmentHint(meetingId, Number(transcriptId))
    return toTranscriptHint(transcriptId, hint)
  },

  async listHintRecords(meetingId) {
    const result = await hintService.listHintRecords(meetingId)
    return result.hints.map(toTranscriptHintRecord)
  },
}
