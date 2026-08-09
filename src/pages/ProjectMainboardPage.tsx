import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  meetingLifecycleApi,
  meetingRecordGateway,
  type CompletedMeeting,
  type MeetingLifecycleApi,
} from '../entities/meeting'
import {
  MeetingEntryModal,
  requestMeetingMicrophonePermission,
  type MeetingEntryModalVariant,
  type MeetingMicrophonePermissionResult,
} from '../features/meeting-entry'
import {
  listProjectSummaries,
  PROJECT_REFERENCE_MAX_MATERIALS,
  type ProjectReferenceMaterial,
  type ProjectSummary,
} from '../entities/project'
import {
  createProjectWithMaterials,
  getProjectCreationSuccessMessage,
  ProjectCreateModal,
  type ProjectCreateDraft,
  type ProjectMaterialDraft,
} from '../features/project-create'
import {
  useMeetingProcessingFlow,
  type MeetingHistoryPresentation,
  type ProjectNavigationState,
} from '../features/meeting-processing'
import type { ProjectInformationDraft } from '../features/project-settings'
import { useTransientVisibility } from '../shared/lib/useTransientVisibility'
import { Toast } from '../shared/ui'
import type { ToastType } from '../shared/ui'
import { ProjectMainboard } from '../widgets/project-mainboard'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'

type ProjectMainboardPageProps = {
  user?: ProjectSidebarUser
  onCreateProject?: () => void
  onAddProject?: () => void
  onToggleSidebar?: () => void
  loadProjects?: () => Promise<ProjectSummary[]>
  onSubmitProject?: (
    draft: ProjectCreateDraft,
    materials: ProjectMaterialDraft,
  ) => Promise<ProjectSummary | void> | ProjectSummary | void
  addProjectReferences?: (
    projectId: string,
    materials: ProjectMaterialDraft,
  ) => Promise<ProjectReferenceMaterial[] | void> | ProjectReferenceMaterial[] | void
  deleteProjectReference?: (projectId: string, materialId: string) => Promise<void> | void
  renameProjectReference?: (
    projectId: string,
    materialId: string,
    nextName: string,
  ) => Promise<void> | void
  loadCompletedMeetings?: (projectId: string) => Promise<CompletedMeeting[]>
  updateCompletedMeetingTitle?: (recordId: string, title: string) => Promise<CompletedMeeting>
  deleteCompletedMeeting?: (recordId: string) => Promise<void>
  loadProjectInformation?: (
    projectId: string,
  ) => Promise<ProjectSummary | void> | ProjectSummary | void
  updateProject?: (
    projectId: string,
    draft: ProjectInformationDraft,
  ) => Promise<ProjectSummary | void> | ProjectSummary | void
  deleteProject?: (projectId: string) => Promise<void> | void
  createMeeting?: MeetingLifecycleApi['createMeeting']
  requestMicrophonePermission?: () => Promise<MeetingMicrophonePermissionResult>
}

type ProjectReferenceFeedback = {
  description: string
  title: string
  type: ToastType
}

let nextClientReferenceId = 0

const loadCompletedMeetingHistory = (projectId: string) =>
  meetingRecordGateway.listCompletedMeetings(projectId)
const updateCompletedMeetingHistoryTitle = (recordId: string, title: string) =>
  meetingRecordGateway.updateCompletedMeetingTitle(recordId, title)
const deleteCompletedMeetingHistory = (recordId: string) =>
  meetingRecordGateway.deleteCompletedMeeting(recordId)

function createClientProjectReferences(
  materials: ProjectMaterialDraft,
): ProjectReferenceMaterial[] {
  const createdAt = new Date().toISOString()
  const createId = () => {
    nextClientReferenceId += 1
    return `client-reference-${nextClientReferenceId}`
  }

  return [
    ...materials.files.map((file) => ({
      id: createId(),
      kind: 'file' as const,
      name: file.name,
      createdAt,
    })),
    ...materials.links.map((link) => ({
      id: createId(),
      kind: 'link' as const,
      name: link,
      createdAt,
    })),
  ]
}

export function ProjectMainboardPage({
  user,
  onCreateProject,
  onAddProject,
  onToggleSidebar,
  loadProjects = listProjectSummaries,
  onSubmitProject,
  addProjectReferences,
  deleteProjectReference,
  renameProjectReference,
  loadCompletedMeetings = loadCompletedMeetingHistory,
  updateCompletedMeetingTitle = updateCompletedMeetingHistoryTitle,
  deleteCompletedMeeting = deleteCompletedMeetingHistory,
  loadProjectInformation,
  updateProject,
  deleteProject,
  createMeeting = meetingLifecycleApi.createMeeting,
  requestMicrophonePermission = requestMeetingMicrophonePermission,
}: ProjectMainboardPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationState = location.state as ProjectNavigationState | null
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    () => navigationState?.openCreateProject === true,
  )
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string>()
  const [completedMeetingsByProject, setCompletedMeetingsByProject] = useState<
    Record<string, CompletedMeeting[]>
  >({})
  const [meetingHistoryErrorProjectId, setMeetingHistoryErrorProjectId] = useState<string>()
  const [meetingHistoryReloadKey, setMeetingHistoryReloadKey] = useState(0)
  const [latestCreatedProjectName, setLatestCreatedProjectName] = useState<string>()
  const [meetingEntryVariant, setMeetingEntryVariant] = useState<MeetingEntryModalVariant | null>(
    null,
  )
  const meetingStartPendingRef = useRef(false)
  const [projectReferenceFeedback, setProjectReferenceFeedback] =
    useState<ProjectReferenceFeedback>()
  const creationSuccessToast = useTransientVisibility()
  const projectReferenceFeedbackToast = useTransientVisibility()
  const requestedActiveProjectId = navigationState?.activeProjectId
  const requestedOpenCreateProject = navigationState?.openCreateProject
  const [requestedProcessingRecordId] = useState(() => navigationState?.processingMeetingRecordId)
  const {
    dismissCompletion,
    phase: meetingProcessingPhase,
    processingRecordId,
    settle: settleMeetingProcessing,
  } = useMeetingProcessingFlow({
    recordId: requestedProcessingRecordId,
  })
  const {
    isMounted: isProjectLoadErrorMounted,
    isVisible: isProjectLoadErrorVisible,
    show: showProjectLoadError,
  } = useTransientVisibility()

  useEffect(() => {
    if (!requestedOpenCreateProject && !requestedProcessingRecordId) return

    navigate(location.pathname, {
      replace: true,
      state: {
        activeProjectId: requestedActiveProjectId,
      } satisfies ProjectNavigationState,
    })
  }, [
    location.pathname,
    navigate,
    requestedActiveProjectId,
    requestedOpenCreateProject,
    requestedProcessingRecordId,
  ])

  useEffect(() => {
    let isSubscribed = true

    void loadProjects()
      .then((initialProjects) => {
        if (!isSubscribed) return

        setProjects((currentProjects) => [
          ...currentProjects,
          ...initialProjects.filter(
            (initialProject) =>
              !currentProjects.some((project) => project.id === initialProject.id),
          ),
        ])
        setActiveProjectId(
          (currentProjectId) =>
            currentProjectId ??
            initialProjects.find((project) => project.id === requestedActiveProjectId)?.id ??
            initialProjects[0]?.id,
        )
      })
      .catch(() => {
        if (!isSubscribed) return
        showProjectLoadError()
        settleMeetingProcessing()
      })

    return () => {
      isSubscribed = false
    }
  }, [loadProjects, requestedActiveProjectId, settleMeetingProcessing, showProjectLoadError])

  useEffect(() => {
    if (!activeProjectId || activeProjectId in completedMeetingsByProject) return

    let isSubscribed = true
    void loadCompletedMeetings(activeProjectId)
      .then((meetings) => {
        if (!isSubscribed) return
        setCompletedMeetingsByProject((current) => ({
          ...current,
          [activeProjectId]: meetings,
        }))
        if (
          processingRecordId &&
          !meetings.some((meeting) => meeting.recordId === processingRecordId)
        ) {
          settleMeetingProcessing()
        }
        setMeetingHistoryErrorProjectId((current) =>
          current === activeProjectId ? undefined : current,
        )
      })
      .catch(() => {
        if (!isSubscribed) return
        setMeetingHistoryErrorProjectId(activeProjectId)
        settleMeetingProcessing()
      })

    return () => {
      isSubscribed = false
    }
  }, [
    activeProjectId,
    completedMeetingsByProject,
    loadCompletedMeetings,
    meetingHistoryReloadKey,
    processingRecordId,
    settleMeetingProcessing,
  ])

  const handleCreateProject = () => {
    setIsCreateModalOpen(true)
    onCreateProject?.()
  }

  const handleAddProject = () => {
    setIsCreateModalOpen(true)
    onAddProject?.()
  }

  const createMeetingAndNavigate = async () => {
    if (!activeProject) return
    const projectId = activeProject.apiProjectId
    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      setMeetingEntryVariant('meetingStartFailed')
      return
    }

    try {
      const created = await createMeeting(projectId, { consentAgreed: true })
      setMeetingEntryVariant(null)
      navigate(`/meetings/${created.meetingId}/tutorial`, {
        state: {
          projectId: activeProject.id,
          projectTitle: activeProject.name,
        },
      })
    } catch {
      setMeetingEntryVariant('meetingStartFailed')
    }
  }

  const handleMeetingEntryPrimaryAction = async () => {
    if (meetingEntryVariant === 'startConfirmation') {
      setMeetingEntryVariant('microphonePermissionRequired')
      return
    }

    if (meetingStartPendingRef.current) return

    if (meetingEntryVariant === 'microphonePermissionRequired') {
      meetingStartPendingRef.current = true
      try {
        const permissionResult = await requestMicrophonePermission()
        if (permissionResult === 'unsupported') {
          setMeetingEntryVariant('recordingUnsupported')
          return
        }
        if (permissionResult === 'denied') {
          setMeetingEntryVariant('microphonePermissionFailed')
          return
        }
        await createMeetingAndNavigate()
      } finally {
        meetingStartPendingRef.current = false
      }
      return
    }

    if (meetingEntryVariant === 'meetingStartFailed') {
      meetingStartPendingRef.current = true
      try {
        await createMeetingAndNavigate()
      } finally {
        meetingStartPendingRef.current = false
      }
      return
    }

    setMeetingEntryVariant(null)
  }

  const handleProjectCreated = async (
    draft: ProjectCreateDraft,
    materials: ProjectMaterialDraft,
  ) => {
    const submittedProject = await onSubmitProject?.(draft, materials)
    const nextProject = submittedProject ?? (await createProjectWithMaterials(draft, materials))

    setProjects((currentProjects) => [
      nextProject,
      ...currentProjects.filter((project) => project.id !== nextProject.id),
    ])
    setActiveProjectId(nextProject.id)
    setLatestCreatedProjectName(nextProject.name)
    setIsCreateModalOpen(false)
    creationSuccessToast.show()
  }

  const showProjectReferenceFeedback = (feedback: ProjectReferenceFeedback) => {
    setProjectReferenceFeedback(feedback)
    projectReferenceFeedbackToast.show()
  }

  const handleAddMaterials = async (materials: ProjectMaterialDraft) => {
    if (!activeProjectId) return

    const submittedMaterials = await addProjectReferences?.(activeProjectId, materials)
    const nextMaterials = submittedMaterials ?? createClientProjectReferences(materials)
    if (nextMaterials.length === 0) return

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              materials: [...project.materials, ...nextMaterials].slice(
                0,
                PROJECT_REFERENCE_MAX_MATERIALS,
              ),
            }
          : project,
      ),
    )
    showProjectReferenceFeedback({
      description: 'AI 참고 자료가 추가되었습니다.',
      title: '자료 추가 완료',
      type: 'success',
    })
  }

  const handleRenameMaterial = async (materialId: string, nextName: string) => {
    if (!activeProjectId) return

    try {
      await renameProjectReference?.(activeProjectId, materialId, nextName)
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === activeProjectId
            ? {
                ...project,
                materials: project.materials.map((material) =>
                  material.id === materialId ? { ...material, name: nextName } : material,
                ),
              }
            : project,
        ),
      )
      showProjectReferenceFeedback({
        description: '자료 제목이 수정되었습니다.',
        title: '자료 제목 수정 완료',
        type: 'success',
      })
    } catch {
      showProjectReferenceFeedback({
        description: '자료 제목을 수정하지 못했습니다. 다시 시도해 주세요.',
        title: '자료 제목 수정 실패',
        type: 'error',
      })
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!activeProjectId) return

    const material = projects
      .find((project) => project.id === activeProjectId)
      ?.materials.find((projectMaterial) => projectMaterial.id === materialId)
    if (!material) return

    try {
      await deleteProjectReference?.(activeProjectId, materialId)
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === activeProjectId
            ? {
                ...project,
                materials: project.materials.filter(
                  (projectMaterial) => projectMaterial.id !== materialId,
                ),
              }
            : project,
        ),
      )
      showProjectReferenceFeedback({
        description: `“${material.name}” 자료가 삭제되었습니다.`,
        title: '자료 삭제 완료',
        type: 'success',
      })
    } catch {
      showProjectReferenceFeedback({
        description: '참고자료를 삭제하지 못했습니다. 다시 시도해 주세요.',
        title: '자료 삭제 실패',
        type: 'error',
      })
    }
  }

  const handleLoadProjectInformation = async () => {
    if (!activeProjectId) return
    return (
      (await loadProjectInformation?.(activeProjectId)) ??
      projects.find((project) => project.id === activeProjectId)
    )
  }

  const handleUpdateProject = async (draft: ProjectInformationDraft) => {
    if (!activeProjectId) return

    const submittedProject = await updateProject?.(activeProjectId, draft)
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === activeProjectId ? (submittedProject ?? { ...project, ...draft }) : project,
      ),
    )
  }

  const handleDeleteProject = async () => {
    if (!activeProjectId) return
    const deletedProject = projects.find((project) => project.id === activeProjectId)
    if (!deletedProject) return

    try {
      await deleteProject?.(activeProjectId)
      const nextProjects = projects.filter((project) => project.id !== activeProjectId)
      setProjects(nextProjects)
      setActiveProjectId((currentId) =>
        currentId === activeProjectId ? nextProjects[0]?.id : currentId,
      )
      showProjectReferenceFeedback({
        title: '프로젝트 삭제 성공',
        description: `‘${deletedProject.name}’ 프로젝트를 삭제했습니다.`,
        type: 'success',
      })
    } catch (error) {
      showProjectReferenceFeedback({
        title: '프로젝트 삭제 실패',
        description: '프로젝트를 삭제하지 못했습니다. 다시 시도해 주세요.',
        type: 'error',
      })
      throw error
    }
  }

  const handleRenameMeeting = async (recordId: string, nextTitle: string) => {
    if (!activeProjectId) return

    const updatedMeeting = await updateCompletedMeetingTitle(recordId, nextTitle)
    setCompletedMeetingsByProject((current) => ({
      ...current,
      [activeProjectId]: (current[activeProjectId] ?? []).map((meeting) =>
        meeting.recordId === recordId ? updatedMeeting : meeting,
      ),
    }))
  }

  const handleDeleteMeeting = async (recordId: string) => {
    if (!activeProjectId) return

    await deleteCompletedMeeting(recordId)
    setCompletedMeetingsByProject((current) => ({
      ...current,
      [activeProjectId]: (current[activeProjectId] ?? []).filter(
        (meeting) => meeting.recordId !== recordId,
      ),
    }))
  }

  const activeProject = projects.find((project) => project.id === activeProjectId)
  const activeProjectMeetings = activeProjectId
    ? (completedMeetingsByProject[activeProjectId] ?? [])
    : []
  const visibleMeetings =
    meetingProcessingPhase === 'summaryProcessing'
      ? activeProjectMeetings.filter((meeting) => meeting.recordId !== processingRecordId)
      : activeProjectMeetings
  const meetingHistoryPresentation: MeetingHistoryPresentation | undefined =
    processingRecordId &&
    (meetingProcessingPhase === 'historyProcessing' ||
      meetingProcessingPhase === 'completionVisible')
      ? {
          recordId: processingRecordId,
          status: meetingProcessingPhase === 'historyProcessing' ? 'processing' : 'completed',
        }
      : undefined
  const successMessage = latestCreatedProjectName
    ? getProjectCreationSuccessMessage(latestCreatedProjectName)
    : null

  return (
    <main
      className="flex min-h-screen w-full bg-surface-default"
      onPointerDownCapture={dismissCompletion}
    >
      <ProjectSidebar
        accountSettingsActions={{
          onOpenAccountInfo: () => navigate('/settings/account'),
          onOpenHelp: () => navigate('/settings/help'),
          onOpenTerms: () => navigate('/settings/policy'),
        }}
        activeProjectId={activeProjectId}
        onAddProject={handleAddProject}
        onSelectProject={setActiveProjectId}
        onToggleSidebar={onToggleSidebar}
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
        }))}
        user={user}
      />
      <ProjectMainboard
        meetingHistoryPresentation={meetingHistoryPresentation}
        meetingProcessingOverlayOpen={meetingProcessingPhase === 'summaryProcessing'}
        meetingHistoryError={
          activeProjectId === meetingHistoryErrorProjectId
            ? '회의 기록을 불러오지 못했습니다.'
            : undefined
        }
        meetings={visibleMeetings}
        onAddMaterials={handleAddMaterials}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onDeleteMeeting={handleDeleteMeeting}
        onLoadProject={handleLoadProjectInformation}
        onDeleteMaterial={handleDeleteMaterial}
        onRenameMaterial={handleRenameMaterial}
        onRenameMeeting={handleRenameMeeting}
        onOpenMeetingDetail={(recordId) =>
          navigate(`/meetings/${encodeURIComponent(recordId)}/detail`)
        }
        onRetryMeetingHistory={() => {
          setMeetingHistoryErrorProjectId(undefined)
          setMeetingHistoryReloadKey((current) => current + 1)
        }}
        onStartMeeting={() => {
          if (!activeProject) return
          meetingStartPendingRef.current = false
          setMeetingEntryVariant('startConfirmation')
        }}
        onUpdateProject={handleUpdateProject}
        project={activeProject}
      />
      <ProjectCreateModal
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleProjectCreated}
        open={isCreateModalOpen}
      />
      {meetingEntryVariant ? (
        <MeetingEntryModal
          onPrimaryAction={() => void handleMeetingEntryPrimaryAction()}
          onSecondaryAction={() => setMeetingEntryVariant(null)}
          variant={meetingEntryVariant}
        />
      ) : null}
      {isProjectLoadErrorMounted ? (
        <Toast
          description="잠시 후 다시 시도해 주세요."
          position="topCenter"
          title="프로젝트 목록을 불러오지 못했습니다."
          type="error"
          visible={isProjectLoadErrorVisible}
        />
      ) : null}
      {successMessage && creationSuccessToast.isMounted ? (
        <Toast
          className="top-[20px]!"
          description={successMessage.description}
          position="topCenter"
          title={successMessage.title}
          type="success"
          visible={creationSuccessToast.isVisible}
        />
      ) : null}
      {projectReferenceFeedback && projectReferenceFeedbackToast.isMounted ? (
        <Toast
          className="top-[20px]!"
          description={projectReferenceFeedback.description}
          position="topCenter"
          title={projectReferenceFeedback.title}
          type={projectReferenceFeedback.type}
          visible={projectReferenceFeedbackToast.isVisible}
        />
      ) : null}
    </main>
  )
}
