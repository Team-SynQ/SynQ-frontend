import type { CompletedMeeting } from '../../../entities/meeting'
import type { ProjectSummary } from '../../../entities/project'
import type { ProjectMaterialDraft } from '../../../features/project-create'
import type { MeetingHistoryPresentation } from '../../../features/meeting-processing'
import type { ProjectInformationDraft } from '../../../features/project-settings'
import { cn } from '../../../shared/lib/cn'

import { ProjectCreatedDashboard } from './ProjectCreatedDashboard'
import { ProjectEmptyState } from './ProjectEmptyState'

type ProjectMainboardProps = {
  project?: ProjectSummary
  onCreateProject?: () => void
  onAddMaterials?: (materials: ProjectMaterialDraft) => Promise<void> | void
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
  meetings?: CompletedMeeting[]
  meetingHistoryPresentation?: MeetingHistoryPresentation
  meetingProcessingOverlayOpen?: boolean
  meetingHistoryError?: string
  onRetryMeetingHistory?: () => void
  onOpenMeetingDetail?: (recordId: string) => void
  onStartMeeting?: () => void
  onLoadProject?: () => Promise<ProjectSummary | void> | ProjectSummary | void
  onUpdateProject?: (draft: ProjectInformationDraft) => Promise<void> | void
  onDeleteProject?: () => Promise<void> | void
}

export function ProjectMainboard({
  project,
  onAddMaterials,
  onCreateProject,
  onDeleteMaterial,
  onRenameMaterial,
  meetings = [],
  meetingHistoryPresentation,
  meetingProcessingOverlayOpen,
  meetingHistoryError,
  onRetryMeetingHistory,
  onOpenMeetingDetail,
  onStartMeeting,
  onLoadProject,
  onUpdateProject,
  onDeleteProject,
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
          meetings={meetings}
          meetingHistoryPresentation={meetingHistoryPresentation}
          meetingProcessingOverlayOpen={meetingProcessingOverlayOpen}
          meetingHistoryError={meetingHistoryError}
          onRetryMeetingHistory={onRetryMeetingHistory}
          onOpenMeetingDetail={onOpenMeetingDetail}
          onStartMeeting={onStartMeeting}
          onDeleteProject={onDeleteProject}
          onLoadProject={onLoadProject}
          onUpdateProject={onUpdateProject}
          project={project}
        />
      ) : (
        <ProjectEmptyState onCreateProject={onCreateProject} />
      )}
    </section>
  )
}
