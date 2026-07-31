import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ProjectNavigationState } from '../features/meeting-processing'
import {
  AccountSettingsView,
  type AccountPerspective,
  type AccountPerspectiveDraft,
  type AccountSettingsViewProps,
  defaultAccountPerspectives,
  PersonalSettingsPanel,
} from '../features/account-settings'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'

type AccountSettingsPageProps = {
  user: ProjectSidebarUser
} & Pick<
  AccountSettingsViewProps,
  | 'initialProfileImageUrl'
  | 'onAddPerspective'
  | 'onSaveName'
  | 'onSaveProfileImage'
  | 'onUpdatePerspective'
  | 'onUploadProfileImage'
>

export function AccountSettingsPage({
  initialProfileImageUrl,
  onAddPerspective,
  onSaveName,
  onSaveProfileImage,
  onUpdatePerspective,
  onUploadProfileImage,
  user,
}: AccountSettingsPageProps) {
  const navigate = useNavigate()
  const [accountName, setAccountName] = useState(user.name)
  const [perspectives, setPerspectives] = useState(defaultAccountPerspectives)

  const handleSaveName = async (nextName: string) => {
    await onSaveName?.(nextName)
    setAccountName(nextName)
  }

  const handleAddPerspective = async (draft: AccountPerspectiveDraft) => {
    await onAddPerspective?.(draft)
    setPerspectives((current) => [
      ...current,
      {
        ...draft,
        id: `custom-perspective-${Date.now()}-${current.length}`,
      },
    ])
  }

  const handleDeletePerspective = (perspectiveId: string) => {
    setPerspectives((current) => current.filter(({ id }) => id !== perspectiveId))
  }

  const handleSetDefaultPerspective = (perspectiveId: string) => {
    setPerspectives((current) =>
      current.map((perspective) => ({
        ...perspective,
        isDefault: perspective.id === perspectiveId,
      })),
    )
  }

  const handleUpdatePerspective = async (nextPerspective: AccountPerspective) => {
    await onUpdatePerspective?.(nextPerspective)
    setPerspectives((current) =>
      current.map((perspective) =>
        perspective.id === nextPerspective.id ? nextPerspective : perspective,
      ),
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
