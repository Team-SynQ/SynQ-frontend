import { useId, useState, type FormEvent } from 'react'

import type { ProjectSummary } from '../../../entities/project'
import {
  projectFocusOptions,
  projectRoleOptions,
  ProjectRolePerspectiveForm,
  type ProjectRolePerspectiveDraft,
} from '../../../features/project-create'
import chevronDownIcon from '../../../shared/assets/icons/chevron-down.svg'
import closeIcon from '../../../shared/assets/icons/close.svg'
import plusIcon from '../../../shared/assets/icons/plus.svg'
import { cn } from '../../../shared/lib/cn'
import { Button, InputBox, OverlayDialog } from '../../../shared/ui'

const PROJECT_NAME_MAX_LENGTH = 50
const PROJECT_OVERVIEW_MAX_LENGTH = 500

export type ProjectInformationPerspective = { label: string; description: string }
export type ProjectInformationDraft = {
  name: string
  overview: string
  perspectiveLabel: string
  perspectiveDescription: string
}

type Props = {
  open: boolean
  project: ProjectSummary
  perspectiveOptions?: ProjectInformationPerspective[]
  onClose: () => void
  onSave: (draft: ProjectInformationDraft) => Promise<void> | void
}

export function ProjectInformationEditDialog({ open, ...props }: Props) {
  const titleId = useId()
  const descriptionId = useId()
  return (
    <OverlayDialog
      className="relative h-[680px] max-h-[calc(100dvh-48px)] max-w-[460px] gap-m px-m py-l shadow-floating"
      closeOnEscape
      descriptionId={descriptionId}
      onClose={props.onClose}
      open={open}
      titleId={titleId}
    >
      {open ? (
        <ProjectInformationEditForm {...props} descriptionId={descriptionId} titleId={titleId} />
      ) : null}
    </OverlayDialog>
  )
}

type FormProps = Omit<Props, 'open'> & { titleId: string; descriptionId: string }

function ProjectInformationEditForm({
  titleId,
  descriptionId,
  project,
  perspectiveOptions = [],
  onClose,
  onSave,
}: FormProps) {
  const nameInputId = useId()
  const overviewInputId = useId()
  const [isAddingPerspective, setIsAddingPerspective] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draft, setDraft] = useState<ProjectInformationDraft>({
    name: project.name,
    overview: project.overview,
    perspectiveLabel: project.perspectiveLabel,
    perspectiveDescription: project.perspectiveDescription,
  })
  const [perspectives, setPerspectives] = useState(() => {
    const current = { label: project.perspectiveLabel, description: project.perspectiveDescription }
    return [
      current,
      ...perspectiveOptions.filter(
        (option) => option.label !== current.label || option.description !== current.description,
      ),
    ]
  })
  const canSave = draft.name.trim().length > 0 && !isSubmitting

  const handleAddPerspective = (roleDraft: ProjectRolePerspectiveDraft) => {
    const role = projectRoleOptions.find((option) => option.id === roleDraft.roleId)
    const description =
      roleDraft.focusIds
        .map((focusId) => projectFocusOptions.find((option) => option.id === focusId)?.label)
        .filter((label): label is string => Boolean(label))
        .join(', ') ||
      roleDraft.detailRole ||
      '직접 설정'
    const perspective = { label: role?.label ?? roleDraft.roleId, description }
    setPerspectives((current) => [...current, perspective])
    setDraft((current) => ({
      ...current,
      perspectiveLabel: perspective.label,
      perspectiveDescription: perspective.description,
    }))
    setIsAddingPerspective(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSave) return
    setIsSubmitting(true)
    try {
      await onSave({ ...draft, name: draft.name.trim(), overview: draft.overview.trim() })
      onClose()
    } catch {
      // The parent shows the Figma error toast and keeps this form open for retry.
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAddingPerspective) {
    return (
      <ProjectRolePerspectiveForm
        backLabel="프로젝트 설정으로 돌아가기"
        closeLabel="프로젝트 설정 닫기"
        descriptionId={descriptionId}
        onBack={() => setIsAddingPerspective(false)}
        onClose={onClose}
        onSubmit={handleAddPerspective}
        titleId={titleId}
      />
    )
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col gap-m" onSubmit={handleSubmit}>
      <header className="flex flex-col items-center gap-xs text-center">
        <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
          프로젝트 설정
        </h2>
        <p className="m-0 whitespace-pre-line typo-body-02 text-fg-secondary" id={descriptionId}>
          {'변경된 내용은 AI 힌트, AI Chat 추천 질문, 회의 후\n개별 정리에 우선 반영됩니다.'}
        </p>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-l">
        <div className="flex flex-col gap-s">
          <div className="flex flex-col gap-xs">
            <label className="px-xs typo-body-01 text-fg-primary" htmlFor={nameInputId}>
              이름
            </label>
            <InputBox
              aria-label="이름"
              autoFocus
              id={nameInputId}
              maxLength={PROJECT_NAME_MAX_LENGTH}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              rightSlot={
                <span className="shrink-0 typo-body-02 text-gray-500">
                  {draft.name.length}/{PROJECT_NAME_MAX_LENGTH}
                </span>
              }
              value={draft.name}
              visualState="filled"
            />
          </div>
          <PerspectiveSelect
            onAdd={() => setIsAddingPerspective(true)}
            onChange={(perspective) =>
              setDraft((current) => ({
                ...current,
                perspectiveLabel: perspective.label,
                perspectiveDescription: perspective.description,
              }))
            }
            options={perspectives}
            value={{ label: draft.perspectiveLabel, description: draft.perspectiveDescription }}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-xs">
          <div className="flex items-center gap-xs px-xs">
            <label className="typo-body-01 text-fg-primary" htmlFor={overviewInputId}>
              프로젝트 개요
            </label>
            <span className="typo-body-02 text-fg-secondary">(선택)</span>
          </div>
          <div className="flex min-h-[200px] flex-1 flex-col rounded-m border-stroke-md border-line-default bg-surface-default px-s py-xs transition-colors focus-within:border-brand-primary">
            <textarea
              className="min-h-0 flex-1 resize-none bg-transparent typo-body-02 text-fg-primary outline-none"
              id={overviewInputId}
              maxLength={PROJECT_OVERVIEW_MAX_LENGTH}
              onChange={(event) =>
                setDraft((current) => ({ ...current, overview: event.target.value }))
              }
              value={draft.overview}
            />
            <span className="shrink-0 text-right typo-body-02 text-gray-500">
              {draft.overview.length}/{PROJECT_OVERVIEW_MAX_LENGTH}
            </span>
          </div>
        </div>
      </div>
      <Button
        aria-busy={isSubmitting}
        className="w-full"
        disabled={!canSave}
        size="large"
        type="submit"
      >
        {isSubmitting ? '저장 중...' : '저장하기'}
      </Button>
      <Button
        aria-label="프로젝트 설정 닫기"
        className="absolute right-[15px] top-[15px] size-[42px] px-0"
        onClick={onClose}
        size="medium"
        variant="basic"
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-[24px]"
          height="24"
          src={closeIcon}
          width="24"
        />
      </Button>
    </form>
  )
}

type PerspectiveSelectProps = {
  options: ProjectInformationPerspective[]
  value: ProjectInformationPerspective
  onAdd: () => void
  onChange: (value: ProjectInformationPerspective) => void
}

function PerspectiveSelect({ options, value, onAdd, onChange }: PerspectiveSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const listboxId = useId()
  return (
    <div className="relative flex w-full flex-col gap-xs">
      <span className="px-xs typo-body-01 text-fg-primary">관점</span>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex h-[42px] w-full items-center gap-xs rounded-m border-stroke-md bg-surface-default px-s text-left transition-colors',
          isOpen ? 'border-brand-primary' : 'border-line-default',
        )}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="shrink-0 truncate typo-body-02 text-fg-primary">{value.label}</span>
        <span className="min-w-0 flex-1 truncate typo-body-02 text-fg-secondary">
          {value.description}
        </span>
        <img
          alt=""
          aria-hidden="true"
          className={cn('size-[28px] shrink-0 transition-transform', isOpen && 'rotate-180')}
          height="28"
          src={chevronDownIcon}
          width="28"
        />
      </button>
      {isOpen ? (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-20 flex w-full flex-col rounded-m border-stroke-md border-brand-primary bg-surface-default px-s shadow-floating"
          id={listboxId}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              aria-selected={
                option.label === value.label && option.description === value.description
              }
              className={cn(
                'flex min-h-[52px] w-full items-center gap-xs text-left',
                index > 0 && 'border-t-stroke-md border-line-default',
              )}
              key={`${option.label}-${option.description}`}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              role="option"
              type="button"
            >
              <span className="shrink-0 typo-body-02 text-fg-primary">{option.label}</span>
              <span className="min-w-0 flex-1 truncate typo-body-02 text-fg-secondary">
                {option.description}
              </span>
            </button>
          ))}
          <Button
            aria-label="관점 추가"
            className="h-[40px] w-full border-t-stroke-md border-line-default px-0"
            onClick={() => {
              setIsOpen(false)
              onAdd()
            }}
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
      ) : null}
    </div>
  )
}
