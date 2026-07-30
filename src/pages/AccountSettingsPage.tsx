import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { ProjectNavigationState } from '../features/meeting-processing'
import {
  AccountSettingsView,
  type AccountSettingsViewProps,
  defaultAccountPerspectives,
  PersonalSettingsPanel,
} from '../features/account-settings'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'

type AccountSettingsPageProps = {
  user: ProjectSidebarUser
} & Pick<
  AccountSettingsViewProps,
  'initialProfileImageUrl' | 'onSaveName' | 'onSaveProfileImage' | 'onUploadProfileImage'
>

export function AccountSettingsPage({
  initialProfileImageUrl,
  onSaveName,
  onSaveProfileImage,
  onUploadProfileImage,
  user,
}: AccountSettingsPageProps) {
  const navigate = useNavigate()
  const [accountName, setAccountName] = useState(user.name)

  const handleSaveName = async (nextName: string) => {
    await onSaveName?.(nextName)
    setAccountName(nextName)
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
        }}
        user={{ ...user, name: accountName }}
      />
      <div className="flex min-w-0 flex-1 gap-s overflow-hidden px-l py-xl">
        <PersonalSettingsPanel />
        <AccountSettingsView
          email={user.email}
          initialProfileImageUrl={initialProfileImageUrl}
          name={accountName}
          onSaveName={handleSaveName}
          onSaveProfileImage={onSaveProfileImage}
          onUploadProfileImage={onUploadProfileImage}
          perspectives={defaultAccountPerspectives}
        />
      </div>
    </main>
  )
}
