import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
} from '../../../shared/api/contracts/meeting.contracts'
import { USE_REAL_MEETING_API } from '../../../shared/api/lib/apiClient'
import { meetingLifecycleMockService } from '../../../shared/api/mock/services/meetingLifecycle.mock'
import { meetingService } from '../../../shared/api/services/meeting.service'

export type MeetingLifecycleApi = {
  createMeeting(projectId: number, request: MeetingCreateRequest): Promise<MeetingCreateResponse>
  joinMeeting(meetingId: number): Promise<MeetingJoinResponse>
  endMeeting(meetingId: number): Promise<MeetingEndResponse>
}

/**
 * 프로젝트 API가 아직 mock이라 기본값은 mock이다.
 * `VITE_USE_REAL_MEETING_API=true`이면 실제 백엔드에 붙는다.
 */
export const meetingLifecycleApi: MeetingLifecycleApi = USE_REAL_MEETING_API
  ? meetingService
  : meetingLifecycleMockService
