import type { RoleProfile } from '../../../entities/user'
import type {
  RoleProfilePerspective,
  RoleProfileRole,
} from '../../../shared/api/contracts/user.contracts'

import type {
  ProjectFocusOption,
  ProjectPerspectiveOption,
  ProjectRoleOption,
} from './projectCreate.types'

export const projectPerspectiveOptions: ProjectPerspectiveOption[] = [
  {
    id: 'planning-operations',
    label: '기획/운영',
    description: '일정, 사용자 경험, 의사 결정',
    selectedDescription: '일정, 범위, 의사결정 영향 중심',
  },
  {
    id: 'data-research',
    label: '데이터/리서치',
    description: '고객 반응',
    selectedDescription: '고객 반응 중심',
  },
]

export const projectRoleOptions: ProjectRoleOption[] = [
  { id: 'pm', label: '기획/운영', icon: '/assets/images/role-pm.png' },
  { id: 'design', label: '디자인/콘텐츠', icon: '/assets/images/role-design.png' },
  { id: 'dev', label: '개발/기술', icon: '/assets/images/role-dev.png' },
  { id: 'marketing', label: '마케팅/브랜딩', icon: '/assets/images/role-marketing.png' },
  { id: 'sales', label: '영업/고객', icon: '/assets/images/role-sales.png' },
  { id: 'data', label: '데이터/리서치', icon: '/assets/images/role-data.png' },
  { id: 'exec', label: '경영/전략', icon: '/assets/images/role-exec.png' },
  { id: 'etc', label: '기타', icon: '/assets/images/role-etc.png' },
]

export const projectFocusOptions: ProjectFocusOption[] = [
  { id: 'schedule', label: '일정' },
  { id: 'scope', label: '기능 범위' },
  { id: 'decision', label: '의사 결정' },
  { id: 'ux', label: '사용자 경험' },
  { id: 'tech-risk', label: '기술 리스크' },
  { id: 'cost-performance', label: '비용/성과' },
  { id: 'customer-feedback', label: '고객 반응' },
  { id: 'operations-issue', label: '운영 이슈' },
  { id: 'action-item', label: '액션 아이템' },
  { id: 'team-question', label: '팀 질문' },
]

/** 화면 옵션 id ↔ 서버 enum 대응표입니다. */
export const roleByOptionId: Record<string, RoleProfileRole> = {
  pm: 'PLANNING_OPERATION',
  design: 'DESIGN_CONTENT',
  dev: 'DEV_TECH',
  marketing: 'MARKETING_BRANDING',
  sales: 'SALES_CUSTOMER',
  data: 'DATA_RESEARCH',
  exec: 'STRATEGY_MANAGEMENT',
  etc: 'ETC',
}

export const perspectiveByOptionId: Record<string, RoleProfilePerspective> = {
  schedule: 'SCHEDULE',
  scope: 'SCOPE',
  decision: 'DECISION',
  ux: 'UX',
  'tech-risk': 'TECH_RISK',
  'cost-performance': 'COST_PERFORMANCE',
  'customer-feedback': 'CUSTOMER_REACTION',
  'operations-issue': 'OPERATION_ISSUE',
  'action-item': 'ACTION_ITEM',
  'team-question': 'TEAM_QUESTION',
}

const roleLabelByServerValue = new Map(
  projectRoleOptions.map((option) => [roleByOptionId[option.id], option.label]),
)

const focusLabelByServerValue = new Map(
  projectFocusOptions.map((option) => [perspectiveByOptionId[option.id], option.label]),
)

export function roleProfileOptionId(profileId: number) {
  return `role-profile-${profileId}`
}

/** 서버 역할·관점 프로필을 화면에서 쓰는 관점 옵션으로 변환합니다. */
export function toProjectPerspectiveOption(profile: RoleProfile): ProjectPerspectiveOption {
  const label = roleLabelByServerValue.get(profile.role) ?? profile.role
  const description =
    profile.perspectives
      .map((perspective) => focusLabelByServerValue.get(perspective))
      .filter((focusLabel): focusLabel is string => Boolean(focusLabel))
      .join(', ') ||
    profile.detailRole ||
    '직접 설정'

  return {
    id: roleProfileOptionId(profile.id),
    label,
    description,
    selectedDescription: description,
  }
}
