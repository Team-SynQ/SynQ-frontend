import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import chevronLeftIcon from '../../../shared/assets/icons/chevron-left.svg'
import closeIcon from '../../../shared/assets/icons/close.svg'
import uploadIcon from '../../../shared/assets/icons/upload.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import {
  Button,
  Segment,
  SegmentItem,
  Toast,
} from '../../../shared/ui'

import {
  getProjectMaterialFileError,
  isSupportedProjectMaterialLink,
  PROJECT_MATERIAL_MAX_FILES_PER_UPLOAD,
  PROJECT_MATERIAL_MAX_FILE_SIZE_MB,
  ProjectMaterialUploadError,
  projectMaterialAcceptedExtensions,
  projectMaterialUploadErrorMessages,
  type ProjectMaterialUploadErrorCode,
} from '../model/projectMaterialUpload.config'
import { projectCreationFailureMessage } from '../model/projectCreation.messages'
import type { ProjectMaterialDraft } from '../model/projectCreate.types'
import {
  ProjectMaterialList,
  type ProjectMaterialListItemModel,
} from './ProjectMaterialList'

type MaterialSource = 'file' | 'link'

type UploadFileItem = ProjectMaterialListItemModel & {
  file: File
}

export type ProjectMaterialUploadHandler = (
  files: File[],
) => Promise<void> | void

export type ProjectCreationHandler = (
  materials: ProjectMaterialDraft,
) => Promise<void> | void

type ProjectMaterialUploadFormProps = {
  titleId: string
  descriptionId: string
  onBack: () => void
  onClose: () => void
  onCreate?: ProjectCreationHandler
  onUploadFiles?: ProjectMaterialUploadHandler
}

let nextMaterialId = 0

function createMaterialId(kind: 'file' | 'link') {
  nextMaterialId += 1
  return `${kind}-${nextMaterialId}`
}

export function ProjectMaterialUploadForm({
  titleId,
  descriptionId,
  onBack,
  onClose,
  onCreate,
  onUploadFiles,
}: ProjectMaterialUploadFormProps) {
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<MaterialSource>('file')
  const [fileItems, setFileItems] = useState<UploadFileItem[]>([])
  const [linkItems, setLinkItems] = useState<ProjectMaterialListItemModel[]>([])
  const [linkValue, setLinkValue] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [errorCode, setErrorCode] =
    useState<ProjectMaterialUploadErrorCode>('upload-failed')
  const uploadErrorToast = useTransientVisibility()
  const creationErrorToast = useTransientVisibility()

  const showUploadError = (code: ProjectMaterialUploadErrorCode) => {
    setErrorCode(code)
    uploadErrorToast.show()
  }

  const addFiles = async (nextFiles: File[]) => {
    const validationError = nextFiles
      .map(getProjectMaterialFileError)
      .find((code): code is ProjectMaterialUploadErrorCode => code !== null)

    if (validationError) {
      showUploadError(validationError)
      return
    }

    const uniqueFiles = nextFiles.filter(
      (file) => !fileItems.some(
        (item) => item.file.name === file.name && item.file.size === file.size,
      ),
    )
    if (uniqueFiles.length === 0) return
    if (fileItems.length + uniqueFiles.length > PROJECT_MATERIAL_MAX_FILES_PER_UPLOAD) {
      showUploadError('too-many-files')
      return
    }

    const pendingItems: UploadFileItem[] = uniqueFiles.map((file) => ({
      id: createMaterialId('file'),
      file,
      name: file.name,
      status: 'uploading',
    }))
    const pendingIds = new Set(pendingItems.map((item) => item.id))
    setFileItems((current) => [...current, ...pendingItems])

    try {
      await onUploadFiles?.(uniqueFiles)
      setFileItems((current) => current.map((item) => (
        pendingIds.has(item.id)
          ? { ...item, status: 'complete' }
          : item
      )))
    } catch (error) {
      setFileItems((current) => current.filter((item) => !pendingIds.has(item.id)))
      showUploadError(
        error instanceof ProjectMaterialUploadError
          ? error.code
          : 'upload-failed',
      )
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    void addFiles(Array.from(event.dataTransfer.files))
  }

  const getNormalizedLink = () => {
    const normalizedLink = linkValue.trim()
    if (!normalizedLink) return null

    if (!isSupportedProjectMaterialLink(normalizedLink)) {
      showUploadError('invalid-link')
      return null
    }

    return normalizedLink
  }

  const addLink = () => {
    const normalizedLink = getNormalizedLink()
    if (!normalizedLink) return

    setLinkItems((current) => (
      current.some((item) => item.name === normalizedLink)
        ? current
        : [
            ...current,
            {
              id: createMaterialId('link'),
              name: normalizedLink,
              status: 'complete',
            },
          ]
    ))
    setLinkValue('')
  }

  const handleLinkKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    addLink()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (fileItems.some((item) => item.status === 'uploading') || isCreating) return

    let nextLinks = linkItems
    if (source === 'link' && linkValue.trim()) {
      const normalizedLink = getNormalizedLink()
      if (!normalizedLink) return

      nextLinks = linkItems.some((item) => item.name === normalizedLink)
        ? linkItems
        : [
            ...linkItems,
            {
              id: createMaterialId('link'),
              name: normalizedLink,
              status: 'complete',
            },
          ]
      setLinkItems(nextLinks)
      setLinkValue('')
    }

    setIsCreating(true)
    try {
      await onCreate?.({
        files: fileItems.map((item) => item.file),
        links: nextLinks.map((item) => item.name),
      })
    } catch {
      creationErrorToast.show()
    } finally {
      setIsCreating(false)
    }
  }

  const uploadErrorMessage = projectMaterialUploadErrorMessages[errorCode]
  const materialItems = [
    ...fileItems.map(({ id, name, status }) => ({ id, name, status })),
    ...linkItems,
  ]
  const isUploading = fileItems.some((item) => item.status === 'uploading')

  return (
    <>
      <form className="flex min-h-0 flex-1 flex-col gap-m" onSubmit={handleSubmit}>
        <header className="flex flex-col items-center gap-s text-center">
          <div aria-label="2 / 2 단계" className="flex items-center gap-s" role="img">
            <span className="size-[6px] rounded-full bg-primary-400" />
            <span className="size-[6px] rounded-full bg-primary-400" />
          </div>
          <div className="flex flex-col gap-xs">
            <p className="m-0 typo-body-02 text-brand-primary" id={descriptionId}>
              선택
            </p>
            <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
              AI 참고 자료 업로드
            </h2>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-l">
          <div className="flex flex-col gap-xs">
            <Segment className="mx-auto w-[198px]">
              <SegmentItem
                aria-pressed={source === 'file'}
                className="min-w-0 flex-1"
                onClick={() => setSource('file')}
                visualState={source === 'file' ? 'active' : 'default'}
              >
                파일
              </SegmentItem>
              <SegmentItem
                aria-pressed={source === 'link'}
                className="min-w-0 flex-1"
                onClick={() => setSource('link')}
                visualState={source === 'link' ? 'active' : 'default'}
              >
                링크
              </SegmentItem>
            </Segment>

            <div className="flex flex-col gap-xs">
              <label className="px-xs typo-body-01 text-fg-primary" htmlFor={fileInputId}>
                {source === 'file' ? '파일' : '링크'}
              </label>
              {source === 'file' ? (
                <>
                  <button
                    className="flex h-[42px] items-center gap-xs rounded-m border-stroke-md border-line-default bg-surface-default px-s text-left typo-body-02 text-fg-secondary transition-colors hover:bg-surface-muted focus-visible:border-brand-primary focus-visible:outline-none"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {fileItems.length > 0
                        ? `${fileItems.length}개 파일 선택됨`
                        : '클릭하여 파일을 업로드해 주세요'}
                    </span>
                    <img
                      alt=""
                      aria-hidden="true"
                      className="size-[24px] rotate-180"
                      src={chevronLeftIcon}
                    />
                  </button>
                  <input
                    accept={projectMaterialAcceptedExtensions.join(',')}
                    aria-label="AI 참고 자료 파일 선택"
                    className="sr-only"
                    id={fileInputId}
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    type="file"
                  />
                </>
              ) : (
                <div className="flex h-[42px] items-center gap-xs rounded-m border-stroke-md border-line-default bg-surface-default pl-s pr-xs focus-within:border-brand-primary">
                  <input
                    className="min-w-0 flex-1 bg-transparent typo-body-02 text-fg-primary outline-none placeholder:text-fg-secondary"
                    id={fileInputId}
                    onChange={(event) => setLinkValue(event.target.value)}
                    onKeyDown={handleLinkKeyDown}
                    placeholder="링크를 입력하세요"
                    type="url"
                    value={linkValue}
                  />
                  <Button
                    aria-label="링크 추가"
                    onClick={addLink}
                    size="small"
                    variant="basic"
                  >
                    추가
                  </Button>
                </div>
              )}
            </div>
          </div>

          <section className="flex min-h-0 flex-1 flex-col gap-xs">
            <div className="px-xs">
              <h3 className="m-0 typo-body-01 text-fg-primary">
                업로드 된 AI 참고 자료
              </h3>
              <p className="m-0 typo-caption text-fg-secondary">
                PDF, DOCX, PPTX, TXT 파일 또는 Notion / Google Drive 링크 지원
              </p>
            </div>
            <div
              className={[
                'flex min-h-[223px] flex-1 flex-col overflow-y-auto rounded-m border-stroke-md bg-surface-muted p-s transition-colors',
                isDragging ? 'border-brand-primary' : 'border-transparent',
              ].join(' ')}
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node)) return
                setIsDragging(false)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              {materialItems.length === 0 ? (
                <button
                  className="flex min-h-full flex-1 flex-col items-center justify-center gap-s text-center"
                  onClick={() => {
                    if (source === 'file') fileInputRef.current?.click()
                  }}
                  type="button"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    className="size-[52px]"
                    height="52"
                    src={uploadIcon}
                    width="52"
                  />
                  <span className="flex flex-col">
                    <span className="typo-body-02 text-fg-secondary">
                      파일을 드래그하거나 클릭하여 자료를 업로드 하세요
                    </span>
                    <span className="typo-caption text-fg-secondary">
                      파일 당 최대 {PROJECT_MATERIAL_MAX_FILE_SIZE_MB}MB
                    </span>
                  </span>
                </button>
              ) : (
                <ProjectMaterialList
                  items={materialItems}
                  onRemove={(id) => {
                    setFileItems((current) => current.filter((item) => item.id !== id))
                    setLinkItems((current) => current.filter((item) => item.id !== id))
                  }}
                />
              )}
            </div>
          </section>
        </div>

        <div className="flex w-full gap-s">
          <Button className="w-[91px]" onClick={onBack} size="large" variant="fillGray100">
            이전
          </Button>
          <Button
            aria-busy={isCreating}
            className="min-w-0 flex-1"
            disabled={isUploading || isCreating}
            size="large"
            type="submit"
          >
            {isCreating ? '프로젝트 생성 중...' : '생성하기'}
          </Button>
        </div>

        <Button
          aria-label="프로젝트 생성 닫기"
          className="absolute right-[15px] top-[15px] size-[42px] px-0"
          onClick={onClose}
          size="medium"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={closeIcon} />
        </Button>
      </form>

      {uploadErrorToast.isMounted ? (
        <Toast
          className="top-[20px]! z-[70]!"
          description={uploadErrorMessage.description}
          position="topCenter"
          title={uploadErrorMessage.title}
          type="error"
          visible={uploadErrorToast.isVisible}
        />
      ) : null}
      {creationErrorToast.isMounted ? (
        <Toast
          className="top-[20px]! z-[70]!"
          description={projectCreationFailureMessage.description}
          position="topCenter"
          title={projectCreationFailureMessage.title}
          type="error"
          visible={creationErrorToast.isVisible}
        />
      ) : null}
    </>
  )
}
