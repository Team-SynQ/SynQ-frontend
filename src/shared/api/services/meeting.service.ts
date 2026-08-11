import { axiosInstance } from '../axiosInstance'
import type { ApiResponse } from '../contracts/api.contracts'
import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
  MeetingListItemResponse,
  MeetingTitleUpdateResponse,
} from '../contracts/meeting.contracts'
import { unwrapApiResult } from '../unwrapApiResult'

export const meetingService = {
  createMeeting: async (
    projectId: number,
    request: MeetingCreateRequest,
  ): Promise<MeetingCreateResponse> => {
    const response = await axiosInstance.post<ApiResponse<MeetingCreateResponse>>(
      `/projects/${projectId}/meetings`,
      request,
    )
    return unwrapApiResult(response, '회의를 시작하지 못했습니다.')
  },

  joinMeeting: async (meetingId: number): Promise<MeetingJoinResponse> => {
    const response = await axiosInstance.post<ApiResponse<MeetingJoinResponse>>(
      `/meetings/${meetingId}/join`,
    )
    return unwrapApiResult(response, '회의에 입장하지 못했습니다.')
  },

  endMeeting: async (meetingId: number): Promise<MeetingEndResponse> => {
    const response = await axiosInstance.post<ApiResponse<MeetingEndResponse>>(
      `/meetings/${meetingId}/end`,
    )
    return unwrapApiResult(response, '회의를 종료하지 못했습니다.')
  },

  listMeetings: async (projectId: number): Promise<MeetingListItemResponse[]> => {
    const response = await axiosInstance.get<ApiResponse<MeetingListItemResponse[]>>(
      `/projects/${projectId}/meetings`,
    )
    return unwrapApiResult(response, '회의 목록을 불러오지 못했습니다.')
  },

  updateMeetingTitle: async (
    meetingId: number,
    title: string,
  ): Promise<MeetingTitleUpdateResponse> => {
    const response = await axiosInstance.patch<ApiResponse<MeetingTitleUpdateResponse>>(
      `/meetings/${meetingId}/title`,
      { title },
    )
    return unwrapApiResult(response, '회의 제목을 수정하지 못했습니다.')
  },

  deleteMeeting: async (meetingId: number): Promise<void> => {
    // 삭제 성공은 204라 본문이 없다. 봉투를 벗길 것도 없다.
    await axiosInstance.delete(`/meetings/${meetingId}`)
  },
}
