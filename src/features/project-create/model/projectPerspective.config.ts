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
