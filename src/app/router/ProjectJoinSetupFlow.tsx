import { type Dispatch, type SetStateAction, useState } from 'react'
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'

import UserPerspectiveSetupPage from '../../pages/UserPerspectiveSetupPage'
import UserRoleSetupPage from '../../pages/UserRoleSetupPage'
import UserSetupPreviewPage from '../../pages/UserSetupPreviewPage'
import { projectApi } from '../../entities/project'
import type { ProjectNavigationState } from '../../features/meeting-processing'
import { savePendingInviteToken } from '../../features/project-invite'
import { ApiError } from '../../shared/api/apiError'
import { toPerspectiveEnums, toRoleEnum } from '../../shared/lib/onboardingMapper'
import {
  PERSPECTIVE_LABEL_MAP,
  ROLE_ICON_MAP,
  ROLE_LABEL_MAP,
  type RoleData,
} from './userSetupMaps'

const PROJECT_SETUP_FOOTNOTE =
  '선택한 역할·관점은 참여 요청과 함께 전달되며 승인 후 이 프로젝트에 적용됩니다.'

type ProjectJoinSetupLocationState = {
  inviteToken?: string
  projectId?: number
  projectName?: string
} | null

type ProjectJoinSetupContextValue = {
  /** 참여 요청에 필요한 값들. 초대 화면을 거치지 않고 들어오면 없을 수 있습니다. */
  inviteToken?: string
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
  const inviteToken = locationState?.inviteToken
  const projectId = locationState?.projectId
  const [projectName] = useState(() => locationState?.projectName ?? '프로젝트')
  const [roleData, setRoleData] = useState<RoleData | null>(null)
  const [perspectives, setPerspectives] = useState<string[]>([])

  return (
    <Outlet
      context={
        {
          inviteToken,
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
  const { inviteToken, projectId, perspectives, roleData } = useProjectJoinSetupContext()
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const selectedRole = roleData?.selectedRole ?? ''

  const goToProjects = (joinRequestSent: boolean) => {
    navigate('/projects', {
      replace: true,
      state: { joinRequestSent } satisfies ProjectNavigationState,
    })
  }

  /**
   * 참여 요청은 여기서 나갑니다. 서버가 역할·관점을 필수로 받고, 승인 시 이 값을 그대로 복사합니다.
   * 요청에 성공한 뒤에만 이동합니다. 실패하고 넘어가면 고른 값이 조용히 사라집니다.
   */
  const handleComplete = async () => {
    if (isSending) return

    // 초대 화면을 거치지 않고 주소로 직접 들어오면 어느 프로젝트에 보낼지 알 수 없습니다.
    if (!inviteToken || projectId === undefined || !roleData) {
      goToProjects(false)
      return
    }

    setIsSending(true)
    setSendError(null)
    try {
      const roleCategory = toRoleEnum(roleData.selectedRole)
      const detailRole = roleData.detailRole?.trim() ?? ''

      await projectApi.createProjectJoinRequest(projectId, {
        inviteToken,
        // 이 프로젝트에서 쓰려고 방금 고른 값입니다.
        settingSource: 'PROJECT_CUSTOM',
        roleCategory,
        // 서버는 역할이 ETC일 때만 세부 역할을 요구합니다.
        ...(roleCategory === 'ETC' ? { detailRole } : {}),
        perspectives: toPerspectiveEnums(perspectives),
      })
      goToProjects(true)
    } catch (error) {
      // 만료된 토큰은 초대 화면의 로그인 확인을 통과합니다. 여기서 걸리면 다시 로그인시킵니다.
      if (error instanceof ApiError && error.status === 401) {
        savePendingInviteToken(inviteToken)
        navigate('/login')
        return
      }

      setSendError(
        error instanceof Error && error.message
          ? error.message
          : '참여 요청을 보내지 못했습니다. 다시 시도해 주세요.',
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <UserSetupPreviewPage
      selectedRoleLabel={ROLE_LABEL_MAP[selectedRole] ?? selectedRole}
      selectedRoleIcon={ROLE_ICON_MAP[selectedRole] ?? ''}
      detailRole={roleData?.detailRole}
      errorMessage={sendError}
      pending={isSending}
      selectedPerspectiveLabels={perspectives.map((id) => PERSPECTIVE_LABEL_MAP[id] ?? id)}
      footnote={PROJECT_SETUP_FOOTNOTE}
      onPrev={() => navigate('/invite/setup/perspectives')}
      onComplete={() => void handleComplete()}
    />
  )
}
