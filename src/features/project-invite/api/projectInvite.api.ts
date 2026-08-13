import { projectApi } from '../../../entities/project'
import type { ProjectInvitationInfoResponse } from '../../../shared/api/contracts/project.contracts'

export async function loadProjectInvitationInfo(
  inviteToken: string,
): Promise<ProjectInvitationInfoResponse> {
  console.log('[projectInvite] 초대 정보 조회 시작')

  try {
    const info = await projectApi.getProjectInvitationInfo(inviteToken)
    console.log('[projectInvite] 초대 정보 조회 성공', {
      projectId: info.projectId,
      alreadyJoined: info.alreadyJoined,
    })
    return info
  } catch (error) {
    console.error('[projectInvite] 초대 정보 조회 실패', { error })
    throw error
  }
}
