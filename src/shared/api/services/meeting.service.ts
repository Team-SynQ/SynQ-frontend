import { requestApiResult, requestApiVoid } from '../apiRequest'
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

export const meetingService = {
  createMeeting: (
    projectId: number,
    request: MeetingCreateRequest,
  ): Promise<MeetingCreateResponse> =>
    requestApiResult(
      axiosInstance.post<ApiResponse<MeetingCreateResponse>>(
        `/projects/${projectId}/meetings`,
        request,
      ),
      '회의를 시작하지 못했습니다.',
    ),

  joinMeeting: (meetingId: number): Promise<MeetingJoinResponse> =>
    requestApiResult(
      axiosInstance.post<ApiResponse<MeetingJoinResponse>>(`/meetings/${meetingId}/join`),
      '회의에 입장하지 못했습니다.',
    ),

  endMeeting: (meetingId: number): Promise<MeetingEndResponse> =>
    requestApiResult(
      axiosInstance.post<ApiResponse<MeetingEndResponse>>(`/meetings/${meetingId}/end`),
      '회의를 종료하지 못했습니다.',
    ),

  listMeetings: (projectId: number): Promise<MeetingListItemResponse[]> =>
    requestApiResult(
      axiosInstance.get<ApiResponse<MeetingListItemResponse[]>>(`/projects/${projectId}/meetings`),
      '회의 목록을 불러오지 못했습니다.',
    ),

  updateMeetingTitle: (meetingId: number, title: string): Promise<MeetingTitleUpdateResponse> =>
    requestApiResult(
      axiosInstance.patch<ApiResponse<MeetingTitleUpdateResponse>>(`/meetings/${meetingId}/title`, {
        title,
      }),
      '회의 제목을 수정하지 못했습니다.',
    ),

  // 삭제 성공은 204라 본문이 없다. 벗길 봉투가 없다.
  deleteMeeting: (meetingId: number): Promise<void> =>
    requestApiVoid(axiosInstance.delete(`/meetings/${meetingId}`), '회의를 삭제하지 못했습니다.'),
}
