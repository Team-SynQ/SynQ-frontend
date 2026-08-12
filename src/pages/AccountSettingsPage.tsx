import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ProjectNavigationState } from '../features/meeting-processing'
import {
  AccountSettingsView,
  toAccountPerspective,
  toRoleProfileRequest,
  type AccountPerspective,
  type AccountPerspectiveDraft,
  type AccountSettingsViewProps,
  PersonalSettingsPanel,
} from '../features/account-settings'
import {
  addMyRoleProfile,
  changeDefaultRoleProfile,
  changeMyRoleProfile,
  loadMyRoleProfiles,
  removeMyRoleProfile,
} from '../entities/user'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'

type AccountSettingsPageProps = {
  user: ProjectSidebarUser
  loadPerspectives?: () => Promise<AccountPerspective[]>
  addPerspective?: (draft: AccountPerspectiveDraft) => Promise<AccountPerspective>
  updatePerspective?: (perspective: AccountPerspective) => Promise<AccountPerspective>
  deletePerspective?: (perspectiveId: string) => Promise<void> | void
  setDefaultPerspective?: (perspectiveId: string) => Promise<void> | void
} & Pick<
  AccountSettingsViewProps,
  'initialProfileImageUrl' | 'onSaveName' | 'onSaveProfileImage' | 'onUploadProfileImage'
>

const loadAccountPerspectives = async () => (await loadMyRoleProfiles()).map(toAccountPerspective)

const addAccountPerspective = async (draft: AccountPerspectiveDraft) =>
  toAccountPerspective(await addMyRoleProfile(toRoleProfileRequest(draft)))

const updateAccountPerspective = async (perspective: AccountPerspective) =>
  toAccountPerspective(
    await changeMyRoleProfile(Number(perspective.id), toRoleProfileRequest(perspective)),
  )

const deleteAccountPerspective = async (perspectiveId: string) => {
  await removeMyRoleProfile(Number(perspectiveId))
}

const setDefaultAccountPerspective = async (perspectiveId: string) => {
  await changeDefaultRoleProfile(Number(perspectiveId))
}

export function AccountSettingsPage({
  initialProfileImageUrl,
  loadPerspectives = loadAccountPerspectives,
  addPerspective = addAccountPerspective,
  updatePerspective = updateAccountPerspective,
  deletePerspective = deleteAccountPerspective,
  setDefaultPerspective = setDefaultAccountPerspective,
  onSaveName,
  onSaveProfileImage,
  onUploadProfileImage,
  user,
}: AccountSettingsPageProps) {
  const navigate = useNavigate()
  const [accountName, setAccountName] = useState(user.name)
  const [perspectives, setPerspectives] = useState<AccountPerspective[]>([])

  useEffect(() => {
    let isSubscribed = true

    loadPerspectives()
      .then((loaded) => {
        if (isSubscribed) setPerspectives(loaded)
      })
      .catch(() => {
        // 조회 실패 로그는 API 래퍼가 남기고, 화면은 빈 목록을 유지합니다.
      })

    return () => {
      isSubscribed = false
    }
  }, [loadPerspectives])

  const handleSaveName = async (nextName: string) => {
    await onSaveName?.(nextName)
    setAccountName(nextName)
  }

  const handleAddPerspective = async (draft: AccountPerspectiveDraft) => {
    const created = await addPerspective(draft)
    setPerspectives((current) => [...current, created])
  }

  // 실패 시 그대로 던져서 화면이 성공 토스트를 띄우지 않게 합니다.
  const handleDeletePerspective = async (perspectiveId: string) => {
    await deletePerspective(perspectiveId)
    setPerspectives((current) => current.filter(({ id }) => id !== perspectiveId))
  }

  const handleSetDefaultPerspective = async (perspectiveId: string) => {
    try {
      await setDefaultPerspective(perspectiveId)
    } catch {
      return
    }

    setPerspectives((current) =>
      current.map((perspective) => ({
        ...perspective,
        isDefault: perspective.id === perspectiveId,
      })),
    )
  }

  const handleUpdatePerspective = async (nextPerspective: AccountPerspective) => {
    const updated = await updatePerspective(nextPerspective)
    setPerspectives((current) =>
      current.map((perspective) => (perspective.id === updated.id ? updated : perspective)),
    )
  }

  return (
    <main className="flex h-screen min-h-[720px] min-w-[1024px] bg-surface-default">
      <ProjectSidebar
        onAddProject={() =>
          navigate('/projects', {
            state: { openCreateProject: true } satisfies ProjectNavigationState,
          })
        }
        accountSettingsActions={{
          onOpenAccountInfo: () => navigate('/settings/account'),
          onOpenHelp: () => navigate('/settings/help'),
          onOpenTerms: () => navigate('/settings/policy'),
        }}
        user={{ ...user, name: accountName }}
      />
      <div className="flex min-w-0 flex-1 gap-s overflow-hidden px-l py-xl">
        <PersonalSettingsPanel
          onSelectSection={(section) => {
            if (section === 'help') navigate('/settings/help')
            if (section === 'policy') navigate('/settings/policy')
          }}
        />
        <AccountSettingsView
          email={user.email}
          initialProfileImageUrl={initialProfileImageUrl}
          name={accountName}
          onAddPerspective={handleAddPerspective}
          onDeletePerspective={handleDeletePerspective}
          onSaveName={handleSaveName}
          onSetDefaultPerspective={handleSetDefaultPerspective}
          onSaveProfileImage={onSaveProfileImage}
          onUpdatePerspective={handleUpdatePerspective}
          onUploadProfileImage={onUploadProfileImage}
          perspectives={perspectives}
        />
      </div>
    </main>
  )
}
