import { projectApi } from '../../../entities/project'
import type {
  ProjectInvitationInfoResponse,
  ProjectJoinRequestResultResponse,
} from '../../../shared/api/contracts/project.contracts'

/**
 * 내가 보낸 참여 요청의 승인·거절 결과를 가져온다.
 * 보조 안내라 실패해도 화면을 막지 않도록, 실패는 빈 목록으로 돌려준다.
 */
export async function loadMyJoinRequestResults(): Promise<ProjectJoinRequestResultResponse[]> {
  try {
    return await projectApi.getMyJoinRequestResults()
  } catch (error) {
    console.error('[projectInvite] 참여 요청 결과 조회 실패', { error })
    return []
  }
}

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
