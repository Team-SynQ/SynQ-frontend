import { useNavigate } from 'react-router-dom'

import { PersonalSettingsPanel } from '../features/account-settings'
import type { ProjectNavigationState } from '../features/meeting-processing'
import { PolicyDocumentsView } from '../features/policy-documents'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'

export type PolicyDocumentsPageProps = {
  user: ProjectSidebarUser
}

export function PolicyDocumentsPage({ user }: PolicyDocumentsPageProps) {
  const navigate = useNavigate()

  return (
    <main className="flex h-screen min-h-[720px] min-w-[1024px] bg-surface-default">
      <ProjectSidebar
        accountSettingsActions={{
          onOpenAccountInfo: () => navigate('/settings/account'),
          onOpenHelp: () => navigate('/settings/help'),
          onOpenTerms: () => navigate('/settings/policy'),
        }}
        onAddProject={() =>
          navigate('/projects', {
            state: { openCreateProject: true } satisfies ProjectNavigationState,
          })
        }
        user={user}
      />
      <div className="flex min-w-0 flex-1 gap-s overflow-hidden px-l py-xl">
        <PersonalSettingsPanel
          activeSection="policy"
          onSelectSection={(section) => {
            if (section === 'account') navigate('/settings/account')
            if (section === 'help') navigate('/settings/help')
          }}
        />
        <PolicyDocumentsView />
      </div>
    </main>
  )
}
