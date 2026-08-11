import type {
  CompletedMeetingSummary,
  LiveMeetingResponse,
  MeetingAiChatMessageResponse,
  TranscriptHintResponse,
} from '../../contracts/meeting.contracts'
import {
  createLiveMeetingScenarios,
  type LiveMeetingScenario,
} from '../scenarios/liveMeeting.scenario'

type LiveMeetingRecord = LiveMeetingScenario & {
  hintAttempts: Record<string, number>
}

const records = new Map<string, LiveMeetingRecord>()
const completedMeetingRecords = new Map<string, CompletedMeetingSummary[]>()
const deletedCompletedMeetingRecordIds = new Set<string>()
let completedMeetingSequence = 0

function cloneMeeting(meeting: LiveMeetingResponse): LiveMeetingResponse {
  return structuredClone(meeting)
}

function requireRecord(meetingId: string): LiveMeetingRecord | undefined {
  return records.get(meetingId)
}

function findCompletedMeetingLocation(recordId: string) {
  for (const [projectId, projectRecords] of completedMeetingRecords) {
    const index = projectRecords.findIndex((record) => record.recordId === recordId)
    if (index >= 0) {
      return { index, projectId, projectRecords }
    }
  }
  return undefined
}

export function resetLiveMeetingMockDb() {
  records.clear()
  completedMeetingRecords.clear()
  deletedCompletedMeetingRecordIds.clear()
  completedMeetingSequence = 0

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

  registerMeeting(meetingId: string, projectId: string): LiveMeetingResponse {
    const existing = requireRecord(meetingId)
    if (existing) return cloneMeeting(existing.meeting)

    const template = createLiveMeetingScenarios()['1']
    if (!template) throw new Error('Default live meeting scenario is missing.')
    const record: LiveMeetingRecord = {
      ...structuredClone(template),
      meeting: {
        ...cloneMeeting(template.meeting),
        meetingId,
        projectId,
      },
      hintAttempts: {},
    }
    records.set(meetingId, record)
    return cloneMeeting(record.meeting)
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
      completionFails: record.completionFails,
    }
  },

  getHint(meetingId: string, transcriptId: string): TranscriptHintResponse | undefined {
    const hint = requireRecord(meetingId)?.hints[transcriptId]
    return hint ? { ...hint } : undefined
  },

  /**
   * 실제 회의의 전사 id는 mock 힌트 목록에 없다. 화면을 비우지 않도록 대표 힌트를 돌려준다.
   * 실제 힌트 API가 붙으면 이 경로는 사라진다.
   */
  getFallbackHint(meetingId: string): TranscriptHintResponse | undefined {
    const hint = Object.values(requireRecord(meetingId)?.hints ?? {})[0]
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

  addCompletedMeeting(record: Omit<CompletedMeetingSummary, 'recordId'>): CompletedMeetingSummary {
    const completedMeeting = {
      ...structuredClone(record),
      recordId: `meeting-record-${++completedMeetingSequence}`,
    }
    const projectRecords = completedMeetingRecords.get(record.projectId) ?? []
    projectRecords.unshift(completedMeeting)
    completedMeetingRecords.set(record.projectId, projectRecords)
    return structuredClone(completedMeeting)
  },

  listCompletedMeetings(projectId: string): CompletedMeetingSummary[] {
    return structuredClone(completedMeetingRecords.get(projectId) ?? []).sort(
      (left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime(),
    )
  },

  getCompletedMeeting(recordId: string): CompletedMeetingSummary | undefined {
    const location = findCompletedMeetingLocation(recordId)
    return location ? structuredClone(location.projectRecords[location.index]) : undefined
  },

  getCompletedMeetingByMeetingId(meetingId: string): CompletedMeetingSummary | undefined {
    for (const projectRecords of completedMeetingRecords.values()) {
      const record = projectRecords.find((candidate) => candidate.meetingId === meetingId)
      if (record) return structuredClone(record)
    }
    return undefined
  },

  updateCompletedMeetingTitle(
    recordId: string,
    title: string,
  ): CompletedMeetingSummary | undefined {
    const location = findCompletedMeetingLocation(recordId)
    if (!location) return undefined

    const current = location.projectRecords[location.index]
    if (!current) return undefined

    const updated = { ...current, meetingTitle: title }
    location.projectRecords[location.index] = updated
    return structuredClone(updated)
  },

  deleteCompletedMeeting(recordId: string): CompletedMeetingSummary | undefined {
    const location = findCompletedMeetingLocation(recordId)
    if (!location) return undefined

    const [deleted] = location.projectRecords.splice(location.index, 1)
    if (!deleted) return undefined

    if (location.projectRecords.length === 0) {
      completedMeetingRecords.delete(location.projectId)
    }
    deletedCompletedMeetingRecordIds.add(recordId)
    return structuredClone(deleted)
  },

  isCompletedMeetingDeleted(recordId: string): boolean {
    return deletedCompletedMeetingRecordIds.has(recordId)
  },
}
