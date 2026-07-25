import type {
  CreateProjectRequest,
  ProjectFileExtension,
  ProjectFileReferenceResponse,
  ProjectLinkReferenceResponse,
  ProjectListItemResponse,
  ProjectReferenceListResponse,
  ProjectResponse,
  RegisterProjectFilesResponse,
  RegisterProjectLinkRequest,
} from '../../contracts/project.contracts'
import { projectMockDb } from '../db/projects.mockDb'
import { projectMockActorFixture } from '../fixtures/projects.fixture'
import { MockApiError, waitForMockApi } from '../lib/mockApi'

const MAX_PROJECT_TITLE_LENGTH = 30
const MAX_PROJECT_DESCRIPTION_LENGTH = 500
const MAX_REFERENCE_COUNT = 10
const MAX_FILES_PER_REQUEST = 5
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024
const SUPPORTED_FILE_EXTENSIONS = new Set<ProjectFileExtension>([
  'PDF',
  'DOCX',
  'PPTX',
  'TXT',
])

function requireProject(projectId: number): ProjectResponse {
  const project = projectMockDb.getProject(projectId)
  if (!project) {
    throw new MockApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.')
  }
  return project
}

function getFileExtension(file: File): ProjectFileExtension | null {
  const extension = file.name.split('.').pop()?.toUpperCase()
  return SUPPORTED_FILE_EXTENSIONS.has(extension as ProjectFileExtension)
    ? extension as ProjectFileExtension
    : null
}

function assertReferenceCapacity(projectId: number, incomingCount: number) {
  const references = projectMockDb.getReferences(projectId)
  if (!references) {
    throw new MockApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.')
  }
  if (references.length + incomingCount > MAX_REFERENCE_COUNT) {
    throw new MockApiError(
      409,
      'REFERENCE_LIMIT_EXCEEDED',
      '프로젝트 참고자료는 최대 10개까지 등록할 수 있습니다.',
    )
  }
}

export const projectMockService = {
  async createProject(request: CreateProjectRequest): Promise<ProjectResponse> {
    await waitForMockApi()
    const title = request.title.trim()
    const description = request.description?.trim() || null

    if (!title || title.length > MAX_PROJECT_TITLE_LENGTH) {
      throw new MockApiError(400, 'INVALID_PROJECT_TITLE', '프로젝트명을 확인해 주세요.')
    }
    if (description && description.length > MAX_PROJECT_DESCRIPTION_LENGTH) {
      throw new MockApiError(
        400,
        'INVALID_PROJECT_DESCRIPTION',
        '프로젝트 설명은 최대 500자까지 입력할 수 있습니다.',
      )
    }

    return projectMockDb.createProject(
      { title, description },
      projectMockActorFixture.userId,
      new Date().toISOString(),
    )
  },

  async listProjects(): Promise<ProjectListItemResponse[]> {
    await waitForMockApi()
    return projectMockDb.listProjects()
  },

  async getProject(projectId: number): Promise<ProjectResponse> {
    await waitForMockApi()
    return requireProject(projectId)
  },

  async getProjectReferences(projectId: number): Promise<ProjectReferenceListResponse> {
    await waitForMockApi()
    requireProject(projectId)
    const references = projectMockDb.getReferences(projectId) ?? []
    return {
      currentCount: references.length,
      maxCount: MAX_REFERENCE_COUNT,
      references,
    }
  },

  async registerProjectFiles(
    projectId: number,
    files: File[],
  ): Promise<RegisterProjectFilesResponse> {
    await waitForMockApi()
    requireProject(projectId)

    if (files.length === 0 || files.length > MAX_FILES_PER_REQUEST) {
      throw new MockApiError(400, 'INVALID_FILE_COUNT', '파일은 한 번에 최대 5개까지 등록할 수 있습니다.')
    }
    if (files.some((file) => file.size > MAX_FILE_SIZE_BYTES)) {
      throw new MockApiError(413, 'FILE_TOO_LARGE', '파일은 20MB 이하만 등록할 수 있습니다.')
    }
    const extensions = files.map(getFileExtension)
    if (extensions.some((extension) => extension === null)) {
      throw new MockApiError(415, 'UNSUPPORTED_FILE_TYPE', '지원하지 않는 파일 형식입니다.')
    }
    assertReferenceCapacity(projectId, files.length)

    const createdAt = new Date().toISOString()
    const references = projectMockDb.addReferences(
      projectId,
      files.map((file, index) => ({
        type: 'FILE' as const,
        name: file.name,
        url: null,
        fileSize: file.size,
        fileExtension: extensions[index] as ProjectFileExtension,
        status: 'UPLOADING' as const,
        uploaderId: projectMockActorFixture.userId,
        uploaderName: projectMockActorFixture.name,
        canDelete: true,
        createdAt,
      })),
    ) ?? []
    const responseReferences: ProjectFileReferenceResponse[] = references.map(
      (reference) => ({
        referenceId: reference.referenceId,
        type: 'FILE',
        name: reference.name,
        fileSize: reference.fileSize as number,
        fileExtension: reference.fileExtension as ProjectFileExtension,
        status: 'UPLOADING',
        uploaderId: reference.uploaderId,
        uploaderName: reference.uploaderName,
        createdAt: reference.createdAt,
      }),
    )
    projectMockDb.setReferenceStatus(
      projectId,
      references.map((reference) => reference.referenceId),
      'AVAILABLE',
    )
    return { references: responseReferences }
  },

  async registerProjectLink(
    projectId: number,
    request: RegisterProjectLinkRequest,
  ): Promise<ProjectLinkReferenceResponse> {
    await waitForMockApi()
    requireProject(projectId)

    const value = request.url.trim()
    let url: URL
    try {
      url = new URL(value)
    } catch {
      throw new MockApiError(400, 'INVALID_REFERENCE_URL', '올바른 링크를 입력해 주세요.')
    }
    if (!['http:', 'https:'].includes(url.protocol) || value.length > 2000) {
      throw new MockApiError(400, 'INVALID_REFERENCE_URL', '올바른 링크를 입력해 주세요.')
    }
    assertReferenceCapacity(projectId, 1)

    const createdAt = new Date().toISOString()
    const reference = projectMockDb.addReferences(projectId, [{
      type: 'LINK',
      name: url.hostname,
      url: value,
      fileSize: null,
      fileExtension: null,
      status: 'UPLOADING',
      uploaderId: projectMockActorFixture.userId,
      uploaderName: projectMockActorFixture.name,
      canDelete: true,
      createdAt,
    }])?.[0]
    if (!reference) {
      throw new MockApiError(500, 'REFERENCE_CREATE_FAILED', '참고자료 등록에 실패했습니다.')
    }

    projectMockDb.setReferenceStatus(projectId, [reference.referenceId], 'AVAILABLE')
    return {
      referenceId: reference.referenceId,
      type: 'LINK',
      name: reference.name,
      url: value,
      status: 'UPLOADING',
      uploaderId: reference.uploaderId,
      uploaderName: reference.uploaderName,
      createdAt: reference.createdAt,
    }
  },

  async deleteProjectReference(projectId: number, referenceId: number): Promise<void> {
    await waitForMockApi()
    requireProject(projectId)
    if (!projectMockDb.deleteReference(projectId, referenceId)) {
      throw new MockApiError(404, 'REFERENCE_NOT_FOUND', '참고자료를 찾을 수 없습니다.')
    }
  },
}
