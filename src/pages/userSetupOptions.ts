/**
 * 온보딩 역할·관점 선택지.
 *
 * 페이지 컴포넌트 파일에서 상수를 내보내면 Fast Refresh 규칙에 걸려 별도 모듈로 둔다.
 * 각 `id`는 `shared/lib/onboardingMapper`가 서버 enum으로 옮기는 키다. 여기에 항목을
 * 추가하면 매핑도 함께 추가해야 하며, 빠뜨리면 `onboardingMapper.test.ts`가 실패한다.
 */
export const ROLE_OPTIONS = [
  { id: 'pm', label: '기획/운영', icon: '/assets/images/role-pm.png' },
  { id: 'design', label: '디자인/콘텐츠', icon: '/assets/images/role-design.png' },
  { id: 'dev', label: '개발/기술', icon: '/assets/images/role-dev.png' },
  { id: 'marketing', label: '마케팅/브랜딩', icon: '/assets/images/role-marketing.png' },
  { id: 'sales', label: '영업/고객', icon: '/assets/images/role-sales.png' },
  { id: 'data', label: '데이터/리서치', icon: '/assets/images/role-data.png' },
  { id: 'exec', label: '경영/전략', icon: '/assets/images/role-exec.png' },
  { id: 'etc', label: '기타', icon: '/assets/images/role-etc.png' },
]

export const PERSPECTIVE_OPTIONS = [
  { id: 'schedule', label: '일정' },
  { id: 'scope', label: '기능 범위' },
  { id: 'decision', label: '의사 결정' },
  { id: 'ux', label: '사용자 경험' },
  { id: 'tech_risk', label: '기술 리스크' },
  { id: 'cost_performance', label: '비용/성과' },
  { id: 'customer_feedback', label: '고객 반응' },
  { id: 'ops_issue', label: '운영 이슈' },
  { id: 'action_item', label: '액션 아이템' },
  { id: 'team_qna', label: '팀 질문' },
]
