/** 회의 참여자 서버 DTO. Swagger의 MeetingParticipantResponse 기준이다. */

/** 회의에서의 역할. 프로젝트 권한(OWNER/MEMBER)과는 다르다. */
export type MeetingParticipantRole = 'HOST' | 'MEMBER'

export type MeetingParticipantDto = {
  userId: number
  name: string
  profileImageUrl?: string | null
  role: MeetingParticipantRole
  joinedAt: string
}
