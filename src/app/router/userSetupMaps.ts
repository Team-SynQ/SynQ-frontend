export type RoleData = {
  selectedRole: string
  detailRole: string
}

export const ROLE_LABEL_MAP: Record<string, string> = {
  pm: '기획/운영',
  design: '디자인/콘텐츠',
  dev: '개발/기술',
  marketing: '마케팅/브랜딩',
  sales: '영업/고객',
  data: '데이터/리서치',
  exec: '경영/전략',
  etc: '기타',
}

export const ROLE_ICON_MAP: Record<string, string> = {
  pm: '/assets/images/role-pm.png',
  design: '/assets/images/role-design.png',
  dev: '/assets/images/role-dev.png',
  marketing: '/assets/images/role-marketing.png',
  sales: '/assets/images/role-sales.png',
  data: '/assets/images/role-data.png',
  exec: '/assets/images/role-exec.png',
  etc: '/assets/images/role-etc.png',
}

export const PERSPECTIVE_LABEL_MAP: Record<string, string> = {
  schedule: '일정',
  scope: '기능 범위',
  decision: '의사 결정',
  ux: '사용자 경험',
  tech_risk: '기술 리스크',
  cost_performance: '비용/성과',
  customer_feedback: '고객 반응',
  ops_issue: '운영 이슈',
  action_item: '액션 아이템',
  team_qna: '팀 질문',
}
