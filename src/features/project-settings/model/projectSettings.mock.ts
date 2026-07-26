export const PROJECT_MEMBER_LIMIT = 10
export const PROJECT_INVITE_LINK = 'https://synq.kr/invite/project-demo'

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

export const PROJECT_MEMBER_EXPORT_MOCK_FAILURE_ID = 'member-ashe-1'

export const projectPopoverMembers: ProjectMember[] = [
  {
    id: 'member-current',
    name: '윤금서',
    role: 'Design',
    isCurrentUser: true,
    isOwner: true,
    avatarType: 'custom',
  },
  { id: 'member-cassidy-1', name: '캐서디', role: '딜러' },
  { id: 'member-ashe-1', name: '애쉬', role: '딜러' },
  { id: 'member-cassidy-2', name: '캐서디', role: '딜러' },
  { id: 'member-road-hog', name: '도로롱', role: '', avatarType: 'custom' },
  { id: 'member-cassidy-3', name: '캐서디', role: '딜러' },
  { id: 'member-ashe-2', name: '애쉬', role: '딜러' },
  { id: 'member-cassidy-4', name: '캐서디', role: '딜러' },
  { id: 'member-ashe-3', name: '애쉬', role: '딜러' },
  { id: 'member-ashe-4', name: '애쉬', role: '딜러' },
]

export const projectManagementMembers: ProjectMember[] = [
  projectPopoverMembers[0],
  projectPopoverMembers[1],
  projectPopoverMembers[2],
  projectPopoverMembers[3],
  projectPopoverMembers[5],
  projectPopoverMembers[6],
  projectPopoverMembers[7],
  projectPopoverMembers[8],
  projectPopoverMembers[9],
]

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
