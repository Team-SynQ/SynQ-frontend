import { type Dispatch, type SetStateAction, useState } from 'react'
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'

import UserPerspectiveSetupPage from '../../pages/UserPerspectiveSetupPage'
import UserRoleSetupPage from '../../pages/UserRoleSetupPage'
import UserSetupPreviewPage from '../../pages/UserSetupPreviewPage'
import { projectApi } from '../../entities/project'
import type { ProjectNavigationState } from '../../features/meeting-processing'
import { toPerspectiveEnums, toRoleEnum } from '../../shared/lib/onboardingMapper'
import {
  PERSPECTIVE_LABEL_MAP,
  ROLE_ICON_MAP,
  ROLE_LABEL_MAP,
  type RoleData,
} from './userSetupMaps'

const PROJECT_SETUP_FOOTNOTE = '선택한 역할·관점은 이 프로젝트에만 적용되며 추후 수정할 수 있어요.'

type ProjectJoinSetupLocationState = {
  projectId?: number
  projectName?: string
} | null

type ProjectJoinSetupContextValue = {
  /** 저장 대상 프로젝트. 초대 화면을 거치지 않고 들어오면 없을 수 있습니다. */
  projectId?: number
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
  const [locationState] = useState(() => location.state as ProjectJoinSetupLocationState)
  const projectId = locationState?.projectId
  const [projectName] = useState(() => locationState?.projectName ?? '프로젝트')
  const [roleData, setRoleData] = useState<RoleData | null>(null)
  const [perspectives, setPerspectives] = useState<string[]>([])

  return (
    <Outlet
      context={
        {
          projectId,
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
  const { projectId, perspectives, roleData } = useProjectJoinSetupContext()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const selectedRole = roleData?.selectedRole ?? ''

  const goToProjects = () => {
    navigate('/projects', {
      replace: true,
      state: { roleProfileSaved: true } satisfies ProjectNavigationState,
    })
  }

  /**
   * 프로젝트별 역할·관점은 계정 기본 프로필과 분리되어 저장됩니다.
   * 저장에 성공한 뒤에만 이동합니다. 실패하고 넘어가면 고른 값이 조용히 사라집니다.
   */
  const handleComplete = async () => {
    if (isSaving) return

    // 초대 화면을 거치지 않고 주소로 직접 들어오면 저장 대상을 알 수 없습니다. 화면 흐름만 잇습니다.
    if (projectId === undefined || !roleData) {
      goToProjects()
      return
    }

    setIsSaving(true)
    setSaveError(null)
    try {
      const roleCategory = toRoleEnum(roleData.selectedRole)
      const detailRole = roleData.detailRole?.trim() ?? ''

      await projectApi.updateProjectRolePerspective(projectId, {
        useDefault: false,
        roleCategory,
        // 서버는 역할이 ETC일 때만 세부 역할을 요구합니다.
        ...(roleCategory === 'ETC' ? { detailRole } : {}),
        perspectives: toPerspectiveEnums(perspectives),
      })
      goToProjects()
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message
          ? error.message
          : '역할·관점을 저장하지 못했습니다. 다시 시도해 주세요.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <UserSetupPreviewPage
      selectedRoleLabel={ROLE_LABEL_MAP[selectedRole] ?? selectedRole}
      selectedRoleIcon={ROLE_ICON_MAP[selectedRole] ?? ''}
      detailRole={roleData?.detailRole}
      errorMessage={saveError}
      pending={isSaving}
      selectedPerspectiveLabels={perspectives.map((id) => PERSPECTIVE_LABEL_MAP[id] ?? id)}
      footnote={PROJECT_SETUP_FOOTNOTE}
      onPrev={() => navigate('/invite/setup/perspectives')}
      onComplete={() => void handleComplete()}
    />
  )
}
