import type { ProjectSummary } from '../../../entities/project'
import { cn } from '../../../shared/lib/cn'

import { ProjectCreatedDashboard } from './ProjectCreatedDashboard'
import { ProjectEmptyState } from './ProjectEmptyState'

type ProjectMainboardProps = {
  project?: ProjectSummary
  onCreateProject?: () => void
}

export function ProjectMainboard({ project, onCreateProject }: ProjectMainboardProps) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-1 px-l py-xl',
        project ? 'items-start' : 'items-center justify-center',
      )}
    >
      {project ? (
        <ProjectCreatedDashboard project={project} />
      ) : (
        <ProjectEmptyState onCreateProject={onCreateProject} />
      )}
    </section>
  )
}
