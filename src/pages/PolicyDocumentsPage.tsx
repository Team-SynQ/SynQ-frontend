import { useNavigate } from 'react-router-dom'

import type { ProjectNavigationState } from '../features/meeting-processing'
import { PolicyDocumentsView } from '../features/policy-documents'
import {
  ProjectSidebar,
  useSidebarProjects,
  type ProjectSidebarUser,
} from '../widgets/project-sidebar'

export type PolicyDocumentsPageProps = {
  user: ProjectSidebarUser
}

export function PolicyDocumentsPage({ user }: PolicyDocumentsPageProps) {
  const navigate = useNavigate()
  const sidebarProjects = useSidebarProjects()

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
        onSelectProject={(projectId) =>
          navigate('/projects', {
            state: { activeProjectId: projectId } satisfies ProjectNavigationState,
          })
        }
        projects={sidebarProjects}
        user={user}
      />
      <div className="flex min-w-0 flex-1 overflow-hidden px-l py-xl">
        <PolicyDocumentsView />
      </div>
    </main>
  )
}
