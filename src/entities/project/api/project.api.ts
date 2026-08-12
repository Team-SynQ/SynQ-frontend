import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { ApiResponse } from '../../../shared/api/contracts/api.contracts'
import type {
  CreateProjectRequest,
  ProjectInvitationInfoResponse,
  ProjectInvitationResponse,
  ProjectJoinRequest,
  ProjectJoinResponse,
  ProjectLinkReferenceResponse,
  ProjectListItemResponse,
  ProjectMemberListResponse,
  ProjectReferenceListResponse,
  ProjectReferenceType,
  ProjectResponse,
  ProjectRolePerspectiveResponse,
  ProjectRolePerspectiveUpdateRequest,
  ProjectRolePerspectiveUpdateResponse,
  ProjectUpdateRequest,
  ProjectUpdateResponse,
  ReferenceNameUpdateRequest,
  ReferenceNameUpdateResponse,
  RegisterProjectFilesResponse,
  RegisterProjectLinkRequest,
} from '../../../shared/api/contracts/project.contracts'
import type { ProjectReferenceMaterial, ProjectSummary } from '../model/project.types'

export type ProjectApi = {
  createProject(request: CreateProjectRequest): Promise<ProjectResponse>
  listProjects(): Promise<ProjectListItemResponse[]>
  getProject(projectId: number): Promise<ProjectResponse>
  updateProject(projectId: number, request: ProjectUpdateRequest): Promise<ProjectUpdateResponse>
  deleteProject(projectId: number): Promise<void>
  getProjectReferences(projectId: number): Promise<ProjectReferenceListResponse>
  registerProjectFiles(projectId: number, files: File[]): Promise<RegisterProjectFilesResponse>
  registerProjectLink(
    projectId: number,
    request: RegisterProjectLinkRequest,
  ): Promise<ProjectLinkReferenceResponse>
  deleteProjectReference(projectId: number, referenceId: number): Promise<void>
  updateProjectReferenceName(
    projectId: number,
    referenceId: number,
    request: ReferenceNameUpdateRequest,
  ): Promise<ReferenceNameUpdateResponse>
  getProjectMembers(projectId: number): Promise<ProjectMemberListResponse>
  createProjectInvitation(projectId: number): Promise<ProjectInvitationResponse>
  deleteProjectMember(projectId: number, memberId: number): Promise<void>
  getProjectInvitationInfo(inviteToken: string): Promise<ProjectInvitationInfoResponse>
  joinProject(request: ProjectJoinRequest): Promise<ProjectJoinResponse>
  getProjectRolePerspective(projectId: number): Promise<ProjectRolePerspectiveResponse>
  updateProjectRolePerspective(
    projectId: number,
    request: ProjectRolePerspectiveUpdateRequest,
  ): Promise<ProjectRolePerspectiveUpdateResponse>
}

export const projectApi: ProjectApi = {
  async createProject(request) {
    const response = await axiosInstance.post<ApiResponse<ProjectResponse>>('/projects', request)
    return response.data.result
  },
  async listProjects() {
    const response = await axiosInstance.get<ApiResponse<ProjectListItemResponse[]>>('/projects')
    return response.data.result
  },
  async getProject(projectId) {
    const response = await axiosInstance.get<ApiResponse<ProjectResponse>>(`/projects/${projectId}`)
    return response.data.result
  },
  async updateProject(projectId, request) {
    const response = await axiosInstance.patch<ApiResponse<ProjectUpdateResponse>>(
      `/projects/${projectId}`,
      request,
    )
    return response.data.result
  },
  async deleteProject(projectId) {
    await axiosInstance.delete(`/projects/${projectId}`)
  },
  async getProjectReferences(projectId) {
    const response = await axiosInstance.get<ApiResponse<ProjectReferenceListResponse>>(
      `/projects/${projectId}/references`,
    )
    return response.data.result
  },
  async registerProjectFiles(projectId, files) {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const response = await axiosInstance.post<ApiResponse<RegisterProjectFilesResponse>>(
      `/projects/${projectId}/references/files`,
      formData,
    )
    return response.data.result
  },
  async registerProjectLink(projectId, request) {
    const response = await axiosInstance.post<ApiResponse<ProjectLinkReferenceResponse>>(
      `/projects/${projectId}/references/links`,
      request,
    )
    return response.data.result
  },
  async deleteProjectReference(projectId, referenceId) {
    await axiosInstance.delete(`/projects/${projectId}/references/${referenceId}`)
  },
  async updateProjectReferenceName(projectId, referenceId, request) {
    const response = await axiosInstance.patch<ApiResponse<ReferenceNameUpdateResponse>>(
      `/projects/${projectId}/references/${referenceId}`,
      request,
    )
    return response.data.result
  },
  async getProjectMembers(projectId) {
    const response = await axiosInstance.get<ApiResponse<ProjectMemberListResponse>>(
      `/projects/${projectId}/members`,
    )
    return response.data.result
  },
  async createProjectInvitation(projectId) {
    const response = await axiosInstance.post<ApiResponse<ProjectInvitationResponse>>(
      `/projects/${projectId}/invitation`,
    )
    return response.data.result
  },
  async deleteProjectMember(projectId, memberId) {
    await axiosInstance.delete(`/projects/${projectId}/members/${memberId}`)
  },
  async getProjectInvitationInfo(inviteToken) {
    const response = await axiosInstance.get<ApiResponse<ProjectInvitationInfoResponse>>(
      `/projects/invitations/${inviteToken}`,
    )
    return response.data.result
  },
  async joinProject(request) {
    const response = await axiosInstance.post<ApiResponse<ProjectJoinResponse>>(
      '/projects/join',
      request,
    )
    return response.data.result
  },
  async getProjectRolePerspective(projectId) {
    const response = await axiosInstance.get<ApiResponse<ProjectRolePerspectiveResponse>>(
      `/projects/${projectId}/role-perspective`,
    )
    return response.data.result
  },
  async updateProjectRolePerspective(projectId, request) {
    const response = await axiosInstance.put<ApiResponse<ProjectRolePerspectiveUpdateResponse>>(
      `/projects/${projectId}/role-perspective`,
      request,
    )
    return response.data.result
  },
}

const defaultProjectPerspective = {
  label: 'PM',
  description: '일정, 범위, 의사결정 영향 중심',
} as const

/**
 * 목록 화면은 프로젝트당 참고자료를 곧바로 쓰지 않으므로 여기서는 조회하지 않습니다.
 * 선택된 프로젝트의 자료만 loadProjectReferenceMaterials로 따로 불러옵니다.
 */
export async function listProjectSummaries(): Promise<ProjectSummary[]> {
  const projects = await projectApi.listProjects()

  return projects.map((project) => ({
    apiProjectId: project.projectId,
    id: String(project.projectId),
    name: project.title,
    overview: project.description ?? '',
    perspectiveLabel: defaultProjectPerspective.label,
    perspectiveDescription: defaultProjectPerspective.description,
  }))
}

type ProjectReferenceLike = {
  referenceId: number
  type: ProjectReferenceType
  name: string
  createdAt: string
}

function toProjectReferenceMaterial(reference: ProjectReferenceLike): ProjectReferenceMaterial {
  return {
    id: String(reference.referenceId),
    kind: reference.type === 'FILE' ? 'file' : 'link',
    name: reference.name,
    createdAt: reference.createdAt,
  }
}

export async function loadProjectReferenceMaterials(
  projectId: number,
): Promise<ProjectReferenceMaterial[]> {
  const { references } = await projectApi.getProjectReferences(projectId)

  return references.map(toProjectReferenceMaterial)
}

/**
 * 파일은 한 번에 묶어 등록하고, 링크는 개수 제한 판정 순서를 지키기 위해 하나씩 등록합니다.
 */
export async function registerProjectReferenceMaterials(
  projectId: number,
  files: File[],
  links: string[],
): Promise<ProjectReferenceMaterial[]> {
  const registered: ProjectReferenceMaterial[] = []

  if (files.length > 0) {
    const { references } = await projectApi.registerProjectFiles(projectId, files)
    registered.push(...references.map(toProjectReferenceMaterial))
  }

  for (const url of links) {
    const reference = await projectApi.registerProjectLink(projectId, { url })
    registered.push(toProjectReferenceMaterial(reference))
  }

  return registered
}
