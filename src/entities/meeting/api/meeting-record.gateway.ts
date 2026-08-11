import type {
  CompletedMeetingSummary,
  FinalizeMeetingRecordRequest,
  MeetingListItemResponse,
} from '../../../shared/api/contracts/meeting.contracts'
import { meetingService } from '../../../shared/api/services/meeting.service'

export type MeetingRecordGateway = {
  finalizeEndedMeeting(request: FinalizeMeetingRecordRequest): Promise<CompletedMeetingSummary>
  listCompletedMeetings(projectId: string): Promise<CompletedMeetingSummary[]>
  updateCompletedMeetingTitle(recordId: string, title: string): Promise<CompletedMeetingSummary>
  deleteCompletedMeeting(recordId: string): Promise<void>
}

/** 회의 목록 응답을 화면의 회의 기록 모델로 바꾼다. 목록 API가 주지 않는 필드는 비워 둔다. */
function toCompletedMeetingSummary(
  projectId: string,
  meeting: MeetingListItemResponse,
): CompletedMeetingSummary {
  return {
    recordId: String(meeting.meetingId),
    meetingId: String(meeting.meetingId),
    projectId,
    projectTitle: '',
    meetingTitle: meeting.title,
    durationSeconds: meeting.durationSeconds ?? 0,
    completedAt: meeting.createdAt,
    host: {
      id: String(meeting.host?.userId ?? ''),
      name: meeting.host?.name ?? '',
      avatarKey: 'pm',
    },
    overview: '',
    keywords: meeting.keyTopics ?? [],
    decisions: [],
  }
}

/** 제목 수정 응답에는 목록 필드가 없어서, 마지막 목록 조회 결과에 제목만 덮어써 돌려준다. */
const summariesByRecordId = new Map<string, CompletedMeetingSummary>()

export const meetingRecordGateway: MeetingRecordGateway = {
  // 종료 요청에 이미 기록에 필요한 정보가 다 있어서 서버 재조회 없이 기록 모델을 만든다.
  async finalizeEndedMeeting(request) {
    return {
      recordId: request.meetingId,
      meetingId: request.meetingId,
      projectId: request.projectId,
      projectTitle: request.projectTitle,
      meetingTitle: request.meetingTitle,
      durationSeconds: request.activeDurationSeconds,
      completedAt: request.endedAt,
      host: request.host,
      overview: '',
      keywords: [],
      decisions: [],
    }
  },

  async listCompletedMeetings(projectId) {
    const meetings = await meetingService.listMeetings(Number(projectId))
    const records = meetings
      .filter((meeting) => meeting.status !== 'IN_PROGRESS')
      .map((meeting) => toCompletedMeetingSummary(projectId, meeting))

    records.forEach((record) => summariesByRecordId.set(record.recordId, record))
    return records
  },

  async updateCompletedMeetingTitle(recordId, title) {
    const updated = await meetingService.updateMeetingTitle(Number(recordId), title)
    const cached = summariesByRecordId.get(recordId)
    const next: CompletedMeetingSummary = cached
      ? { ...cached, meetingTitle: updated.title }
      : {
          recordId,
          meetingId: recordId,
          projectId: '',
          projectTitle: '',
          meetingTitle: updated.title,
          durationSeconds: 0,
          completedAt: '',
          host: { id: '', name: '', avatarKey: 'pm' },
          overview: '',
          keywords: [],
          decisions: [],
        }

    summariesByRecordId.set(recordId, next)
    return next
  },

  async deleteCompletedMeeting(recordId) {
    await meetingService.deleteMeeting(Number(recordId))
    summariesByRecordId.delete(recordId)
  },
}
