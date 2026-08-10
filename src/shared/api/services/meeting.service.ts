import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
  MeetingListItemResponse,
  MeetingTitleUpdateResponse,
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

  listMeetings: async (projectId: number): Promise<MeetingListItemResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/meetings`, {
      headers: createAuthHeaders(),
    })
    return readApiResult<MeetingListItemResponse[]>(response, '회의 목록을 불러오지 못했습니다.')
  },

  updateMeetingTitle: async (
    meetingId: number,
    title: string,
  ): Promise<MeetingTitleUpdateResponse> => {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/title`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
      body: JSON.stringify({ title }),
    })
    return readApiResult<MeetingTitleUpdateResponse>(response, '회의 제목을 수정하지 못했습니다.')
  },

  deleteMeeting: async (meetingId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    })
    // 삭제 성공은 204라 본문이 없다.
    if (!response.ok) throw new Error('회의를 삭제하지 못했습니다.')
  },
}
