import type { RoleProfile } from '../../../entities/user'
import type {
  RoleProfilePerspective,
  RoleProfileRequest,
  RoleProfileRole,
} from '../../../shared/api/contracts/user.contracts'

import {
  accountRoleOptions,
  type AccountFocusTag,
  type AccountRoleLabel,
} from './accountPerspectiveOptions'
import type { AccountPerspective, AccountPerspectiveDraft } from './accountSettings.types'

/** 화면 라벨 ↔ 서버 enum 대응표입니다. */
const roleByAccountLabel: Record<AccountRoleLabel, RoleProfileRole> = {
  '기획/운영': 'PLANNING_OPERATION',
  '디자인/콘텐츠': 'DESIGN_CONTENT',
  '개발/기술': 'DEV_TECH',
  '마케팅/브랜딩': 'MARKETING_BRANDING',
  '영업/고객': 'SALES_CUSTOMER',
  '데이터/리서치': 'DATA_RESEARCH',
  '경영/전략': 'STRATEGY_MANAGEMENT',
  기타: 'ETC',
}

const perspectiveByFocusTag: Record<AccountFocusTag, RoleProfilePerspective> = {
  일정: 'SCHEDULE',
  '기능 범위': 'SCOPE',
  '의사 결정': 'DECISION',
  '사용자 경험': 'UX',
  '기술 리스크': 'TECH_RISK',
  '비용/성과': 'COST_PERFORMANCE',
  '고객 반응': 'CUSTOMER_REACTION',
  '운영 이슈': 'OPERATION_ISSUE',
  '액션 아이템': 'ACTION_ITEM',
  '팀 질문': 'TEAM_QUESTION',
}

const accountLabelByRole = new Map<RoleProfileRole, AccountRoleLabel>(
  (Object.entries(roleByAccountLabel) as [AccountRoleLabel, RoleProfileRole][]).map(
    ([label, role]) => [role, label],
  ),
)

const focusTagByPerspective = new Map<RoleProfilePerspective, AccountFocusTag>(
  (Object.entries(perspectiveByFocusTag) as [AccountFocusTag, RoleProfilePerspective][]).map(
    ([tag, perspective]) => [perspective, tag],
  ),
)

const iconByRoleLabel = new Map<string, string>(
  accountRoleOptions.map((option) => [option.label, option.icon]),
)
const fallbackRoleIcon = accountRoleOptions[accountRoleOptions.length - 1].icon

/** 서버 역할·관점 프로필을 계정 화면 항목으로 변환합니다. */
export function toAccountPerspective(profile: RoleProfile): AccountPerspective {
  const roleLabel = accountLabelByRole.get(profile.role) ?? profile.role
  const focusTags = profile.perspectives
    .map((perspective) => focusTagByPerspective.get(perspective))
    .filter((tag): tag is AccountFocusTag => Boolean(tag))

  return {
    detailRole: profile.detailRole,
    focusDescription: focusTags.join(', ') || profile.detailRole || '직접 설정',
    focusTags,
    icon: iconByRoleLabel.get(roleLabel) ?? fallbackRoleIcon,
    id: String(profile.id),
    isDefault: profile.isDefault,
    roleLabel,
  }
}

/** 계정 화면 입력값을 서버 요청으로 변환합니다. */
export function toRoleProfileRequest(draft: AccountPerspectiveDraft): RoleProfileRequest {
  const role = roleByAccountLabel[draft.roleLabel as AccountRoleLabel]
  const perspectives = draft.focusTags
    .map((tag) => perspectiveByFocusTag[tag])
    .filter((perspective): perspective is RoleProfilePerspective => Boolean(perspective))

  if (!role || perspectives.length !== draft.focusTags.length) {
    throw new Error('역할·관점 요청값을 변환할 수 없습니다.')
  }

  return {
    role,
    detailRole: draft.detailRole || undefined,
    perspectives,
  }
}
