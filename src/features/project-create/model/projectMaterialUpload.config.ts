export const PROJECT_MATERIAL_MAX_FILE_SIZE_MB = 20
export const PROJECT_MATERIAL_MAX_FILE_SIZE_BYTES = PROJECT_MATERIAL_MAX_FILE_SIZE_MB * 1024 * 1024
export const PROJECT_MATERIAL_MAX_FILES_PER_UPLOAD = 5

export const projectMaterialAcceptedExtensions = ['.pdf', '.docx', '.pptx', '.txt'] as const

export type ProjectMaterialUploadErrorCode =
  'upload-failed' | 'file-too-large' | 'too-many-files' | 'unsupported-format' | 'invalid-link'

export const projectMaterialUploadErrorMessages: Record<
  ProjectMaterialUploadErrorCode,
  { title: string; description: string }
> = {
  'upload-failed': {
    title: '파일 업로드 실패',
    description: '파일을 업로드하지 못했습니다. 다시 시도해 주세요',
  },
  'file-too-large': {
    title: '파일 용량 초과',
    description: '파일은 20MB 이하로 업로드해 주세요',
  },
  'too-many-files': {
    title: '동시 업로드 개수 초과',
    description: '자료 업로드에 실패했습니다. 다시 시도해 주세요',
  },
  'unsupported-format': {
    title: '지원하지 않는 파일 형식',
    description: 'PDF, DOCX, PPTX, TXT 파일만 업로드할 수 있어요',
  },
  'invalid-link': {
    title: '링크 업로드 실패',
    description: '올바른 링크를 입력해 주세요',
  },
}

export class ProjectMaterialUploadError extends Error {
  readonly code: ProjectMaterialUploadErrorCode

  constructor(code: ProjectMaterialUploadErrorCode) {
    super(code)
    this.name = 'ProjectMaterialUploadError'
    this.code = code
  }
}

export function getProjectMaterialFileError(
  file: Pick<File, 'name' | 'size'>,
  maxFileSizeBytes = PROJECT_MATERIAL_MAX_FILE_SIZE_BYTES,
): ProjectMaterialUploadErrorCode | null {
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase()}` : ''

  if (
    !projectMaterialAcceptedExtensions.includes(
      extension as (typeof projectMaterialAcceptedExtensions)[number],
    )
  ) {
    return 'unsupported-format'
  }

  if (file.size > maxFileSizeBytes) {
    return 'file-too-large'
  }

  return null
}

export function isSupportedProjectMaterialLink(value: string) {
  if (value.length > 2000) return false

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
