import type {
  LiveMeetingResponse,
  MeetingAiChatMessageResponse,
  TranscriptHintResponse,
  TranscriptSegmentResponse,
} from '../../contracts/meeting.contracts'
import {
  createLiveMeetingScenarios,
  type LiveMeetingScenario,
} from '../scenarios/liveMeeting.scenario'

type LiveMeetingRecord = LiveMeetingScenario & {
  hintAttempts: Record<string, number>
}

const records = new Map<string, LiveMeetingRecord>()

function cloneMeeting(meeting: LiveMeetingResponse): LiveMeetingResponse {
  return structuredClone(meeting)
}

function cloneSegment(segment: TranscriptSegmentResponse): TranscriptSegmentResponse {
  return { ...segment }
}

function requireRecord(meetingId: string): LiveMeetingRecord | undefined {
  return records.get(meetingId)
}

export function resetLiveMeetingMockDb() {
  records.clear()

  Object.entries(createLiveMeetingScenarios()).forEach(([meetingId, scenario]) => {
    records.set(meetingId, {
      ...structuredClone(scenario),
      hintAttempts: {},
    })
  })
}

resetLiveMeetingMockDb()

export const liveMeetingMockDb = {
  getMeeting(meetingId: string): LiveMeetingResponse | undefined {
    const record = requireRecord(meetingId)
    return record ? cloneMeeting(record.meeting) : undefined
  },

  getScenario(meetingId: string): LiveMeetingScenario | undefined {
    const record = requireRecord(meetingId)
    if (!record) return undefined

    return {
      meeting: cloneMeeting(record.meeting),
      hints: structuredClone(record.hints),
      aiAnswer: record.aiAnswer,
      hintFailureCount: record.hintFailureCount,
      transcriptEditFails: record.transcriptEditFails,
    }
  },

  listTranscripts(meetingId: string): TranscriptSegmentResponse[] | undefined {
    return requireRecord(meetingId)
      ?.meeting.transcript.segments.map(cloneSegment)
      .sort(
        (left, right) =>
          left.startedAtSeconds - right.startedAtSeconds ||
          left.sequenceIndex - right.sequenceIndex,
      )
  },

  updateTranscript(
    meetingId: string,
    segmentId: string,
    text: string,
    editedAt: string,
  ): TranscriptSegmentResponse | undefined {
    const segment = requireRecord(meetingId)?.meeting.transcript.segments.find(
      (candidate) => candidate.id === segmentId,
    )
    if (!segment) return undefined

    segment.text = text
    segment.isEdited = true
    segment.editedAt = editedAt
    return cloneSegment(segment)
  },

  getHint(meetingId: string, transcriptId: string): TranscriptHintResponse | undefined {
    const hint = requireRecord(meetingId)?.hints[transcriptId]
    return hint ? { ...hint } : undefined
  },

  incrementHintAttempt(meetingId: string, transcriptId: string): number {
    const record = requireRecord(meetingId)
    if (!record) return 0

    const nextAttempt = (record.hintAttempts[transcriptId] ?? 0) + 1
    record.hintAttempts[transcriptId] = nextAttempt
    return nextAttempt
  },

  appendMessages(meetingId: string, messages: MeetingAiChatMessageResponse[]): boolean {
    const record = requireRecord(meetingId)
    if (!record) return false

    record.meeting.aiChat.messages.push(...structuredClone(messages))
    return true
  },
}
