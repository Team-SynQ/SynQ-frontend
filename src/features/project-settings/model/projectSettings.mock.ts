export const PROJECT_MEMBER_LIMIT = 10

export type ProjectMember = {
  id: string
  name: string
  role: string
  isCurrentUser?: boolean
  isOwner?: boolean
  avatarType?: 'custom' | 'default'
}

export type ProjectJoinRequest = {
  id: string
  name: string
  role: string
  requestedAt: string
}

export const PROJECT_JOIN_REQUEST_MOCK_FAILURE_IDS = {
  approve: 'join-request-sombra-approve-failure',
  reject: 'join-request-sombra-reject-failure',
} as const

export const projectJoinRequests: ProjectJoinRequest[] = [
  {
    id: PROJECT_JOIN_REQUEST_MOCK_FAILURE_IDS.approve,
    name: '솜브라',
    role: '딜러',
    requestedAt: '26.07.20 12:24',
  },
  {
    id: 'join-request-winston',
    name: '윈스턴',
    role: '탱커',
    requestedAt: '26.07.20 18:24',
  },
  {
    id: 'join-request-sombra-capacity',
    name: '솜브라',
    role: '딜러',
    requestedAt: '26.07.20 12:24',
  },
  {
    id: PROJECT_JOIN_REQUEST_MOCK_FAILURE_IDS.reject,
    name: '솜브라',
    role: '딜러',
    requestedAt: '26.07.20 12:24',
  },
]
