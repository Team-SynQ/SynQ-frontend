import { useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { CompletedMeeting, OngoingMeeting } from '../../../entities/meeting'
import {
  PROJECT_REFERENCE_MAX_MATERIALS,
  type ProjectReferenceMaterial,
  type ProjectSummary,
} from '../../../entities/project'
import {
  ProjectMaterialUploadForm,
  type ProjectMaterialDraft,
  type ProjectRolePerspectiveDraft,
} from '../../../features/project-create'
import {
  ProjectReferenceDeleteDialog,
  ProjectReferenceEditDialog,
  ProjectReferenceMenu,
} from '../../../features/project-reference-actions'
import {
  ProjectSettingsMenu,
  type ProjectInformationDraft,
  type ProjectInformationPerspective,
} from '../../../features/project-settings'
import {
  MeetingProcessingOverlay,
  type MeetingHistoryPresentation,
} from '../../../features/meeting-processing'
import burgerIcon from '../../../shared/assets/icons/burger.svg'
import fileIcon from '../assets/file.svg'
import folderIcon from '../assets/folder.svg'
import microphoneIcon from '../assets/microphone.svg'
import plusIcon from '../../../shared/assets/icons/plus.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Badge, Button, OverlayDialog, Toast } from '../../../shared/ui'
import { OngoingMeetingButton } from './OngoingMeetingButton'
import { ProjectLatestMeetingSummary } from './ProjectLatestMeetingSummary'
import { ProjectMeetingHistory } from './ProjectMeetingHistory'

type ProjectCreatedDashboardProps = {
  project: ProjectSummary
  onAddMaterials?: (materials: ProjectMaterialDraft) => Promise<void> | void
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
  onRenameMeeting?: (recordId: string, nextTitle: string) => Promise<void>
  onDeleteMeeting?: (recordId: string) => Promise<void>
  meetings?: CompletedMeeting[]
  /** 회의 기록 수정·삭제 가능 여부의 기준. 그 회의를 진행한 사람만 가능. */
  currentUserId?: number | null
  meetingHistoryLoading?: boolean
  meetingHistoryPresentation?: MeetingHistoryPresentation
  meetingProcessingOverlayOpen?: boolean
  meetingHistoryError?: string
  onRetryMeetingHistory?: () => void
  onRetryMeetingSummary?: (recordId: string) => void
  onOpenMeetingDetail?: (recordId: string) => void
  onStartMeeting?: () => void
  /** 이 프로젝트에서 진행 중인 회의. 있으면 새 회의 시작 불가. */
  ongoingMeeting?: OngoingMeeting | null
  onJoinOngoingMeeting?: () => void
  onLoadProject?: () => Promise<ProjectSummary | void> | ProjectSummary | void
  onUpdateProject?: (draft: ProjectInformationDraft) => Promise<void> | void
  perspectiveOptions?: ProjectInformationPerspective[]
  onAddPerspective?: (draft: ProjectRolePerspectiveDraft) => Promise<ProjectInformationPerspective>
  onRolePerspectiveSaved?: (perspective: ProjectInformationPerspective) => void
  onDeleteProject?: () => Promise<void> | void
  /** 일반 멤버가 프로젝트를 나갔을 때. 목록 갱신은 상위 화면 담당. */
  onLeaveProject?: () => Promise<void> | void
}

const projectDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
})

export function ProjectCreatedDashboard({
  project,
  onAddMaterials,
  onDeleteMaterial,
  onRenameMaterial,
  onRenameMeeting,
  onDeleteMeeting,
  meetings = [],
  currentUserId = null,
  meetingHistoryLoading = false,
  meetingHistoryPresentation,
  meetingProcessingOverlayOpen = false,
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
}: ProjectCreatedDashboardProps) {
  const navigate = useNavigate()

  return (
    <div aria-busy={meetingProcessingOverlayOpen} className="flex w-full flex-col gap-l">
      <header className="flex items-start gap-s">
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <h1 className="m-0 truncate typo-heading text-fg-primary">{project.name}</h1>
          {project.overview ? (
            <p className="m-0 typo-body-01 text-fg-secondary">{project.overview}</p>
          ) : null}
          {project.perspectiveLabel ? (
            <div className="flex flex-wrap items-center gap-xs">
              <span className="typo-body-01 text-fg-secondary">내 관점 :</span>
              <Badge size="extraSmall">{project.perspectiveLabel}</Badge>
              <Badge size="extraSmall">{project.perspectiveDescription}</Badge>
            </div>
          ) : null}
        </div>
        <ProjectSettingsMenu
          onAddPerspective={onAddPerspective}
          onDeleteProject={onDeleteProject}
          onLeaveProject={onLeaveProject}
          onLoadProject={onLoadProject}
          onRolePerspectiveSaved={onRolePerspectiveSaved}
          onUpdateProject={onUpdateProject}
          // 계정 프로필이 아직 없으면 빈 목록 전달. 화면 전용 기본 목록을 섞으면 만든 적 없는 관점이 노출됨.
          perspectiveOptions={perspectiveOptions ?? []}
          project={project}
        />
      </header>

      <section className="flex flex-col gap-s">
        <div className="flex items-center justify-between gap-s">
          <h2 className="m-0 typo-title-02 text-fg-primary">프로젝트 허브</h2>
          {ongoingMeeting ? (
            <OngoingMeetingButton
              activeSeconds={ongoingMeeting.activeSeconds}
              // 서버 값이 바뀌면 다시 마운트해 기준 시각을 새로 설정.
              key={`${ongoingMeeting.meetingId}:${ongoingMeeting.paused}:${ongoingMeeting.activeSeconds}`}
              onJoin={onJoinOngoingMeeting ?? (() => {})}
              paused={ongoingMeeting.paused}
            />
          ) : (
            <Button
              className="w-[178px]"
              leftIcon={
                <span className="flex size-[28px] items-center justify-center">
                  <img
                    alt=""
                    aria-hidden="true"
                    className="size-[28px]"
                    height="28"
                    src={microphoneIcon}
                    width="28"
                  />
                </span>
              }
              onClick={onStartMeeting ?? (() => navigate('/meetings/demo/start'))}
              size="large"
            >
              새 회의 시작
            </Button>
          )}
        </div>

        <div className="grid min-h-[300px] grid-cols-[minmax(0,1fr)_472px] gap-s max-[1200px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ProjectLatestMeetingSummary
            meeting={meetings[0]}
            onOpenMeetingSummary={onOpenMeetingDetail}
          />

          <ProjectReferenceMaterials
            onAddMaterials={onAddMaterials}
            onDeleteMaterial={onDeleteMaterial}
            onRenameMaterial={onRenameMaterial}
            project={project}
          />
        </div>
      </section>

      {meetingHistoryError ? (
        <section className="flex flex-col gap-s">
          <h2 className="m-0 typo-title-02 text-fg-primary">회의 기록</h2>
          <div className="flex h-[200px] flex-col items-center justify-center gap-s">
            <p className="m-0 typo-body-01 text-gray-500" role="alert">
              {meetingHistoryError}
            </p>
            <Button onClick={onRetryMeetingHistory} size="medium" variant="fillGray100">
              다시 불러오기
            </Button>
          </div>
        </section>
      ) : (
        <ProjectMeetingHistory
          currentUserId={currentUserId}
          isLoading={meetingHistoryLoading}
          onRetryMeetingSummary={onRetryMeetingSummary}
          meetings={meetings}
          onDeleteMeeting={onDeleteMeeting}
          onOpenMeetingDetail={onOpenMeetingDetail}
          onRenameMeeting={onRenameMeeting}
          presentation={meetingHistoryPresentation}
        />
      )}
      <MeetingProcessingOverlay open={meetingProcessingOverlayOpen} />
    </div>
  )
}

type ProjectReferenceMaterialsProps = {
  project: ProjectSummary
  onAddMaterials?: (materials: ProjectMaterialDraft) => Promise<void> | void
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
}

function ProjectReferenceMaterials({
  project,
  onAddMaterials,
  onDeleteMaterial,
  onRenameMaterial,
}: ProjectReferenceMaterialsProps) {
  const uploadTitleId = useId()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const materialLimitToast = useTransientVisibility()
  const isMaterialsLoading = project.materials === undefined
  const materials = project.materials ?? []

  const handleAddMaterials = async (nextDraft: ProjectMaterialDraft) => {
    // 기존 자료 수를 모르는 상태에서는 개수 검사가 부정확하고, 뒤늦게 도착한 조회 결과가
    // 방금 추가한 자료를 덮어쓸 수 있음.
    if (isMaterialsLoading) return

    const nextMaterialCount = nextDraft.files.length + nextDraft.links.length
    if (materials.length + nextMaterialCount > PROJECT_REFERENCE_MAX_MATERIALS) {
      materialLimitToast.show()
      return
    }

    await onAddMaterials?.(nextDraft)
    setIsUploadModalOpen(false)
  }

  const handleOpenUploadModal = () => {
    if (isMaterialsLoading) return

    if (materials.length >= PROJECT_REFERENCE_MAX_MATERIALS) {
      materialLimitToast.show()
      return
    }

    setIsUploadModalOpen(true)
  }

  return (
    <>
      <section className="flex min-h-[300px] flex-col gap-s rounded-[16px] bg-surface-muted p-m">
        <div className="flex items-center gap-xs">
          <div className="flex min-w-0 flex-1 items-center gap-xs">
            <img
              alt=""
              aria-hidden="true"
              className="size-[24px]"
              height="24"
              src={folderIcon}
              width="24"
            />
            <h3 className="m-0 typo-body-01 text-fg-primary">AI 참고 자료</h3>
            <span className="typo-body-02 text-fg-secondary">
              {isMaterialsLoading ? '' : materials.length}
            </span>
            <span className="typo-caption text-gray-500">/ {PROJECT_REFERENCE_MAX_MATERIALS}</span>
          </div>
          <Button
            aria-label="AI 참고 자료 추가"
            className="size-[32px] px-0"
            disabled={isMaterialsLoading}
            onClick={handleOpenUploadModal}
            size="small"
            variant="basic"
          >
            <img
              alt=""
              aria-hidden="true"
              className="size-[24px]"
              height="24"
              src={plusIcon}
              width="24"
            />
          </Button>
        </div>

        {materials.length > 0 ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {materials.map((material) => (
              <ProjectReferenceMaterialItem
                key={material.id}
                material={material}
                onDeleteMaterial={onDeleteMaterial}
                onRenameMaterial={onRenameMaterial}
              />
            ))}
          </ul>
        ) : isMaterialsLoading ? (
          <div aria-busy="true" aria-label="AI 참고 자료 불러오는 중" className="m-auto" />
        ) : (
          <p className="m-auto typo-body-02 text-gray-500">등록된 AI 참고 자료가 없습니다</p>
        )}
      </section>
      {materialLimitToast.isMounted ? (
        <Toast
          className="top-[20px]! z-[70]!"
          description={`참고자료는 프로젝트당 최대 ${PROJECT_REFERENCE_MAX_MATERIALS}개까지 등록할 수 있어요.`}
          position="topCenter"
          title="참고자료 최대 개수 초과"
          type="error"
          visible={materialLimitToast.isVisible}
        />
      ) : null}
      <OverlayDialog
        className="relative h-[680px] max-h-[calc(100dvh-48px)] max-w-[460px]! gap-m px-m py-l shadow-floating"
        closeOnEscape
        onClose={() => setIsUploadModalOpen(false)}
        open={isUploadModalOpen}
        titleId={uploadTitleId}
      >
        {isUploadModalOpen ? (
          <ProjectMaterialUploadForm
            mode="project-reference"
            onClose={() => setIsUploadModalOpen(false)}
            onCreate={handleAddMaterials}
            titleId={uploadTitleId}
          />
        ) : null}
      </OverlayDialog>
    </>
  )
}

type ProjectReferenceMaterialItemProps = {
  material: ProjectReferenceMaterial
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
}

function ProjectReferenceMaterialItem({
  material,
  onDeleteMaterial,
  onRenameMaterial,
}: ProjectReferenceMaterialItemProps) {
  const [activeDialog, setActiveDialog] = useState<'edit' | 'delete'>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = `project-reference-menu-${material.id}`

  const runReferenceAction = async (action: () => Promise<void> | void) => {
    setIsSubmitting(true)
    try {
      await action()
    } catch {
      // 변경 결과 피드백은 콜백 소유자(상위 화면) 담당.
    } finally {
      setIsSubmitting(false)
      setActiveDialog(undefined)
    }
  }

  return (
    <>
      <li className="flex h-[42px] items-center gap-xs border-b border-line-default last:border-b-0">
        <img
          alt=""
          aria-hidden="true"
          className="size-[24px]"
          height="24"
          src={fileIcon}
          width="24"
        />
        <span className="min-w-0 flex-1 truncate typo-body-02 text-fg-primary">
          {material.name}
        </span>
        <time
          className="shrink-0 whitespace-nowrap typo-body-02 text-fg-secondary"
          dateTime={material.createdAt}
        >
          {projectDateFormatter.format(new Date(material.createdAt))}
        </time>
        <div className="relative shrink-0">
          <Button
            aria-controls={menuId}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label={`${material.name} 더보기`}
            className="size-[32px] px-0"
            leftIcon={
              <span className="flex size-[24px] items-center justify-center">
                <img
                  alt=""
                  aria-hidden="true"
                  className="size-[24px]"
                  height="24"
                  src={burgerIcon}
                  width="24"
                />
              </span>
            }
            onClick={() => setIsMenuOpen((current) => !current)}
            ref={triggerRef}
            size="small"
            variant="basic"
          />
          <ProjectReferenceMenu
            id={menuId}
            materialName={material.name}
            onClose={() => setIsMenuOpen(false)}
            onDelete={() => setActiveDialog('delete')}
            onEditTitle={() => setActiveDialog('edit')}
            open={isMenuOpen}
            triggerRef={triggerRef}
          />
        </div>
      </li>
      <ProjectReferenceEditDialog
        currentName={material.name}
        onCancel={() => setActiveDialog(undefined)}
        onConfirm={(nextName) => {
          void runReferenceAction(() => onRenameMaterial?.(material.id, nextName))
        }}
        open={activeDialog === 'edit'}
        pending={isSubmitting}
      />
      <ProjectReferenceDeleteDialog
        materialName={material.name}
        onCancel={() => setActiveDialog(undefined)}
        onConfirm={() => {
          void runReferenceAction(() => onDeleteMaterial?.(material.id))
        }}
        open={activeDialog === 'delete'}
        pending={isSubmitting}
      />
    </>
  )
}
