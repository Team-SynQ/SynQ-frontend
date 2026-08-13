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

export type ProjectRolePerspectiveUpdateRequest =
  /** 계정 기본 프로필을 그대로 따릅니다. */
  | { useDefault: true }
  /** 프로젝트 전용 값을 지정합니다. roleCategory가 'ETC'면 detailRole이 필요합니다(서버 검증). */
  | {
      useDefault: false
      roleCategory: RoleProfileRole
      detailRole?: string
      perspectives: RoleProfilePerspective[]
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

/** 요청에 실은 역할·관점이 어디서 온 값인지 알립니다. 저장되는 값은 함께 보낸 값 그대로입니다. */
export type ProjectJoinSettingSource = 'DEFAULT' | 'ONBOARDING' | 'PROJECT_CUSTOM'

export type ProjectJoinRequestCreateRequest = {
  inviteToken: string
  settingSource: ProjectJoinSettingSource
  roleCategory: RoleProfileRole
  /** roleCategory가 'ETC'일 때만 서버가 요구합니다. */
  detailRole?: string
  /** 최대 3개입니다. */
  perspectives: RoleProfilePerspective[]
}

export type ProjectJoinRequestCreateResponse = {
  requestId: number
  projectId: number
  status: string
  requestedAt: string
}

export type ProjectJoinRequestItemResponse = {
  requestId: number
  userId: number
  name: string
  requestedAt: string
}

export type ProjectJoinRequestListResponse = {
  pendingCount: number
  requests: ProjectJoinRequestItemResponse[]
}

export type ProjectJoinRequestApproveResponse = {
  requestId: number
  memberId: number
  userId: number
  status: string
  joinedAt: string
}

export type ProjectJoinRequestRejectResponse = {
  requestId: number
  status: string
}

export type ProjectJoinResponse = {
  projectId: number
  title: string
  description: string | null
  memberRole: string
  joinedAt: string
}
