import type { CompletedMeeting, OngoingMeeting } from '../../../entities/meeting'
import type { ProjectSummary } from '../../../entities/project'
import type {
  ProjectMaterialDraft,
  ProjectRolePerspectiveDraft,
} from '../../../features/project-create'
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
  /** 회의 기록 수정·삭제 가능 여부의 기준. 그 회의를 진행한 사람만 가능. */
  currentUserId?: number | null
  /** 프로젝트 목록 로딩 중이면 빈 상태 대신 아무것도 그리지 않음. */
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
  onAddPerspective?: (draft: ProjectRolePerspectiveDraft) => Promise<ProjectInformationPerspective>
  /** 설정 메뉴에서 이 프로젝트의 역할·관점을 저장했을 때. 표시 값 갱신은 상위 화면 담당. */
  onRolePerspectiveSaved?: (perspective: ProjectInformationPerspective) => void
  onDeleteProject?: () => Promise<void> | void
  /** 일반 멤버가 프로젝트를 나갔을 때. 목록 갱신은 상위 화면 담당. */
  onLeaveProject?: () => Promise<void> | void
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
  onAddPerspective,
  onRolePerspectiveSaved,
  onDeleteProject,
  onLeaveProject,
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
          onAddPerspective={onAddPerspective}
          onRolePerspectiveSaved={onRolePerspectiveSaved}
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
          onLeaveProject={onLeaveProject}
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
