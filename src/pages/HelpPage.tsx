import { useNavigate } from 'react-router-dom'

import { PersonalSettingsPanel } from '../features/account-settings'
import { HelpView } from '../features/help'
import type { ProjectNavigationState } from '../features/meeting-processing'
import { MeetingTutorialPreview } from '../features/meeting-tutorial'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'

export type HelpPageProps = {
  user: ProjectSidebarUser
}

export function HelpPage({ user }: HelpPageProps) {
  const navigate = useNavigate()

  return (
    <main className="flex h-screen min-h-[720px] min-w-[1024px] bg-surface-default">
      <ProjectSidebar
        accountSettingsActions={{
          onOpenAccountInfo: () => navigate('/settings/account'),
          onOpenHelp: () => navigate('/settings/help'),
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
          activeSection="help"
          onSelectSection={(section) => {
            if (section === 'account') navigate('/settings/account')
          }}
        />
        <HelpView renderMeetingTutorial={(step) => <MeetingTutorialPreview step={step} />} />
      </div>
    </main>
  )
}
