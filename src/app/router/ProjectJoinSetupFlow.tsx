import { type Dispatch, type SetStateAction, useState } from 'react'
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'

import UserPerspectiveSetupPage from '../../pages/UserPerspectiveSetupPage'
import UserRoleSetupPage from '../../pages/UserRoleSetupPage'
import UserSetupPreviewPage from '../../pages/UserSetupPreviewPage'
import type { ProjectNavigationState } from '../../features/meeting-processing'
import {
  PERSPECTIVE_LABEL_MAP,
  ROLE_ICON_MAP,
  ROLE_LABEL_MAP,
  type RoleData,
} from './userSetupMaps'

const PROJECT_SETUP_FOOTNOTE =
  '선택한 역할·관점은 계정의 기본 설정으로도 저장되며 추후 수정할 수 있어요.'

type ProjectJoinSetupLocationState = {
  projectName?: string
} | null

type ProjectJoinSetupContextValue = {
  projectName: string
  perspectives: string[]
  roleData: RoleData | null
  setPerspectives: Dispatch<SetStateAction<string[]>>
  setRoleData: Dispatch<SetStateAction<RoleData | null>>
}

function useProjectJoinSetupContext() {
  return useOutletContext<ProjectJoinSetupContextValue>()
}

/**
 * 초대 링크로 프로젝트에 참여한 직후, 그 프로젝트 맥락으로 역할·관점을 고르는 플로우입니다.
 * 화면 구성은 기존 온보딩(UserSetupFlow)과 같고 문구만 프로젝트 참여용으로 바뀝니다.
 */
export function ProjectJoinSetupFlow() {
  const location = useLocation()
  const [projectName] = useState(
    () => (location.state as ProjectJoinSetupLocationState)?.projectName ?? '프로젝트',
  )
  const [roleData, setRoleData] = useState<RoleData | null>(null)
  const [perspectives, setPerspectives] = useState<string[]>([])

  return (
    <Outlet
      context={
        {
          projectName,
          perspectives,
          roleData,
          setPerspectives,
          setRoleData,
        } satisfies ProjectJoinSetupContextValue
      }
    />
  )
}

export function ProjectJoinRoleSetupRoute() {
  const navigate = useNavigate()
  const { projectName, setRoleData } = useProjectJoinSetupContext()

  return (
    <UserRoleSetupPage
      projectName={projectName}
      username="username"
      onNext={(data) => {
        setRoleData(data)
        navigate('/invite/setup/perspectives')
      }}
    />
  )
}

export function ProjectJoinPerspectiveSetupRoute() {
  const navigate = useNavigate()
  const { projectName, setPerspectives } = useProjectJoinSetupContext()

  return (
    <UserPerspectiveSetupPage
      projectName={projectName}
      onPrev={() => navigate('/invite/setup/role')}
      onNext={(selectedPerspectives) => {
        setPerspectives(selectedPerspectives)
        navigate('/invite/setup/preview')
      }}
    />
  )
}

export function ProjectJoinPreviewRoute() {
  const navigate = useNavigate()
  const { perspectives, roleData } = useProjectJoinSetupContext()
  const selectedRole = roleData?.selectedRole ?? ''

  // TODO(#백엔드): 프로젝트별 역할·관점 저장 API가 준비되면 여기서 호출합니다. 지금은 화면 흐름만 잇습니다.
  const handleComplete = () => {
    navigate('/projects', {
      replace: true,
      state: { roleProfileSaved: true } satisfies ProjectNavigationState,
    })
  }

  return (
    <UserSetupPreviewPage
      selectedRoleLabel={ROLE_LABEL_MAP[selectedRole] ?? selectedRole}
      selectedRoleIcon={ROLE_ICON_MAP[selectedRole] ?? ''}
      detailRole={roleData?.detailRole}
      selectedPerspectiveLabels={perspectives.map((id) => PERSPECTIVE_LABEL_MAP[id] ?? id)}
      footnote={PROJECT_SETUP_FOOTNOTE}
      onPrev={() => navigate('/invite/setup/perspectives')}
      onComplete={handleComplete}
    />
  )
}
