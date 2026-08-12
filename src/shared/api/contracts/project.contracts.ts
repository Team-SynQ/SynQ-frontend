import type { RoleProfilePerspective, RoleProfileRole } from './user.contracts'

export type CreateProjectRequest = {
  title: string
  description?: string | null
}

export type ProjectResponse = {
  projectId: number
  ownerId: number
  title: string
  description: string | null
  createdAt: string
}

export type ProjectUpdateRequest = {
  title?: string
  description?: string
}

export type ProjectUpdateResponse = {
  projectId: number
  title: string
  description: string | null
  updatedAt: string
}

export type ProjectListItemResponse = {
  projectId: number
  title: string
  description: string | null
  recentMeetingTitle: string | null
  updatedAt: string
}

export type ProjectReferenceType = 'FILE' | 'LINK'
export type ProjectReferenceStatus = 'UPLOADING' | 'AVAILABLE' | 'READ_FAILED'
export type ProjectFileExtension = 'PDF' | 'DOCX' | 'PPTX' | 'TXT'

export type ProjectReferenceResponse = {
  referenceId: number
  type: ProjectReferenceType
  name: string
  url: string | null
  fileSize: number | null
  fileExtension: ProjectFileExtension | null
  status: ProjectReferenceStatus
  uploaderId: number
  uploaderName: string
  canDelete: boolean
  createdAt: string
}

export type ProjectReferenceListResponse = {
  currentCount: number
  maxCount: number
  references: ProjectReferenceResponse[]
}

export type ProjectFileReferenceResponse = {
  referenceId: number
  type: 'FILE'
  name: string
  fileSize: number
  fileExtension: ProjectFileExtension
  status: ProjectReferenceStatus
  uploaderId: number
  uploaderName: string
  createdAt: string
}

export type RegisterProjectFilesResponse = {
  references: ProjectFileReferenceResponse[]
}

export type RegisterProjectLinkRequest = {
  url: string
}

export type ProjectLinkReferenceResponse = {
  referenceId: number
  type: 'LINK'
  name: string
  url: string
  status: ProjectReferenceStatus
  uploaderId: number
  uploaderName: string
  createdAt: string
}

export type ProjectRolePerspectiveResponse = {
  useDefault: boolean
  /** useDefault가 true면 프로젝트 전용 값이 없어 null일 수 있습니다. */
  roleCategory: RoleProfileRole | null
  detailRole: string | null
  perspectives: RoleProfilePerspective[]
}

export type ProjectRolePerspectiveUpdateRequest = {
  useDefault: boolean
  /** useDefault가 false일 때만 필요합니다. roleCategory가 'ETC'면 detailRole이 필수입니다. */
  roleCategory?: RoleProfileRole
  detailRole?: string
  perspectives?: RoleProfilePerspective[]
}

export type ProjectRolePerspectiveUpdateResponse = {
  projectId: number
  useDefault: boolean
  roleCategory: RoleProfileRole | null
  detailRole: string | null
  perspectives: RoleProfilePerspective[]
  updatedAt: string
}

export type ReferenceNameUpdateRequest = {
  name: string
}

export type ReferenceNameUpdateResponse = {
  referenceId: number
  name: string
  type: ProjectReferenceType
  updatedAt: string
}

export type ProjectMemberResponse = {
  memberId: number
  userId: number
  nickname: string
  /** 프로젝트 권한(OWNER/MEMBER)입니다. 화면에 쓰는 직무 역할과 다릅니다. */
  role: string
  isMe: boolean
  joinedAt: string
}

export type ProjectMemberListResponse = {
  projectId: number
  ownerId: number
  title: string
  currentMemberCount: number
  maxMemberCount: number
  members: ProjectMemberResponse[]
}

export type ProjectInvitationResponse = {
  inviteUrl: string
  expiresAt: string
}

export type ProjectInvitationInfoResponse = {
  projectId: number
  title: string
  description: string | null
  currentMemberCount: number
  maxMemberCount: number
  alreadyJoined: boolean
  expiresAt: string
}

export type ProjectJoinRequest = {
  inviteToken: string
}

export type ProjectJoinResponse = {
  projectId: number
  title: string
  description: string | null
  memberRole: string
  joinedAt: string
}
