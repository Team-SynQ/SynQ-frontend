import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { ApiResponse } from '../../../shared/api/contracts/api.contracts'
import type {
  RoleProfileRequest,
  RoleProfileResponse,
} from '../../../shared/api/contracts/user.contracts'

import {
  perspectiveByOptionId,
  projectFocusOptions,
  projectRoleOptions,
  roleByOptionId,
  roleProfileOptionId,
} from '../model/projectPerspective.config'
import type {
  ProjectPerspectiveOption,
  ProjectRolePerspectiveDraft,
} from '../model/projectCreate.types'

export async function createRoleProfileOption(
  draft: ProjectRolePerspectiveDraft,
): Promise<ProjectPerspectiveOption> {
  const role = roleByOptionId[draft.roleId]
  const perspectives = draft.focusIds.map((focusId) => perspectiveByOptionId[focusId])

  if (!role || perspectives.some((perspective) => !perspective)) {
    throw new Error('역할·관점 요청값을 변환할 수 없습니다.')
  }

  console.log('[roleProfileApi] 역할·관점 등록 시작', {
    role,
    hasDetailRole: Boolean(draft.detailRole),
    perspectives,
  })

  const response = await axiosInstance
    .post<ApiResponse<RoleProfileResponse>>('/users/me/role-profiles', {
      role,
      detailRole: draft.detailRole || undefined,
      perspectives,
    } satisfies RoleProfileRequest)
    .catch((error) => {
      console.error('[roleProfileApi] 역할·관점 등록 실패', { error })
      throw error
    })
  const created = response.data.result
  console.log('[roleProfileApi] 역할·관점 등록 성공', {
    profileId: created.id,
    isDefault: created.isDefault,
  })
  const roleLabel =
    projectRoleOptions.find((option) => option.id === draft.roleId)?.label ?? created.role
  const perspectiveLabels = draft.focusIds
    .map((focusId) => projectFocusOptions.find((option) => option.id === focusId)?.label)
    .filter((label): label is string => Boolean(label))
  const description = perspectiveLabels.join(', ') || created.detailRole || '직접 설정'

  return {
    id: roleProfileOptionId(created.id),
    label: roleLabel,
    description,
    selectedDescription: description,
  }
}
