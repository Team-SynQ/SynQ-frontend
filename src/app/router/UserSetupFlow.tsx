import { type Dispatch, type SetStateAction, useState } from 'react'
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom'

import UserPerspectiveSetupPage from '../../pages/UserPerspectiveSetupPage'
import UserRoleSetupPage from '../../pages/UserRoleSetupPage'
import UserSetupPreviewPage from '../../pages/UserSetupPreviewPage'

const ROLE_LABEL_MAP: Record<string, string> = {
  pm: '기획/운영',
  design: '디자인/콘텐츠',
  dev: '개발/기술',
  marketing: '마케팅/브랜딩',
  sales: '영업/고객',
  data: '데이터/리서치',
  exec: '경영/전략',
  etc: '기타',
}

const ROLE_ICON_MAP: Record<string, string> = {
  pm: '/assets/images/role-pm.png',
  design: '/assets/images/role-design.png',
  dev: '/assets/images/role-dev.png',
  marketing: '/assets/images/role-marketing.png',
  sales: '/assets/images/role-sales.png',
  data: '/assets/images/role-data.png',
  exec: '/assets/images/role-exec.png',
  etc: '/assets/images/role-etc.png',
}

const PERSPECTIVE_LABEL_MAP: Record<string, string> = {
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

type RoleData = {
  selectedRole: string
  detailRole: string
}

type UserSetupContextValue = {
  perspectives: string[]
  roleData: RoleData | null
  setPerspectives: Dispatch<SetStateAction<string[]>>
  setRoleData: Dispatch<SetStateAction<RoleData | null>>
}

function useUserSetupContext() {
  return useOutletContext<UserSetupContextValue>()
}

export function UserSetupFlow() {
  const [roleData, setRoleData] = useState<RoleData | null>(null)
  const [perspectives, setPerspectives] = useState<string[]>([])

  return (
    <Outlet
      context={
        {
          perspectives,
          roleData,
          setPerspectives,
          setRoleData,
        } satisfies UserSetupContextValue
      }
    />
  )
}

export function UserRoleSetupRoute() {
  const navigate = useNavigate()
  const { setRoleData } = useUserSetupContext()

  return (
    <UserRoleSetupPage
      username="username"
      onNext={(data) => {
        setRoleData(data)
        navigate('/setup/perspectives')
      }}
    />
  )
}

export function UserPerspectiveSetupRoute() {
  const navigate = useNavigate()
  const { setPerspectives } = useUserSetupContext()

  return (
    <UserPerspectiveSetupPage
      onPrev={() => navigate('/setup/role')}
      onNext={(selectedPerspectives) => {
        setPerspectives(selectedPerspectives)
        navigate('/setup/preview')
      }}
    />
  )
}

export function UserSetupPreviewRoute() {
  const navigate = useNavigate()
  const { perspectives, roleData } = useUserSetupContext()
  const selectedRole = roleData?.selectedRole ?? ''

  return (
    <UserSetupPreviewPage
      selectedRoleLabel={ROLE_LABEL_MAP[selectedRole] ?? selectedRole}
      selectedRoleIcon={ROLE_ICON_MAP[selectedRole] ?? ''}
      detailRole={roleData?.detailRole}
      selectedPerspectiveLabels={perspectives.map((id) => PERSPECTIVE_LABEL_MAP[id] ?? id)}
      onPrev={() => navigate('/setup/perspectives')}
      onComplete={() => {
        console.log('최종 온보딩 완료 데이터:', {
          ...roleData,
          perspectives,
        })
        window.alert('온보딩 설정이 완료되었습니다!')
      }}
    />
  )
}
