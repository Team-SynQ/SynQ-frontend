import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
} from '../contracts/meeting.contracts'
import { API_BASE_URL, createAuthHeaders, readApiResult } from '../lib/apiClient'

export const meetingService = {
  createMeeting: async (
    projectId: number,
    request: MeetingCreateRequest,
  ): Promise<MeetingCreateResponse> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/meetings`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(request),
    })
    return readApiResult<MeetingCreateResponse>(response, '회의를 시작하지 못했습니다.')
  },

  joinMeeting: async (meetingId: number): Promise<MeetingJoinResponse> => {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/join`, {
      method: 'POST',
      headers: createAuthHeaders(),
    })
    return readApiResult<MeetingJoinResponse>(response, '회의에 입장하지 못했습니다.')
  },

  endMeeting: async (meetingId: number): Promise<MeetingEndResponse> => {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/end`, {
      method: 'POST',
      headers: createAuthHeaders(),
    })
    return readApiResult<MeetingEndResponse>(response, '회의를 종료하지 못했습니다.')
  },
}
