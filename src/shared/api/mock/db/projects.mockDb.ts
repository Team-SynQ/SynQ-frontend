import type {
  CreateProjectRequest,
  ProjectListItemResponse,
  ProjectReferenceResponse,
  ProjectReferenceStatus,
  ProjectResponse,
} from '../../contracts/project.contracts'
type ProjectRecord = {
  project: ProjectResponse
  updatedAt: string
  references: ProjectReferenceResponse[]
}

const records = new Map<number, ProjectRecord>()
let nextProjectId = 1
let nextReferenceId = 1

function cloneProject(project: ProjectResponse): ProjectResponse {
  return { ...project }
}

function cloneReference(reference: ProjectReferenceResponse): ProjectReferenceResponse {
  return { ...reference }
}

export function resetProjectMockDb() {
  records.clear()
  nextProjectId = 1
  nextReferenceId = 1
}

resetProjectMockDb()

export const projectMockDb = {
  createProject(
    request: CreateProjectRequest,
    ownerId: number,
    createdAt: string,
  ): ProjectResponse {
    const project: ProjectResponse = {
      projectId: nextProjectId,
      ownerId,
      title: request.title,
      description: request.description ?? null,
      createdAt,
    }
    nextProjectId += 1
    records.set(project.projectId, {
      project,
      updatedAt: createdAt,
      references: [],
    })
    return cloneProject(project)
  },

  listProjects(): ProjectListItemResponse[] {
    return Array.from(records.values())
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(({ project, updatedAt }) => ({
        projectId: project.projectId,
        title: project.title,
        description: project.description,
        recentMeetingTitle: null,
        updatedAt,
      }))
  },

  getProject(projectId: number): ProjectResponse | undefined {
    const record = records.get(projectId)
    return record ? cloneProject(record.project) : undefined
  },

  deleteProject(projectId: number): boolean {
    return records.delete(projectId)
  },

  getReferences(projectId: number): ProjectReferenceResponse[] | undefined {
    return records.get(projectId)?.references.map(cloneReference)
  },

  addReferences(
    projectId: number,
    references: Omit<ProjectReferenceResponse, 'referenceId'>[],
  ): ProjectReferenceResponse[] | undefined {
    const record = records.get(projectId)
    if (!record) return undefined

    const createdReferences = references.map((reference) => ({
      ...reference,
      referenceId: nextReferenceId++,
    }))
    record.references.push(...createdReferences)
    record.updatedAt = createdReferences.at(-1)?.createdAt ?? record.updatedAt
    return createdReferences.map(cloneReference)
  },

  setReferenceStatus(projectId: number, referenceIds: number[], status: ProjectReferenceStatus) {
    const referenceIdSet = new Set(referenceIds)
    const record = records.get(projectId)
    if (!record) return

    record.references = record.references.map((reference) =>
      referenceIdSet.has(reference.referenceId) ? { ...reference, status } : reference,
    )
  },

  deleteReference(projectId: number, referenceId: number): boolean {
    const record = records.get(projectId)
    if (!record) return false

    const nextReferences = record.references.filter(
      (reference) => reference.referenceId !== referenceId,
    )
    if (nextReferences.length === record.references.length) return false

    record.references = nextReferences
    record.updatedAt = new Date().toISOString()
    return true
  },
}
