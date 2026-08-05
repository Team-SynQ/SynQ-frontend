import type {
  CompletedMeetingSummary,
  FinalizeMeetingRecordRequest,
} from '../../../shared/api/contracts/meeting.contracts'
import { meetingRecordMockGateway } from '../../../shared/api/mock/services/liveMeeting.mock'

export type MeetingRecordGateway = {
  finalizeEndedMeeting(request: FinalizeMeetingRecordRequest): Promise<CompletedMeetingSummary>
  listCompletedMeetings(projectId: string): Promise<CompletedMeetingSummary[]>
  updateCompletedMeetingTitle(recordId: string, title: string): Promise<CompletedMeetingSummary>
  deleteCompletedMeeting(recordId: string): Promise<void>
}

export const meetingRecordGateway: MeetingRecordGateway = meetingRecordMockGateway
