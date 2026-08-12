import { requestApiResult } from '../apiRequest'
import { axiosInstance } from '../axiosInstance'
import type { ApiResponse } from '../contracts/api.contracts'
import type { MeetingParticipantDto } from '../contracts/participant.contracts'

export const participantService = {
  /** 나가지 않고 회의에 남아 있는 참여자만 돌려준다. */
  listParticipants: (meetingId: number): Promise<MeetingParticipantDto[]> =>
    requestApiResult(
      axiosInstance.get<ApiResponse<MeetingParticipantDto[]>>(
        `/meetings/${meetingId}/participants`,
      ),
      '참여자 목록을 불러오지 못했습니다.',
    ),
}
