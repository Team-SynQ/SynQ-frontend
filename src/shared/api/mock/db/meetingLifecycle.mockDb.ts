import type {
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
} from '../../contracts/meeting.contracts'

type MeetingLifecycleRecord = {
  projectId: number
  created: MeetingCreateResponse
  role: string
  joinedAt: string
  endedAt: string | null
}

const records = new Map<number, MeetingLifecycleRecord>()
let nextMeetingId = 5

function cloneRecord(record: MeetingLifecycleRecord): MeetingLifecycleRecord {
  return structuredClone(record)
}

function createSeedRecord(meetingId: number): MeetingLifecycleRecord {
  const startedAt = '2026-08-05T00:00:00.000Z'
  return {
    projectId: 1,
    created: {
      meetingId,
      title: '2차 대면회의',
      status: 'IN_PROGRESS',
      startedAt,
      wsUrl: `wss://mock.synq/meetings/${meetingId}`,
    },
    role: 'HOST',
    joinedAt: startedAt,
    endedAt: null,
  }
}

export function resetMeetingLifecycleMockDb() {
  records.clear()
  nextMeetingId = 5
  ;[1, 2, 3, 4].forEach((meetingId) => {
    records.set(meetingId, createSeedRecord(meetingId))
  })
}

resetMeetingLifecycleMockDb()

export const meetingLifecycleMockDb = {
  createMeeting(projectId: number, startedAt: string): MeetingCreateResponse {
    const meetingId = nextMeetingId++
    const created: MeetingCreateResponse = {
      meetingId,
      title: '새 회의',
      status: 'IN_PROGRESS',
      startedAt,
      wsUrl: `wss://mock.synq/meetings/${meetingId}`,
    }
    records.set(meetingId, {
      projectId,
      created,
      role: 'HOST',
      joinedAt: startedAt,
      endedAt: null,
    })
    return structuredClone(created)
  },

  getRecord(meetingId: number): MeetingLifecycleRecord | undefined {
    const record = records.get(meetingId)
    return record ? cloneRecord(record) : undefined
  },

  joinMeeting(meetingId: number): MeetingJoinResponse | undefined {
    const record = records.get(meetingId)
    if (!record) return undefined
    return {
      meetingId,
      title: record.created.title,
      status: record.created.status,
      role: record.role,
      joinedAt: record.joinedAt,
      startedAt: record.created.startedAt,
      wsUrl: record.created.wsUrl,
    }
  },

  endMeeting(meetingId: number, endedAt: string): MeetingEndResponse | undefined {
    const record = records.get(meetingId)
    if (!record) return undefined
    record.endedAt ??= endedAt
    record.created.status = 'SUMMARIZING'
    return {
      meetingId,
      status: record.created.status,
      endedAt: record.endedAt,
    }
  },
}
