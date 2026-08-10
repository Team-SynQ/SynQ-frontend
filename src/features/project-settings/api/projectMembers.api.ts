import { projectApi } from '../../../entities/project'
import type {
  ProjectMemberListResponse,
  ProjectMemberResponse,
} from '../../../shared/api/contracts/project.contracts'

import type { ProjectMember } from '../model/projectSettings.mock'

export type ProjectMemberList = {
  members: ProjectMember[]
  currentCount: number
  maxCount: number
}

/** 서버 role이 프로젝트 권한을 담는 경우입니다. 이때는 화면의 직무 표기로 쓰지 않습니다. */
const MEMBERSHIP_ROLES = new Set(['OWNER', 'MEMBER'])

function toProjectMember(member: ProjectMemberResponse, ownerId: number): ProjectMember {
  const isMembershipRole = MEMBERSHIP_ROLES.has(member.role)

  return {
    id: String(member.memberId),
    name: member.nickname,
    role: isMembershipRole ? '' : member.role,
    isCurrentUser: member.isMe,
    isOwner: member.role === 'OWNER' || member.userId === ownerId,
  }
}

function toProjectMemberList(response: ProjectMemberListResponse): ProjectMemberList {
  return {
    members: response.members.map((member) => toProjectMember(member, response.ownerId)),
    currentCount: response.currentMemberCount,
    maxCount: response.maxMemberCount,
  }
}

export async function loadProjectMembers(projectId: number): Promise<ProjectMemberList> {
  console.log('[projectMember] 멤버 목록 조회 시작', { projectId })

  try {
    const response = await projectApi.getProjectMembers(projectId)
    console.log('[projectMember] 멤버 목록 조회 성공', {
      projectId,
      memberCount: response.currentMemberCount,
      maxMemberCount: response.maxMemberCount,
    })
    return toProjectMemberList(response)
  } catch (error) {
    console.error('[projectMember] 멤버 목록 조회 실패', { projectId, error })
    throw error
  }
}

/**
 * 서버는 유효한 초대 링크가 있으면 기존 링크를 그대로 돌려줍니다. 소유자만 발급할 수 있습니다.
 */
export async function createProjectInviteLink(projectId: number): Promise<string> {
  console.log('[projectMember] 초대 링크 발급 시작', { projectId })

  try {
    const { inviteUrl, expiresAt } = await projectApi.createProjectInvitation(projectId)
    console.log('[projectMember] 초대 링크 발급 성공', { projectId, expiresAt })
    return inviteUrl
  } catch (error) {
    console.error('[projectMember] 초대 링크 발급 실패', { projectId, error })
    throw error
  }
}

export async function removeProjectMember(projectId: number, memberId: number): Promise<void> {
  console.log('[projectMember] 멤버 내보내기 시작', { projectId, memberId })

  try {
    await projectApi.deleteProjectMember(projectId, memberId)
    console.log('[projectMember] 멤버 내보내기 성공', { projectId, memberId })
  } catch (error) {
    console.error('[projectMember] 멤버 내보내기 실패', { projectId, memberId, error })
    throw error
  }
}
