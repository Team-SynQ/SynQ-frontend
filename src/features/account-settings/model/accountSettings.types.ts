export type AccountPerspective = {
  id: string
  roleLabel: string
  focusDescription: string
  icon: string
  isDefault?: boolean
}

export const defaultAccountPerspectives: AccountPerspective[] = [
  {
    id: 'planning-operations',
    roleLabel: '기획/운영',
    focusDescription: '일정, 범위, 의사결정 영향 중심',
    icon: '/assets/images/role-pm.png',
    isDefault: true,
  },
  {
    id: 'data-research',
    roleLabel: '데이터/리서치',
    focusDescription: '기능 범위',
    icon: '/assets/images/role-data.png',
  },
]
