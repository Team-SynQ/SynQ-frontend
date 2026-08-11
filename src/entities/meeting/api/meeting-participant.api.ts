import type { MeetingParticipantResponse } from '../../../shared/api/contracts/meeting.contracts'
import type { MeetingParticipantDto } from '../../../shared/api/contracts/participant.contracts'
import { participantService } from '../../../shared/api/services/participant.service'

/**
 * 서버 DTO를 화면 타입으로 옮긴다.
 *
 * 화면의 진행자 표시는 서버 role에서 나온다. 프로젝트 권한이 아니라 회의 역할이다.
 * 본인 여부는 서버가 알려주지 않으므로 내 userId와 비교해 정한다.
 */
export function toMeetingParticipant(
  dto: MeetingParticipantDto,
  currentUserId: number | null,
): MeetingParticipantResponse {
  return {
    id: String(dto.userId),
    name: dto.name,
    profileImageUrl: dto.profileImageUrl ?? null,
    isCurrentUser: currentUserId !== null && dto.userId === currentUserId,
    isHost: dto.role === 'HOST',
  }
}

export type MeetingParticipantApi = {
  listParticipants(
    meetingId: number,
    currentUserId: number | null,
  ): Promise<MeetingParticipantResponse[]>
}

export const meetingParticipantApi: MeetingParticipantApi = {
  async listParticipants(meetingId, currentUserId) {
    const participants = await participantService.listParticipants(meetingId)
    return participants.map((participant) => toMeetingParticipant(participant, currentUserId))
  },
}
