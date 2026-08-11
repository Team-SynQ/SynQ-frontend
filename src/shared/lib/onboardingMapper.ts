import type { RoleProfilePerspective, RoleProfileRole } from '../api/contracts/user.contracts'

/**
 * 온보딩 화면의 선택 id를 서버 enum으로 옮긴다.
 *
 * 값 타입을 계약 타입으로 묶어 둔다. `Record<string, string>`이던 시절에는
 * 오타가 타입 검사를 통과해 운영에서 400으로만 드러났다.
 */
export const ROLE_ENUM_MAP: Record<string, RoleProfileRole> = {
  pm: 'PLANNING_OPERATION',
  design: 'DESIGN_CONTENT',
  dev: 'DEV_TECH',
  marketing: 'MARKETING_BRANDING',
  sales: 'SALES_CUSTOMER',
  data: 'DATA_RESEARCH',
  exec: 'STRATEGY_MANAGEMENT',
  etc: 'ETC',
}

export const PERSPECTIVE_ENUM_MAP: Record<string, RoleProfilePerspective> = {
  schedule: 'SCHEDULE',
  scope: 'SCOPE',
  decision: 'DECISION',
  ux: 'UX',
  tech_risk: 'TECH_RISK',
  cost_performance: 'COST_PERFORMANCE',
  customer_feedback: 'CUSTOMER_REACTION',
  ops_issue: 'OPERATION_ISSUE',
  action_item: 'ACTION_ITEM',
  team_qna: 'TEAM_QUESTION',
}

/**
 * 매핑에 없는 id는 서버가 400으로 거절한다. 그대로 흘려보내지 않고 여기서 끊는다.
 * 폴백으로 화면 id를 보내면 실패 원인이 요청 본문에 묻힌다.
 */
export function toRoleEnum(roleId: string): RoleProfileRole {
  const role = ROLE_ENUM_MAP[roleId]
  if (!role) throw new Error(`지원하지 않는 역할입니다: ${roleId}`)
  return role
}

export function toPerspectiveEnums(perspectiveIds: string[]): RoleProfilePerspective[] {
  return perspectiveIds.map((perspectiveId) => {
    const perspective = PERSPECTIVE_ENUM_MAP[perspectiveId]
    if (!perspective) throw new Error(`지원하지 않는 관점입니다: ${perspectiveId}`)
    return perspective
  })
}
