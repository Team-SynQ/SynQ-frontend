import type { CompletedMeeting, OngoingMeeting } from '../../../entities/meeting'
import type { ProjectSummary } from '../../../entities/project'
import type { ProjectMaterialDraft } from '../../../features/project-create'
import type { MeetingHistoryPresentation } from '../../../features/meeting-processing'
import type {
  ProjectInformationDraft,
  ProjectInformationPerspective,
} from '../../../features/project-settings'
import { cn } from '../../../shared/lib/cn'

import { ProjectCreatedDashboard } from './ProjectCreatedDashboard'
import { ProjectEmptyState } from './ProjectEmptyState'

type ProjectMainboardProps = {
  project?: ProjectSummary
  onCreateProject?: () => void
  onAddMaterials?: (materials: ProjectMaterialDraft) => Promise<void> | void
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
  onRenameMeeting?: (recordId: string, nextTitle: string) => Promise<void>
  onDeleteMeeting?: (recordId: string) => Promise<void>
  meetings?: CompletedMeeting[]
  /** 회의 기록을 수정·삭제할 수 있는지 가리는 기준. 그 회의를 진행한 사람만 가능합니다. */
  currentUserId?: number | null
  /** 프로젝트 목록을 아직 불러오는 중이면 빈 상태 대신 아무것도 그리지 않습니다. */
  projectsLoading?: boolean
  meetingHistoryLoading?: boolean
  meetingHistoryPresentation?: MeetingHistoryPresentation
  meetingProcessingOverlayOpen?: boolean
  meetingHistoryError?: string
  onRetryMeetingHistory?: () => void
  onRetryMeetingSummary?: (recordId: string) => void
  onOpenMeetingDetail?: (recordId: string) => void
  onStartMeeting?: () => void
  ongoingMeeting?: OngoingMeeting | null
  onJoinOngoingMeeting?: () => void
  onLoadProject?: () => Promise<ProjectSummary | void> | ProjectSummary | void
  onUpdateProject?: (draft: ProjectInformationDraft) => Promise<void> | void
  perspectiveOptions?: ProjectInformationPerspective[]
  onDeleteProject?: () => Promise<void> | void
}

export function ProjectMainboard({
  project,
  onAddMaterials,
  onCreateProject,
  onDeleteMaterial,
  onRenameMaterial,
  onRenameMeeting,
  onDeleteMeeting,
  meetings = [],
  currentUserId = null,
  projectsLoading = false,
  meetingHistoryLoading = false,
  meetingHistoryPresentation,
  meetingProcessingOverlayOpen,
  meetingHistoryError,
  onRetryMeetingHistory,
  onRetryMeetingSummary,
  onOpenMeetingDetail,
  onStartMeeting,
  ongoingMeeting,
  onJoinOngoingMeeting,
  onLoadProject,
  onUpdateProject,
  perspectiveOptions,
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
          currentUserId={currentUserId}
          perspectiveOptions={perspectiveOptions}
          meetingHistoryLoading={meetingHistoryLoading}
          onAddMaterials={onAddMaterials}
          onDeleteMaterial={onDeleteMaterial}
          onRenameMaterial={onRenameMaterial}
          onRenameMeeting={onRenameMeeting}
          onDeleteMeeting={onDeleteMeeting}
          meetings={meetings}
          meetingHistoryPresentation={meetingHistoryPresentation}
          meetingProcessingOverlayOpen={meetingProcessingOverlayOpen}
          meetingHistoryError={meetingHistoryError}
          onRetryMeetingHistory={onRetryMeetingHistory}
          onRetryMeetingSummary={onRetryMeetingSummary}
          onOpenMeetingDetail={onOpenMeetingDetail}
          onStartMeeting={onStartMeeting}
          ongoingMeeting={ongoingMeeting}
          onJoinOngoingMeeting={onJoinOngoingMeeting}
          onDeleteProject={onDeleteProject}
          onLoadProject={onLoadProject}
          onUpdateProject={onUpdateProject}
          project={project}
        />
      ) : projectsLoading ? null : (
        <ProjectEmptyState onCreateProject={onCreateProject} />
      )}
    </section>
  )
}
