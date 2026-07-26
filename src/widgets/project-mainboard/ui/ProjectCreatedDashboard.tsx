import { useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  PROJECT_REFERENCE_MAX_MATERIALS,
  type ProjectReferenceMaterial,
  type ProjectSummary,
} from '../../../entities/project'
import {
  ProjectMaterialUploadForm,
  type ProjectMaterialDraft,
} from '../../../features/project-create'
import {
  ProjectReferenceDeleteDialog,
  ProjectReferenceEditDialog,
  ProjectReferenceMenu,
} from '../../../features/project-reference-actions'
import burgerIcon from '../../../shared/assets/icons/burger.svg'
import clipboardIcon from '../assets/clipboard.svg'
import fileIcon from '../assets/file.svg'
import folderIcon from '../assets/folder.svg'
import microphoneIcon from '../assets/microphone.svg'
import moreVerticalIcon from '../../../shared/assets/icons/more-vertical.svg'
import plusIcon from '../../../shared/assets/icons/plus.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Badge, Button, OverlayDialog, Toast } from '../../../shared/ui'

type ProjectCreatedDashboardProps = {
  project: ProjectSummary
  onAddMaterials?: (materials: ProjectMaterialDraft) => Promise<void> | void
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
}

const projectDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
})

export function ProjectCreatedDashboard({
  project,
  onAddMaterials,
  onDeleteMaterial,
  onRenameMaterial,
}: ProjectCreatedDashboardProps) {
  const navigate = useNavigate()

  return (
    <div className="flex w-full flex-col gap-l">
      <header className="flex items-start gap-s">
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <h1 className="m-0 truncate typo-heading text-fg-primary">{project.name}</h1>
          {project.overview ? (
            <p className="m-0 typo-body-01 text-fg-secondary">{project.overview}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-xs">
            <span className="typo-body-01 text-fg-secondary">내 관점 :</span>
            <Badge size="extraSmall">{project.perspectiveLabel}</Badge>
            <Badge size="extraSmall">{project.perspectiveDescription}</Badge>
          </div>
        </div>
        <Button
          aria-label="프로젝트 더보기"
          className="size-[52px] px-0"
          size="large"
          variant="fillGray100"
        >
          <img
            alt=""
            aria-hidden="true"
            className="size-[28px]"
            height="28"
            src={moreVerticalIcon}
            width="28"
          />
        </Button>
      </header>

      <section className="flex flex-col gap-s">
        <div className="flex items-center justify-between gap-s">
          <h2 className="m-0 typo-title-02 text-fg-primary">프로젝트 허브</h2>
          <Button
            className="w-[178px]"
            leftIcon={
              <span className="flex size-[28px] items-center justify-center">
                <img
                  alt=""
                  aria-hidden="true"
                  className="size-[28px]"
                  height="28"
                  src={microphoneIcon}
                  width="28"
                />
              </span>
            }
            onClick={() => navigate('/meetings/demo/tutorial')}
            size="large"
          >
            새 회의 시작
          </Button>
        </div>

        <div className="grid min-h-[300px] grid-cols-[minmax(0,1fr)_472px] gap-s max-[1100px]:grid-cols-1">
          <section className="flex min-h-[300px] flex-col gap-s rounded-[16px] border-stroke-md border-line-default bg-surface-default p-m">
            <div className="flex items-center gap-xs">
              <img
                alt=""
                aria-hidden="true"
                className="size-[24px]"
                height="24"
                src={clipboardIcon}
                width="24"
              />
              <h3 className="m-0 typo-body-01 text-fg-primary">최신 회의 요약</h3>
            </div>
            <p className="m-auto typo-body-01 text-gray-500">아직 회의 기록이 없습니다</p>
          </section>

          <ProjectReferenceMaterials
            onAddMaterials={onAddMaterials}
            onDeleteMaterial={onDeleteMaterial}
            onRenameMaterial={onRenameMaterial}
            project={project}
          />
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <h2 className="m-0 typo-title-02 text-fg-primary">회의 기록</h2>
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-xl border-b border-line-default px-m pb-s typo-body-01 text-gray-500">
            <span className="min-w-0 flex-1">회의 이름</span>
            <span className="w-[66px] text-center">길이</span>
            <span className="w-[66px] text-center">생성일</span>
            <span className="w-[24px]" />
          </div>
          <p className="flex h-[200px] items-center justify-center whitespace-pre-line text-center typo-body-01 text-gray-500">
            {'아직 회의 기록이 없습니다\n‘새 회의 시작’을 통해 기록을 시작해 보세요'}
          </p>
        </div>
      </section>
    </div>
  )
}

type ProjectReferenceMaterialsProps = {
  project: ProjectSummary
  onAddMaterials?: (materials: ProjectMaterialDraft) => Promise<void> | void
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
}

function ProjectReferenceMaterials({
  project,
  onAddMaterials,
  onDeleteMaterial,
  onRenameMaterial,
}: ProjectReferenceMaterialsProps) {
  const uploadTitleId = useId()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const materialLimitToast = useTransientVisibility()

  const handleAddMaterials = async (materials: ProjectMaterialDraft) => {
    const nextMaterialCount = materials.files.length + materials.links.length
    if (project.materials.length + nextMaterialCount > PROJECT_REFERENCE_MAX_MATERIALS) {
      materialLimitToast.show()
      return
    }

    await onAddMaterials?.(materials)
    setIsUploadModalOpen(false)
  }

  const handleOpenUploadModal = () => {
    if (project.materials.length >= PROJECT_REFERENCE_MAX_MATERIALS) {
      materialLimitToast.show()
      return
    }

    setIsUploadModalOpen(true)
  }

  return (
    <>
      <section className="flex min-h-[300px] flex-col gap-s rounded-[16px] bg-surface-muted p-m">
        <div className="flex items-center gap-xs">
          <div className="flex min-w-0 flex-1 items-center gap-xs">
            <img
              alt=""
              aria-hidden="true"
              className="size-[24px]"
              height="24"
              src={folderIcon}
              width="24"
            />
            <h3 className="m-0 typo-body-01 text-fg-primary">AI 참고 자료</h3>
            <span className="typo-body-02 text-fg-secondary">{project.materials.length}</span>
            <span className="typo-caption text-gray-500">/ {PROJECT_REFERENCE_MAX_MATERIALS}</span>
          </div>
          <Button
            aria-label="AI 참고 자료 추가"
            className="size-[32px] px-0"
            onClick={handleOpenUploadModal}
            size="small"
            variant="basic"
          >
            <img
              alt=""
              aria-hidden="true"
              className="size-[24px]"
              height="24"
              src={plusIcon}
              width="24"
            />
          </Button>
        </div>

        {project.materials.length > 0 ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {project.materials.map((material) => (
              <ProjectReferenceMaterialItem
                key={material.id}
                material={material}
                onDeleteMaterial={onDeleteMaterial}
                onRenameMaterial={onRenameMaterial}
              />
            ))}
          </ul>
        ) : (
          <p className="m-auto typo-body-02 text-gray-500">등록된 AI 참고 자료가 없습니다</p>
        )}
      </section>
      {materialLimitToast.isMounted ? (
        <Toast
          className="top-[20px]! z-[70]!"
          description={`참고자료는 프로젝트당 최대 ${PROJECT_REFERENCE_MAX_MATERIALS}개까지 등록할 수 있어요.`}
          position="topCenter"
          title="참고자료 최대 개수 초과"
          type="error"
          visible={materialLimitToast.isVisible}
        />
      ) : null}
      <OverlayDialog
        className="relative h-[680px] max-h-[calc(100dvh-48px)] max-w-[460px]! gap-m px-m py-l shadow-floating"
        closeOnEscape
        onClose={() => setIsUploadModalOpen(false)}
        open={isUploadModalOpen}
        titleId={uploadTitleId}
      >
        {isUploadModalOpen ? (
          <ProjectMaterialUploadForm
            mode="project-reference"
            onClose={() => setIsUploadModalOpen(false)}
            onCreate={handleAddMaterials}
            titleId={uploadTitleId}
          />
        ) : null}
      </OverlayDialog>
    </>
  )
}

type ProjectReferenceMaterialItemProps = {
  material: ProjectReferenceMaterial
  onDeleteMaterial?: (materialId: string) => Promise<void> | void
  onRenameMaterial?: (materialId: string, nextName: string) => Promise<void> | void
}

function ProjectReferenceMaterialItem({
  material,
  onDeleteMaterial,
  onRenameMaterial,
}: ProjectReferenceMaterialItemProps) {
  const [activeDialog, setActiveDialog] = useState<'edit' | 'delete'>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = `project-reference-menu-${material.id}`

  const runReferenceAction = async (action: () => Promise<void> | void) => {
    setIsSubmitting(true)
    try {
      await action()
    } catch {
      // Mutation feedback is handled by the callback owner.
    } finally {
      setIsSubmitting(false)
      setActiveDialog(undefined)
    }
  }

  return (
    <>
      <li className="flex h-[42px] items-center gap-xs border-b border-line-default last:border-b-0">
        <img
          alt=""
          aria-hidden="true"
          className="size-[24px]"
          height="24"
          src={fileIcon}
          width="24"
        />
        <span className="min-w-0 flex-1 truncate typo-body-02 text-fg-primary">
          {material.name}
        </span>
        <time
          className="w-[62px] text-center typo-body-02 text-fg-secondary"
          dateTime={material.createdAt}
        >
          {projectDateFormatter.format(new Date(material.createdAt))}
        </time>
        <div className="relative shrink-0">
          <Button
            aria-controls={menuId}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label={`${material.name} 더보기`}
            className="size-[32px] px-0"
            leftIcon={
              <span className="flex size-[24px] items-center justify-center">
                <img
                  alt=""
                  aria-hidden="true"
                  className="size-[24px]"
                  height="24"
                  src={burgerIcon}
                  width="24"
                />
              </span>
            }
            onClick={() => setIsMenuOpen((current) => !current)}
            ref={triggerRef}
            size="small"
            variant="basic"
          />
          <ProjectReferenceMenu
            id={menuId}
            materialName={material.name}
            onClose={() => setIsMenuOpen(false)}
            onDelete={() => setActiveDialog('delete')}
            onEditTitle={() => setActiveDialog('edit')}
            open={isMenuOpen}
            triggerRef={triggerRef}
          />
        </div>
      </li>
      <ProjectReferenceEditDialog
        currentName={material.name}
        onCancel={() => setActiveDialog(undefined)}
        onConfirm={(nextName) => {
          void runReferenceAction(() => onRenameMaterial?.(material.id, nextName))
        }}
        open={activeDialog === 'edit'}
        pending={isSubmitting}
      />
      <ProjectReferenceDeleteDialog
        materialName={material.name}
        onCancel={() => setActiveDialog(undefined)}
        onConfirm={() => {
          void runReferenceAction(() => onDeleteMaterial?.(material.id))
        }}
        open={activeDialog === 'delete'}
        pending={isSubmitting}
      />
    </>
  )
}
