import { type Dispatch, type SetStateAction, useState } from 'react'
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom'

import UserPerspectiveSetupPage from '../../pages/UserPerspectiveSetupPage'
import UserRoleSetupPage from '../../pages/UserRoleSetupPage'
import UserSetupPreviewPage from '../../pages/UserSetupPreviewPage'
import { userService } from '../../shared/api/services/user.service'
import { toPerspectiveEnums, toRoleEnum } from '../../shared/lib/onboardingMapper'
import {
  PERSPECTIVE_LABEL_MAP,
  ROLE_ICON_MAP,
  ROLE_LABEL_MAP,
  type RoleData,
} from './userSetupMaps'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectedRole = roleData?.selectedRole ?? ''

  const handleComplete = async () => {
    if (isSubmitting || !roleData) return
    setIsSubmitting(true)

    try {
      const roleEnum = toRoleEnum(roleData.selectedRole)
      const perspectivesEnum = toPerspectiveEnums(perspectives)
      const trimmedDetail = roleData.detailRole?.trim() ?? ''
      const detailRolePayload = roleEnum === 'ETC' ? trimmedDetail : ''

      const response = await userService.createRoleProfile({
        role: roleEnum,
        detailRole: detailRolePayload,
        perspectives: perspectivesEnum,
      })

      if (response.isSuccess) {
        navigate('/projects')
      }
    } catch (error) {
      console.error('역할/관점 저장 실패:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <UserSetupPreviewPage
      selectedRoleLabel={ROLE_LABEL_MAP[selectedRole] ?? selectedRole}
      selectedRoleIcon={ROLE_ICON_MAP[selectedRole] ?? ''}
      detailRole={roleData?.detailRole}
      selectedPerspectiveLabels={perspectives.map((id) => PERSPECTIVE_LABEL_MAP[id] ?? id)}
      onPrev={() => navigate('/setup/perspectives')}
      onComplete={handleComplete}
    />
  )
}
