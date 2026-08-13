export const PROJECT_MEMBER_LIMIT = 10

export type ProjectMember = {
  id: string
  name: string
  role: string
  isCurrentUser?: boolean
  isOwner?: boolean
  avatarType?: 'custom' | 'default'
}

/** 서버 목록 응답에는 요청자의 역할이 없습니다. 이름과 요청 시각만 표시합니다. */
export type ProjectJoinRequest = {
  id: string
  name: string
  requestedAt: string
}
