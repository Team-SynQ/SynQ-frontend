import { projectApi } from '../../../entities/project'
import {
  toAccountPerspective,
  toRoleProfileRequest,
  type AccountPerspective,
  type AccountPerspectiveDraft,
} from '../../account-settings'

/**
 * 프로젝트별 역할·관점을 계정 설정 화면과 같은 항목 모양으로 돌려준다.
 *
 * 서버가 `useDefault: true`로 답하면 이 프로젝트 전용 값이 없다는 뜻이고 역할도 null이다.
 * 그때는 폼을 비운 채 열어 사용자가 직접 고르게 한다.
 */
export async function loadProjectRolePerspective(
  projectId: number,
): Promise<AccountPerspective | null> {
  console.log('[projectRolePerspective] 역할·관점 조회 시작', { projectId })

  try {
    const response = await projectApi.getProjectRolePerspective(projectId)
    console.log('[projectRolePerspective] 역할·관점 조회 성공', {
      projectId,
      useDefault: response.useDefault,
    })
    if (!response.roleCategory) return null

    return toAccountPerspective({
      id: projectId,
      isDefault: false,
      role: response.roleCategory,
      detailRole: response.detailRole ?? undefined,
      perspectives: response.perspectives,
    })
  } catch (error) {
    console.error('[projectRolePerspective] 역할·관점 조회 실패', { projectId, error })
    throw error
  }
}

export async function saveProjectRolePerspective(
  projectId: number,
  draft: AccountPerspectiveDraft,
): Promise<void> {
  console.log('[projectRolePerspective] 역할·관점 저장 시작', { projectId })

  try {
    const { role, detailRole, perspectives } = toRoleProfileRequest(draft)
    await projectApi.updateProjectRolePerspective(projectId, {
      useDefault: false,
      roleCategory: role,
      detailRole,
      perspectives,
    })
    console.log('[projectRolePerspective] 역할·관점 저장 성공', { projectId })
  } catch (error) {
    console.error('[projectRolePerspective] 역할·관점 저장 실패', { projectId, error })
    throw error
  }
}
