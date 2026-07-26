import type { ProjectSummary } from '../../../entities/project'
import type { ProjectMaterialDraft } from '../../../features/project-create'
import { cn } from '../../../shared/lib/cn'

import { ProjectCreatedDashboard } from './ProjectCreatedDashboard'
import { ProjectEmptyState } from './ProjectEmptyState'

type ProjectMainboardProps = {
  project?: ProjectSummary
  onCreateProject?: () => void
  onAddMaterials?: (materials: ProjectMaterialDraft) => Promise<void> | void
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
}

export function ProjectMainboard({
  project,
  onAddMaterials,
  onCreateProject,
  onDeleteMaterial,
  onRenameMaterial,
}: ProjectMainboardProps) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-1 px-l py-xl',
        project ? 'items-start' : 'items-center justify-center',
      )}
    >
      {project ? (
        <ProjectCreatedDashboard
          onAddMaterials={onAddMaterials}
          onDeleteMaterial={onDeleteMaterial}
          onRenameMaterial={onRenameMaterial}
          project={project}
        />
      ) : (
        <ProjectEmptyState onCreateProject={onCreateProject} />
      )}
    </section>
  )
}
