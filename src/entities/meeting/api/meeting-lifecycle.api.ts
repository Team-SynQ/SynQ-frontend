import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
} from '../../../shared/api/contracts/meeting.contracts'
import { meetingLifecycleMockService } from '../../../shared/api/mock/services/meetingLifecycle.mock'

export type MeetingLifecycleApi = {
  createMeeting(projectId: number, request: MeetingCreateRequest): Promise<MeetingCreateResponse>
  joinMeeting(meetingId: number): Promise<MeetingJoinResponse>
  endMeeting(meetingId: number): Promise<MeetingEndResponse>
}

export const meetingLifecycleApi: MeetingLifecycleApi = meetingLifecycleMockService
