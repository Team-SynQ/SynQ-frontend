import { requestApiResult, requestApiVoid } from '../apiRequest'
import { axiosInstance } from '../axiosInstance'
import type { ApiResponse } from '../contracts/api.contracts'
import type {
  AiSummaryJobResult,
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingEndResponse,
  MeetingJoinResponse,
  MeetingListItemResponse,
  MeetingTitleUpdateResponse,
  OverallMeetingSummaryResult,
  PersonalMeetingSummaryResult,
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

  deleteMeeting: (meetingId: number): Promise<void> =>
    requestApiVoid(axiosInstance.delete(`/meetings/${meetingId}`), '회의를 삭제하지 못했습니다.'),

  generateAiSummary: (meetingId: number): Promise<AiSummaryJobResult> =>
    requestApiResult(
      axiosInstance.post<ApiResponse<AiSummaryJobResult>>(`/meetings/${meetingId}/ai-summary/generate`),
      'AI 요약 생성을 요청하지 못했습니다.',
    ),

  getAiSummaryStatus: (meetingId: number, jobId: string): Promise<AiSummaryJobResult> =>
    requestApiResult(
      axiosInstance.get<ApiResponse<AiSummaryJobResult>>(`/meetings/${meetingId}/ai-summary/status`, {
        params: { jobId },
      }),
      'AI 요약 작업 상태를 불러오지 못했습니다.',
    ),

  getOverallSummary: (meetingId: number): Promise<OverallMeetingSummaryResult> =>
    requestApiResult(
      axiosInstance.get<ApiResponse<OverallMeetingSummaryResult>>(`/meetings/${meetingId}/summary`),
      '전체 회의 요약을 불러오지 못했습니다.',
    ),

  getPersonalSummary: (meetingId: number): Promise<PersonalMeetingSummaryResult> =>
    requestApiResult(
      axiosInstance.get<ApiResponse<PersonalMeetingSummaryResult>>(`/meetings/${meetingId}/summary/me`),
      '내 개인 요약을 불러오지 못했습니다.',
    ),
}