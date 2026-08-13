import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  meetingLifecycleApi,
  meetingRecordGateway,
  type CompletedMeeting,
  type MeetingLifecycleApi,
  type OngoingMeeting,
} from '../entities/meeting'
import {
  MeetingEntryModal,
  requestMeetingMicrophonePermission,
  type MeetingEntryModalVariant,
  type MeetingMicrophonePermissionResult,
} from '../features/meeting-entry'
import {
  listProjectSummaries,
  loadProjectReferenceMaterials,
  PROJECT_REFERENCE_MAX_MATERIALS,
  projectApi,
  registerProjectReferenceMaterials,
  type ProjectReferenceMaterial,
  type ProjectSummary,
} from '../entities/project'
import { changeDefaultRoleProfile, loadMyRoleProfiles, type RoleProfile } from '../entities/user'
import {
  createProjectWithMaterials,
  createRoleProfileOption,
  getProjectCreationSuccessMessage,
  ProjectCreateModal,
  toProjectPerspectiveOption,
  type ProjectCreateDraft,
  type ProjectMaterialDraft,
  type ProjectPerspectiveOption,
  type ProjectRolePerspectiveDraft,
} from '../features/project-create'
import {
  useMeetingProcessingFlow,
  type MeetingHistoryPresentation,
  type ProjectNavigationState,
} from '../features/meeting-processing'
import {
  JoinRequestResultDialog,
  loadMyJoinRequestResults,
  markJoinRequestResultSeen,
  readSeenJoinRequestResults,
} from '../features/project-invite'
import type { ProjectInformationDraft } from '../features/project-settings'
import type { ProjectJoinRequestResultResponse as ProjectJoinRequestResult } from '../shared/api/contracts/project.contracts'
import { useTransientVisibility } from '../shared/lib/useTransientVisibility'
import { Toast } from '../shared/ui'
import type { ToastType } from '../shared/ui'
import { ProjectMainboard } from '../widgets/project-mainboard'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'

type ProjectMainboardPageProps = {
  /** 회의 기록의 수정·삭제 권한을 가리려면 내 userId가 필요합니다. */
  user?: ProjectSidebarUser & { userId?: number }
  onCreateProject?: () => void
  onAddProject?: () => void
  onToggleSidebar?: () => void
  loadProjects?: () => Promise<ProjectSummary[]>
  loadProjectReferences?: (apiProjectId: number) => Promise<ProjectReferenceMaterial[]>
  loadRoleProfiles?: () => Promise<RoleProfile[]>
  addRoleProfile?: (draft: ProjectRolePerspectiveDraft) => Promise<ProjectPerspectiveOption>
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
  loadOngoingMeeting?: (projectId: string) => Promise<OngoingMeeting | null>
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

const addProjectReferenceMaterials = async (projectId: string, materials: ProjectMaterialDraft) => {
  console.log('[projectReference] 참고자료 추가 시작', {
    projectId,
    fileCount: materials.files.length,
    linkCount: materials.links.length,
  })

  try {
    const registered = await registerProjectReferenceMaterials(
      Number(projectId),
      materials.files,
      materials.links,
    )
    console.log('[projectReference] 참고자료 추가 성공', {
      projectId,
      referenceCount: registered.length,
    })
    return registered
  } catch (error) {
    console.error('[projectReference] 참고자료 추가 실패', { projectId, error })
    throw error
  }
}

const deleteProjectReferenceMaterial = async (projectId: string, materialId: string) => {
  const referenceId = Number(materialId)

  // 서버에 등록되지 않은 화면 전용 항목은 삭제할 대상이 없습니다.
  if (!Number.isInteger(referenceId)) return

  console.log('[projectReference] 참고자료 삭제 시작', { projectId, referenceId })
  try {
    await projectApi.deleteProjectReference(Number(projectId), referenceId)
    console.log('[projectReference] 참고자료 삭제 성공', { projectId, referenceId })
  } catch (error) {
    console.error('[projectReference] 참고자료 삭제 실패', { projectId, referenceId, error })
    throw error
  }
}

const renameProjectReferenceMaterial = async (
  projectId: string,
  materialId: string,
  nextName: string,
) => {
  const referenceId = Number(materialId)

  // 서버에 등록되지 않은 화면 전용 항목은 서버에 수정 요청할 대상이 없습니다.
  if (!Number.isInteger(referenceId)) return

  console.log('[projectReference] 참고자료 제목 수정 시작', { projectId, referenceId })
  try {
    await projectApi.updateProjectReferenceName(Number(projectId), referenceId, { name: nextName })
    console.log('[projectReference] 참고자료 제목 수정 성공', { projectId, referenceId })
  } catch (error) {
    console.error('[projectReference] 참고자료 제목 수정 실패', { projectId, referenceId, error })
    throw error
  }
}

const updateProjectInformation = async (projectId: string, draft: ProjectInformationDraft) => {
  console.log('[project] 프로젝트 정보 수정 시작', { projectId })

  try {
    await projectApi.updateProject(Number(projectId), {
      title: draft.name,
      description: draft.overview,
    })
    console.log('[project] 프로젝트 정보 수정 성공', { projectId })
  } catch (error) {
    console.error('[project] 프로젝트 정보 수정 실패', { projectId, error })
    throw error
  }
}

const deleteProjectById = async (projectId: string) => {
  console.log('[project] 프로젝트 삭제 시작', { projectId })

  try {
    await projectApi.deleteProject(Number(projectId))
    console.log('[project] 프로젝트 삭제 성공', { projectId })
  } catch (error) {
    console.error('[project] 프로젝트 삭제 실패', { projectId, error })
    throw error
  }
}

const loadCompletedMeetingHistory = (projectId: string) =>
  meetingRecordGateway.listCompletedMeetings(projectId)
const loadOngoingProjectMeeting = (projectId: string) =>
  meetingRecordGateway.findOngoingMeeting(projectId)

/** 남이 연 회의가 언제 끝날지 알 수 없어 주기적으로 확인한다. 회의 목록 조회 하나라 부담이 작다. */
const ONGOING_MEETING_POLL_INTERVAL_MS = 15_000
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
  loadProjectReferences = loadProjectReferenceMaterials,
  loadRoleProfiles = loadMyRoleProfiles,
  addRoleProfile = createRoleProfileOption,
  onSubmitProject,
  addProjectReferences = addProjectReferenceMaterials,
  deleteProjectReference = deleteProjectReferenceMaterial,
  renameProjectReference = renameProjectReferenceMaterial,
  loadCompletedMeetings = loadCompletedMeetingHistory,
  loadOngoingMeeting = loadOngoingProjectMeeting,
  updateCompletedMeetingTitle = updateCompletedMeetingHistoryTitle,
  deleteCompletedMeeting = deleteCompletedMeetingHistory,
  loadProjectInformation,
  updateProject = updateProjectInformation,
  deleteProject = deleteProjectById,
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
  const [isProjectsLoading, setIsProjectsLoading] = useState(true)
  const [roleProfiles, setRoleProfiles] = useState<RoleProfile[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string>()
  const requestedReferenceProjectIdsRef = useRef<Set<string>>(new Set())
  const [completedMeetingsByProject, setCompletedMeetingsByProject] = useState<
    Record<string, CompletedMeeting[]>
  >({})
  const [meetingHistoryErrorProjectId, setMeetingHistoryErrorProjectId] = useState<string>()
  const [meetingHistoryReloadKey, setMeetingHistoryReloadKey] = useState(0)
  const [ongoingMeetingByProject, setOngoingMeetingByProject] = useState<
    Record<string, OngoingMeeting | null>
  >({})
  /** 폴링 결과가 달라졌는지 판단하는 기준값. state를 읽으면 갱신 함수 밖에서 비교할 수 없다. */
  const ongoingMeetingIdRef = useRef<Record<string, string | null>>({})
  const [latestCreatedProjectName, setLatestCreatedProjectName] = useState<string>()
  /** 아직 안 보여 준 참여 요청 결과. 여러 건이면 앞에서부터 하나씩 안내한다. */
  const [pendingJoinResults, setPendingJoinResults] = useState<ProjectJoinRequestResult[]>([])
  const [meetingEntryVariant, setMeetingEntryVariant] = useState<MeetingEntryModalVariant | null>(
    null,
  )
  const meetingStartPendingRef = useRef(false)
  const [projectReferenceFeedback, setProjectReferenceFeedback] =
    useState<ProjectReferenceFeedback>()
  const creationSuccessToast = useTransientVisibility()
  const projectReferenceFeedbackToast = useTransientVisibility()
  const roleProfileSavedToast = useTransientVisibility()
  const joinRequestSentToast = useTransientVisibility()
  const showProjectReferenceFeedbackToast = projectReferenceFeedbackToast.show
  const showProjectReferenceFeedback = useCallback(
    (feedback: ProjectReferenceFeedback) => {
      setProjectReferenceFeedback(feedback)
      showProjectReferenceFeedbackToast()
    },
    [showProjectReferenceFeedbackToast],
  )
  const requestedActiveProjectId = navigationState?.activeProjectId
  const requestedOpenCreateProject = navigationState?.openCreateProject
  const [requestedProcessingRecordId] = useState(() => navigationState?.processingMeetingRecordId)
  const requestedRoleProfileSaved = navigationState?.roleProfileSaved === true
  const showRoleProfileSavedToast = roleProfileSavedToast.show
  useEffect(() => {
    if (requestedRoleProfileSaved) showRoleProfileSavedToast()
  }, [requestedRoleProfileSaved, showRoleProfileSavedToast])
  const requestedJoinRequestSent = navigationState?.joinRequestSent === true
  const showJoinRequestSentToast = joinRequestSentToast.show
  useEffect(() => {
    if (requestedJoinRequestSent) showJoinRequestSentToast()
  }, [requestedJoinRequestSent, showJoinRequestSentToast])
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

    void loadRoleProfiles()
      .then((profiles) => {
        if (!isSubscribed) return
        setRoleProfiles(profiles)
      })
      .catch(() => {
        // 관점은 보조 정보라 실패해도 화면 진입을 막지 않습니다.
      })

    return () => {
      isSubscribed = false
    }
  }, [loadRoleProfiles])

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
      .finally(() => {
        if (!isSubscribed) return
        setIsProjectsLoading(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [loadProjects, requestedActiveProjectId, settleMeetingProcessing, showProjectLoadError])

  useEffect(() => {
    if (!activeProjectId) return

    const activeProject = projects.find((project) => project.id === activeProjectId)
    if (!activeProject || activeProject.materials) return
    if (requestedReferenceProjectIdsRef.current.has(activeProjectId)) return

    requestedReferenceProjectIdsRef.current.add(activeProjectId)

    let isSubscribed = true
    void loadProjectReferences(activeProject.apiProjectId)
      .then((materials) => {
        if (!isSubscribed) return
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === activeProjectId ? { ...project, materials } : project,
          ),
        )
      })
      .catch(() => {
        if (!isSubscribed) return
        showProjectReferenceFeedback({
          description: 'AI 참고 자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
          title: '자료 불러오기 실패',
          type: 'error',
        })
      })

    return () => {
      isSubscribed = false
    }
  }, [activeProjectId, loadProjectReferences, projects, showProjectReferenceFeedback])

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

  /**
   * 진행 중 회의는 다른 사람이 열고 닫는다. 회의가 끝난 뒤에도 「회의 중」이 남지 않도록 주기적으로 다시 본다.
   * 프로젝트별로 담아 두면 프로젝트를 바꿨을 때 이전 프로젝트의 회의가 잠깐 보이는 일이 없다.
   */
  useEffect(() => {
    if (!activeProjectId) return

    let isSubscribed = true
    // 응답이 주기보다 오래 걸리면 요청이 겹친다. 늦게 온 옛 응답이 끝난 회의를 되살리지 않게 순번을 센다.
    let latestRequestSequence = 0

    const refreshOngoingMeeting = () => {
      const requestSequence = ++latestRequestSequence

      void loadOngoingMeeting(activeProjectId)
        .then((meeting) => {
          if (!isSubscribed || requestSequence !== latestRequestSequence) return

          const previousMeetingId = ongoingMeetingIdRef.current[activeProjectId] ?? null
          const nextMeetingId = meeting?.meetingId ?? null
          // 대부분의 주기는 결과가 같다. 그대로 담으면 15초마다 화면 전체가 다시 그려진다.
          if (previousMeetingId === nextMeetingId) return

          ongoingMeetingIdRef.current[activeProjectId] = nextMeetingId
          setOngoingMeetingByProject((current) => ({ ...current, [activeProjectId]: meeting }))

          // 진행 중이던 회의가 끝났다. 회의 기록은 최초 조회 결과를 캐시하므로,
          // 비워 주지 않으면 방금 끝난 회의가 목록에 나타나지 않는다.
          if (!previousMeetingId) return
          setCompletedMeetingsByProject((current) => {
            if (!(activeProjectId in current)) return current

            const next = { ...current }
            delete next[activeProjectId]
            return next
          })
        })
        .catch(() => {
          // 보조 정보다. 실패해도 화면을 막지 않고 다음 주기에 다시 시도한다.
        })
    }

    refreshOngoingMeeting()
    const timerId = window.setInterval(refreshOngoingMeeting, ONGOING_MEETING_POLL_INTERVAL_MS)

    return () => {
      isSubscribed = false
      window.clearInterval(timerId)
    }
  }, [activeProjectId, loadOngoingMeeting])

  const handleCreateProject = () => {
    setIsCreateModalOpen(true)
    onCreateProject?.()
  }

  const handleAddProject = () => {
    setIsCreateModalOpen(true)
    onAddProject?.()
  }

  const joinOngoingMeeting = () => {
    if (!activeProject || !ongoingMeeting) return

    // `/start`가 튜토리얼 표시 여부를 판단한다. 참가 처리는 회의 화면 진입 시의 join이 담당한다.
    navigate(`/meetings/${encodeURIComponent(ongoingMeeting.meetingId)}/start`, {
      state: {
        projectId: activeProject.id,
        projectTitle: activeProject.name,
      },
    })
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
      // `/start`가 「다시 보지 않기」를 확인해 튜토리얼을 건너뛸지 정합니다. 여기서 곧장 튜토리얼로 가면 안 됩니다.
      navigate(`/meetings/${created.meetingId}/start`, {
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

  const handleAddRoleProfile = async (draft: ProjectRolePerspectiveDraft) => {
    const created = await addRoleProfile(draft)
    // 새 프로필이 목록·기본 관점에 바로 반영되도록 서버 상태를 다시 읽습니다.
    setRoleProfiles(await loadRoleProfiles())
    return created
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
              materials: [...(project.materials ?? []), ...nextMaterials].slice(
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
                materials: project.materials?.map((material) =>
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
      ?.materials?.find((projectMaterial) => projectMaterial.id === materialId)
    if (!material) return

    try {
      await deleteProjectReference?.(activeProjectId, materialId)
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === activeProjectId
            ? {
                ...project,
                materials: project.materials?.filter(
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

    // 관점은 프로젝트가 아니라 내 역할·관점 프로필에 저장됩니다.
    const nextProfile = roleProfiles.find((profile) => {
      const option = toProjectPerspectiveOption(profile)
      return (
        option.label === draft.perspectiveLabel &&
        option.selectedDescription === draft.perspectiveDescription
      )
    })
    if (nextProfile && !nextProfile.isDefault) {
      await changeDefaultRoleProfile(nextProfile.id)
      setRoleProfiles((current) =>
        current.map((profile) => ({ ...profile, isDefault: profile.id === nextProfile.id })),
      )
    }
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === activeProjectId ? (submittedProject ?? { ...project, ...draft }) : project,
      ),
    )
  }

  /**
   * 소유자가 참여 요청을 처리해도 요청자에게 알릴 통로가 없어, 프로젝트 화면에 들어올 때 확인한다.
   * 서버는 읽음 상태를 관리하지 않으므로 이미 보여 준 것은 걸러 낸다.
   */
  const currentUserId = user?.userId
  useEffect(() => {
    if (currentUserId === undefined) return

    let isSubscribed = true
    void loadMyJoinRequestResults().then((results) => {
      if (!isSubscribed) return

      const seen = readSeenJoinRequestResults(currentUserId)
      const unseen = results.filter((result) => !seen.has(result.requestId))
      if (unseen.length === 0) return

      // 서버가 최신순으로 주므로, 오래된 것부터 안내하도록 뒤집는다.
      setPendingJoinResults([...unseen].reverse())
    })

    return () => {
      isSubscribed = false
    }
  }, [currentUserId])

  const confirmJoinRequestResult = () => {
    const [result, ...rest] = pendingJoinResults
    if (!result) return

    if (currentUserId !== undefined) markJoinRequestResultSeen(currentUserId, result.requestId)
    setPendingJoinResults(rest)

    // 승인된 프로젝트로 옮긴다. 목록에 아직 없으면(조회 시점 차이) 그냥 닫는다.
    if (result.status !== 'APPROVED') return
    const approvedProjectId = String(result.projectId)
    if (projects.some((project) => project.id === approvedProjectId)) {
      setActiveProjectId(approvedProjectId)
    }
  }

  /**
   * 나간 프로젝트는 내 목록에서 사라진다. 보고 있던 프로젝트이므로 남은 것 중 하나로 옮기고,
   * 남은 것이 없으면 프로젝트가 없는 빈 상태가 된다. 나가기 요청 자체는 더보기 메뉴가 이미 보냈다.
   */
  const handleLeaveProject = () => {
    if (!activeProjectId) return
    const leftProject = projects.find((project) => project.id === activeProjectId)
    if (!leftProject) return

    const nextProjects = projects.filter((project) => project.id !== activeProjectId)
    setProjects(nextProjects)
    setActiveProjectId((currentId) =>
      currentId === activeProjectId ? nextProjects[0]?.id : currentId,
    )
    // 더보기 메뉴가 아니라 여기서 알린다. 마지막 프로젝트를 나가면 그 메뉴가 화면에서 사라진다.
    showProjectReferenceFeedback({
      title: '프로젝트 나가기 완료',
      description: `‘${leftProject.name}’ 프로젝트에서 나갔습니다.`,
      type: 'success',
    })
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

  const roleProfileOptions = roleProfiles.map(toProjectPerspectiveOption)
  // 프로필이 아직 없거나 조회에 실패하면 화면 기본 관점 목록으로 되돌립니다.
  const perspectiveOptions = roleProfileOptions.length > 0 ? roleProfileOptions : undefined
  const defaultProfile = roleProfiles.find((profile) => profile.isDefault)
  const defaultPerspective = defaultProfile ? toProjectPerspectiveOption(defaultProfile) : undefined
  const selectedProject = projects.find((project) => project.id === activeProjectId)
  const activeProject =
    selectedProject && defaultPerspective
      ? {
          ...selectedProject,
          perspectiveLabel: defaultPerspective.label,
          perspectiveDescription: defaultPerspective.selectedDescription,
        }
      : selectedProject
  const activeProjectMeetings = activeProjectId
    ? (completedMeetingsByProject[activeProjectId] ?? [])
    : []
  const ongoingMeeting = activeProjectId ? (ongoingMeetingByProject[activeProjectId] ?? null) : null
  const isMeetingHistoryLoading = Boolean(
    activeProjectId &&
    !(activeProjectId in completedMeetingsByProject) &&
    activeProjectId !== meetingHistoryErrorProjectId,
  )
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
        currentUserId={user?.userId ?? null}
        perspectiveOptions={perspectiveOptions?.map((option) => ({
          label: option.label,
          description: option.selectedDescription,
        }))}
        meetingHistoryPresentation={meetingHistoryPresentation}
        meetingProcessingOverlayOpen={meetingProcessingPhase === 'summaryProcessing'}
        meetingHistoryError={
          activeProjectId === meetingHistoryErrorProjectId
            ? '회의 기록을 불러오지 못했습니다.'
            : undefined
        }
        meetings={visibleMeetings}
        meetingHistoryLoading={isMeetingHistoryLoading}
        projectsLoading={isProjectsLoading}
        onAddMaterials={handleAddMaterials}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onLeaveProject={handleLeaveProject}
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
        ongoingMeeting={ongoingMeeting}
        onJoinOngoingMeeting={joinOngoingMeeting}
        onUpdateProject={handleUpdateProject}
        project={activeProject}
      />
      <ProjectCreateModal
        onAddPerspective={handleAddRoleProfile}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleProjectCreated}
        open={isCreateModalOpen}
        perspectiveOptions={perspectiveOptions}
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
      {roleProfileSavedToast.isMounted ? (
        <Toast
          className="top-[20px]!"
          description="역할·관점 설정이 저장되었습니다."
          position="topCenter"
          title="역할·관점 저장 성공"
          type="success"
          visible={roleProfileSavedToast.isVisible}
        />
      ) : null}
      {joinRequestSentToast.isMounted ? (
        <Toast
          className="top-[20px]!"
          description="소유자가 승인하기 전까지 기다려 주세요."
          position="topCenter"
          title="요청 전송 성공"
          type="success"
          visible={joinRequestSentToast.isVisible}
        />
      ) : null}
      {pendingJoinResults[0] ? (
        <JoinRequestResultDialog
          onConfirm={confirmJoinRequestResult}
          open
          projectTitle={pendingJoinResults[0].projectTitle}
          status={pendingJoinResults[0].status}
        />
      ) : null}
    </main>
  )
}
