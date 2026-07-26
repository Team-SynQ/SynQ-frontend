import { useEffect, useState } from 'react'

import { listProjectSummaries, type ProjectSummary } from '../entities/project'
import {
  createProjectWithMaterials,
  getProjectCreationSuccessMessage,
  ProjectCreateModal,
  type ProjectCreateDraft,
  type ProjectMaterialDraft,
} from '../features/project-create'
import { useTransientVisibility } from '../shared/lib/useTransientVisibility'
import { Toast } from '../shared/ui'
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
}

export function ProjectMainboardPage({
  user,
  onCreateProject,
  onAddProject,
  onToggleSidebar,
  loadProjects = listProjectSummaries,
  onSubmitProject,
}: ProjectMainboardPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string>()
  const [latestCreatedProjectName, setLatestCreatedProjectName] = useState<string>()
  const creationSuccessToast = useTransientVisibility()
  const {
    isMounted: isProjectLoadErrorMounted,
    isVisible: isProjectLoadErrorVisible,
    show: showProjectLoadError,
  } = useTransientVisibility()

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
        setActiveProjectId((currentProjectId) => currentProjectId ?? initialProjects[0]?.id)
      })
      .catch(() => {
        if (isSubscribed) showProjectLoadError()
      })

    return () => {
      isSubscribed = false
    }
  }, [loadProjects, showProjectLoadError])

  const handleCreateProject = () => {
    setIsCreateModalOpen(true)
    onCreateProject?.()
  }

  const handleAddProject = () => {
    setIsCreateModalOpen(true)
    onAddProject?.()
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

  const activeProject = projects.find((project) => project.id === activeProjectId)
  const successMessage = latestCreatedProjectName
    ? getProjectCreationSuccessMessage(latestCreatedProjectName)
    : null

  return (
    <main className="flex min-h-screen w-full bg-surface-default">
      <ProjectSidebar
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
      <ProjectMainboard onCreateProject={handleCreateProject} project={activeProject} />
      <ProjectCreateModal
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleProjectCreated}
        open={isCreateModalOpen}
      />
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
    </main>
  )
}
