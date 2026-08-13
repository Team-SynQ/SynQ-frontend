import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
  MeetingPauseStateResponse,
} from '../../../shared/api/contracts/meeting.contracts'
import { meetingService } from '../../../shared/api/services/meeting.service'

export type MeetingLifecycleApi = {
  createMeeting(projectId: number, request: MeetingCreateRequest): Promise<MeetingCreateResponse>
  joinMeeting(meetingId: number): Promise<MeetingJoinResponse>
  pauseMeeting(meetingId: number): Promise<MeetingPauseStateResponse>
  resumeMeeting(meetingId: number): Promise<MeetingPauseStateResponse>
  endMeeting(meetingId: number): Promise<MeetingEndResponse>
}

export const meetingLifecycleApi: MeetingLifecycleApi = meetingService
