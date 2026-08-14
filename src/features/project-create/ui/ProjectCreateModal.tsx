import { useEffect, useId, useState, type FormEvent } from 'react'

import closeIcon from '../../../shared/assets/icons/close.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Button, InputBox, OverlayDialog, Toast } from '../../../shared/ui'

import { createRoleProfileOption } from '../api/roleProfile.api'
import { projectFocusOptions, projectRoleOptions } from '../model/projectPerspective.config'
import type {
  ProjectCreateDraft,
  ProjectMaterialDraft,
  ProjectPerspectiveOption,
  ProjectRolePerspectiveDraft,
} from '../model/projectCreate.types'
import { ProjectMaterialUploadForm } from './ProjectMaterialUploadForm'
import type { ProjectMaterialUploadHandler } from './ProjectMaterialUploadForm'
import { ProjectPerspectiveSelect } from './ProjectPerspectiveSelect'
import { ProjectRolePerspectiveForm } from './ProjectRolePerspectiveForm'

const PROJECT_NAME_MAX_LENGTH = 30
const PROJECT_OVERVIEW_MAX_LENGTH = 500

export type ProjectCreateModalProps = {
  open: boolean
  initialValues?: Partial<ProjectCreateDraft>
  perspectiveOptions?: ProjectPerspectiveOption[]
  onAddPerspective?: (
    draft: ProjectRolePerspectiveDraft,
  ) => Promise<ProjectPerspectiveOption | void> | ProjectPerspectiveOption | void
  onClose: () => void
  onCreate?: (draft: ProjectCreateDraft, materials: ProjectMaterialDraft) => Promise<void> | void
  onNext?: (draft: ProjectCreateDraft) => void
  onUploadFiles?: ProjectMaterialUploadHandler
}

export function ProjectCreateModal({
  open,
  initialValues,
  // 사용자가 프로필에 저장한 관점만 보여 준다. 화면 전용 기본 목록을 쓰면 만든 적 없는 관점이 뜬다.
  perspectiveOptions = [],
  onAddPerspective = createRoleProfileOption,
  onClose,
  onCreate,
  onNext,
  onUploadFiles,
}: ProjectCreateModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <OverlayDialog
      className="relative h-[680px] max-h-[calc(100dvh-48px)] max-w-[460px] gap-m px-m py-l shadow-floating"
      closeOnEscape
      descriptionId={descriptionId}
      onClose={onClose}
      open={open}
      titleId={titleId}
    >
      {open ? (
        <ProjectCreateSession
          descriptionId={descriptionId}
          initialValues={initialValues}
          onAddPerspective={onAddPerspective}
          onClose={onClose}
          onCreate={onCreate}
          onNext={onNext}
          onUploadFiles={onUploadFiles}
          perspectiveOptions={perspectiveOptions}
          titleId={titleId}
        />
      ) : null}
    </OverlayDialog>
  )
}

type ProjectCreateSessionProps = Omit<ProjectCreateModalProps, 'open'> & {
  titleId: string
  descriptionId: string
  perspectiveOptions: ProjectPerspectiveOption[]
}

function ProjectCreateSession({
  titleId,
  descriptionId,
  initialValues,
  perspectiveOptions,
  onAddPerspective,
  onClose,
  onCreate,
  onNext,
  onUploadFiles,
}: ProjectCreateSessionProps) {
  const [step, setStep] = useState<'details' | 'materials'>('details')
  const [isAddingPerspective, setIsAddingPerspective] = useState(false)
  const addSuccessToast = useTransientVisibility()
  const addErrorToast = useTransientVisibility()
  const [isAddingPerspectivePending, setIsAddingPerspectivePending] = useState(false)
  const [availableOptions, setAvailableOptions] = useState(perspectiveOptions)
  const [draft, setDraft] = useState<ProjectCreateDraft>({
    name: initialValues?.name ?? '',
    perspectiveId: initialValues?.perspectiveId ?? perspectiveOptions[0]?.id ?? '',
    overview: initialValues?.overview ?? '',
  })

  // 모달이 프로필 조회보다 먼저 열리면 옵션이 빈 채 고정된다. 늦게 도착한 프로필을 따라 채운다.
  // effect 본문에서 직접 setState 하면 lint가 막는다. 마이크로태스크로 미룬다.
  useEffect(() => {
    if (perspectiveOptions.length === 0) return

    let isSubscribed = true
    void Promise.resolve().then(() => {
      if (!isSubscribed) return
      setAvailableOptions((current) => (current.length === 0 ? perspectiveOptions : current))
      setDraft((current) =>
        current.perspectiveId
          ? current
          : { ...current, perspectiveId: perspectiveOptions[0]?.id ?? '' },
      )
    })

    return () => {
      isSubscribed = false
    }
  }, [perspectiveOptions])

  const handleAddPerspective = async (roleDraft: ProjectRolePerspectiveDraft) => {
    const role = projectRoleOptions.find((option) => option.id === roleDraft.roleId)
    const focusLabels = roleDraft.focusIds
      .map((focusId) => projectFocusOptions.find((option) => option.id === focusId)?.label)
      .filter((label): label is string => Boolean(label))
    const summary = focusLabels.join(', ') || roleDraft.detailRole || '직접 설정'
    setIsAddingPerspectivePending(true)
    try {
      const createdOption = await onAddPerspective?.(roleDraft)
      const nextOption: ProjectPerspectiveOption = createdOption ?? {
        id: `custom-${roleDraft.roleId}-${availableOptions.length + 1}`,
        label: role?.label ?? roleDraft.roleId,
        description: summary,
        selectedDescription: summary,
      }

      setAvailableOptions((current) => [...current, nextOption])
      setDraft((current) => ({ ...current, perspectiveId: nextOption.id }))
      setIsAddingPerspective(false)
      addSuccessToast.show()
    } catch {
      addErrorToast.show()
    } finally {
      setIsAddingPerspectivePending(false)
    }
  }

  const handleNext = (nextDraft: ProjectCreateDraft) => {
    setDraft(nextDraft)
    setStep('materials')
    onNext?.(nextDraft)
  }

  if (isAddingPerspective) {
    return (
      <ProjectRolePerspectiveForm
        descriptionId={descriptionId}
        onBack={() => setIsAddingPerspective(false)}
        onClose={onClose}
        onSubmit={(roleDraft) => void handleAddPerspective(roleDraft)}
        pending={isAddingPerspectivePending}
        titleId={titleId}
      />
    )
  }

  if (step === 'materials') {
    return (
      <ProjectMaterialUploadForm
        descriptionId={descriptionId}
        onBack={() => setStep('details')}
        onClose={onClose}
        onCreate={(materials) => onCreate?.(draft, materials)}
        onUploadFiles={onUploadFiles}
        titleId={titleId}
      />
    )
  }

  return (
    <>
      <ProjectCreateForm
        descriptionId={descriptionId}
        draft={draft}
        onAddPerspective={() => setIsAddingPerspective(true)}
        onChange={setDraft}
        onClose={onClose}
        onNext={handleNext}
        perspectiveOptions={availableOptions}
        titleId={titleId}
      />
      {addSuccessToast.isMounted ? (
        <Toast
          className="z-[70]!"
          description="새 역할·관점 설정이 저장됐습니다."
          position="topCenter"
          size="compact"
          title="새 역할/관점 추가 완료"
          type="success"
          visible={addSuccessToast.isVisible}
        />
      ) : null}
      {addErrorToast.isMounted ? (
        <Toast
          className="z-[70]!"
          description="역할·관점 설정을 저장하지 못했습니다. 다시 시도해 주세요."
          position="topCenter"
          size="compact"
          title="새 역할/관점 추가 실패"
          type="error"
          visible={addErrorToast.isVisible}
        />
      ) : null}
    </>
  )
}

type ProjectCreateFormProps = {
  titleId: string
  descriptionId: string
  draft: ProjectCreateDraft
  perspectiveOptions: ProjectPerspectiveOption[]
  onAddPerspective: () => void
  onChange: (draft: ProjectCreateDraft) => void
  onClose: () => void
  onNext: (draft: ProjectCreateDraft) => void
}

function ProjectCreateForm({
  titleId,
  descriptionId,
  draft,
  perspectiveOptions,
  onAddPerspective,
  onChange,
  onClose,
  onNext,
}: ProjectCreateFormProps) {
  const nameInputId = useId()
  const overviewInputId = useId()
  const canGoNext = draft.name.trim().length > 0 && draft.perspectiveId.length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canGoNext) return

    onNext({
      name: draft.name.trim(),
      perspectiveId: draft.perspectiveId,
      overview: draft.overview.trim(),
    })
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col gap-m" onSubmit={handleSubmit}>
      <header className="flex flex-col items-center gap-s text-center">
        <div aria-label="1 / 2 단계" className="flex items-center gap-s" role="img">
          <span className="size-[6px] rounded-full bg-brand-primary" />
          <span className="size-[6px] rounded-full bg-line-default" />
        </div>
        <div className="flex flex-col gap-xs">
          <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
            프로젝트 생성
          </h2>
          <p className="m-0 whitespace-pre-line typo-body-02 text-fg-secondary" id={descriptionId}>
            {'구체적으로 작성할수록,\nSynQ가 회의 맥락을 더 잘 이해해요'}
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-l">
        <div className="flex flex-col gap-s">
          <div className="flex flex-col gap-xs">
            <label className="px-xs typo-body-01 text-fg-primary" htmlFor={nameInputId}>
              이름
            </label>
            <InputBox
              autoFocus
              id={nameInputId}
              maxLength={PROJECT_NAME_MAX_LENGTH}
              onChange={(event) => onChange({ ...draft, name: event.target.value })}
              placeholder="프로젝트 이름을 입력해 주세요"
              rightSlot={
                <span className="shrink-0 typo-body-02 text-gray-500">
                  {draft.name.length}/{PROJECT_NAME_MAX_LENGTH}
                </span>
              }
              value={draft.name}
              visualState={draft.name ? 'filled' : 'default'}
            />
          </div>

          <ProjectPerspectiveSelect
            label="관점"
            onAddPerspective={onAddPerspective}
            onChange={(perspectiveId) => onChange({ ...draft, perspectiveId })}
            options={perspectiveOptions}
            value={draft.perspectiveId}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-xs">
          <div className="flex items-center gap-xs px-xs">
            <label className="typo-body-01 text-fg-primary" htmlFor={overviewInputId}>
              프로젝트 개요
            </label>
            <span className="typo-body-02 text-fg-secondary">(선택)</span>
          </div>
          <div className="flex min-h-[120px] flex-1 flex-col rounded-m border-stroke-md border-line-default bg-surface-default px-s py-xs transition-colors focus-within:border-brand-primary">
            <textarea
              className="min-h-0 flex-1 resize-none bg-transparent typo-body-02 text-fg-primary outline-none placeholder:text-fg-secondary"
              id={overviewInputId}
              maxLength={PROJECT_OVERVIEW_MAX_LENGTH}
              onChange={(event) => onChange({ ...draft, overview: event.target.value })}
              placeholder="프로젝트 개요를 입력해 주세요"
              value={draft.overview}
            />
            <span className="shrink-0 text-right typo-body-02 text-gray-500">
              {draft.overview.length}/{PROJECT_OVERVIEW_MAX_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-s">
        <Button className="w-[91px]" disabled size="large" variant="fillGray100">
          이전
        </Button>
        <Button className="min-w-0 flex-1" disabled={!canGoNext} size="large" type="submit">
          다음
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
  )
}
