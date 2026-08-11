import type {
  CompletedMeetingSummary,
  LiveMeetingResponse,
  MeetingAiChatMessageResponse,
} from '../../contracts/meeting.contracts'
import {
  createLiveMeetingScenarios,
  type LiveMeetingScenario,
} from '../scenarios/liveMeeting.scenario'

type LiveMeetingRecord = LiveMeetingScenario

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
    records.set(meetingId, structuredClone(scenario))
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
    }
    records.set(meetingId, record)
    return cloneMeeting(record.meeting)
  },

  getScenario(meetingId: string): LiveMeetingScenario | undefined {
    const record = requireRecord(meetingId)
    if (!record) return undefined

    return {
      meeting: cloneMeeting(record.meeting),
      aiAnswer: record.aiAnswer,
      transcriptEditFails: record.transcriptEditFails,
      completionFails: record.completionFails,
    }
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
