export type CreateProjectRequest = {
  title: string
  description?: string | null
}

export type ProjectResponse = {
  projectId: number
  ownerId: number
  title: string
  description: string | null
  createdAt: string
}

export type ProjectListItemResponse = {
  projectId: number
  title: string
  description: string | null
  recentMeetingTitle: string | null
  updatedAt: string
}

export type ProjectReferenceType = 'FILE' | 'LINK'
export type ProjectReferenceStatus = 'UPLOADING' | 'AVAILABLE' | 'READ_FAILED'
export type ProjectFileExtension = 'PDF' | 'DOCX' | 'PPTX' | 'TXT'

export type ProjectReferenceResponse = {
  referenceId: number
  type: ProjectReferenceType
  name: string
  url: string | null
  fileSize: number | null
  fileExtension: ProjectFileExtension | null
  status: ProjectReferenceStatus
  uploaderId: number
  uploaderName: string
  canDelete: boolean
  createdAt: string
}

export type ProjectReferenceListResponse = {
  currentCount: number
  maxCount: number
  references: ProjectReferenceResponse[]
}

export type ProjectFileReferenceResponse = {
  referenceId: number
  type: 'FILE'
  name: string
  fileSize: number
  fileExtension: ProjectFileExtension
  status: ProjectReferenceStatus
  uploaderId: number
  uploaderName: string
  createdAt: string
}

export type RegisterProjectFilesResponse = {
  references: ProjectFileReferenceResponse[]
}

export type RegisterProjectLinkRequest = {
  url: string
}

export type ProjectLinkReferenceResponse = {
  referenceId: number
  type: 'LINK'
  name: string
  url: string
  status: ProjectReferenceStatus
  uploaderId: number
  uploaderName: string
  createdAt: string
}
