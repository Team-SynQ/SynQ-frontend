import type {
  CreateProjectRequest,
  ProjectLinkReferenceResponse,
  ProjectListItemResponse,
  ProjectReferenceListResponse,
  ProjectResponse,
  RegisterProjectFilesResponse,
  RegisterProjectLinkRequest,
} from '../../../shared/api/contracts/project.contracts'
import { projectMockService } from '../../../shared/api/mock/services/projects.mock'
import type { ProjectSummary } from '../model/project.types'

export type ProjectApi = {
  createProject(request: CreateProjectRequest): Promise<ProjectResponse>
  listProjects(): Promise<ProjectListItemResponse[]>
  getProject(projectId: number): Promise<ProjectResponse>
  getProjectReferences(projectId: number): Promise<ProjectReferenceListResponse>
  registerProjectFiles(
    projectId: number,
    files: File[],
  ): Promise<RegisterProjectFilesResponse>
  registerProjectLink(
    projectId: number,
    request: RegisterProjectLinkRequest,
  ): Promise<ProjectLinkReferenceResponse>
  deleteProjectReference(projectId: number, referenceId: number): Promise<void>
}

export const projectApi: ProjectApi = projectMockService

const defaultProjectPerspective = {
  label: 'PM',
  description: '일정, 범위, 의사결정 영향 중심',
} as const

export async function listProjectSummaries(): Promise<ProjectSummary[]> {
  const projects = await projectApi.listProjects()

  return Promise.all(
    projects.map(async (project) => {
      const { references } = await projectApi.getProjectReferences(
        project.projectId,
      )

      return {
        id: String(project.projectId),
        name: project.title,
        overview: project.description ?? '',
        perspectiveLabel: defaultProjectPerspective.label,
        perspectiveDescription: defaultProjectPerspective.description,
        materials: references.map((reference) => ({
          id: String(reference.referenceId),
          kind: reference.type === 'FILE' ? 'file' as const : 'link' as const,
          name: reference.name,
          createdAt: reference.createdAt,
        })),
      }
    }),
  )
}
