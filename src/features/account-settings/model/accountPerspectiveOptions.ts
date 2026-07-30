export const accountRoleOptions = [
  { label: '기획/운영', icon: '/assets/images/role-pm.png' },
  { label: '디자인/콘텐츠', icon: '/assets/images/role-design.png' },
  { label: '개발/기술', icon: '/assets/images/role-dev.png' },
  { label: '마케팅/브랜딩', icon: '/assets/images/role-marketing.png' },
  { label: '영업/고객', icon: '/assets/images/role-sales.png' },
  { label: '데이터/리서치', icon: '/assets/images/role-data.png' },
  { label: '경영/전략', icon: '/assets/images/role-exec.png' },
  { label: '기타', icon: '/assets/images/role-etc.png' },
] as const

export const accountFocusOptions = [
  '일정',
  '기능 범위',
  '의사 결정',
  '사용자 경험',
  '기술 리스크',
  '고객 반응',
  '운영 이슈',
  '액션 아이템',
  '팀 질문',
] as const

export type AccountRoleLabel = (typeof accountRoleOptions)[number]['label']
export type AccountFocusTag = (typeof accountFocusOptions)[number]
