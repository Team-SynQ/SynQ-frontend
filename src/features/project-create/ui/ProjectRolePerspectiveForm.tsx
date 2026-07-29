import { useId, useState, type FormEvent } from 'react'

import chevronLeftIcon from '../../../shared/assets/icons/chevron-left.svg'
import closeIcon from '../../../shared/assets/icons/close.svg'
import { cn } from '../../../shared/lib/cn'
import { Button, Checkbox } from '../../../shared/ui'

import { projectFocusOptions, projectRoleOptions } from '../model/projectPerspective.config'
import type { ProjectRolePerspectiveDraft } from '../model/projectCreate.types'

const DETAIL_ROLE_MAX_LENGTH = 30
const MAX_FOCUS_COUNT = 3

type ProjectRolePerspectiveFormProps = {
  titleId: string
  descriptionId: string
  backLabel?: string
  closeLabel?: string
  onBack: () => void
  onClose: () => void
  onSubmit: (draft: ProjectRolePerspectiveDraft) => void
}

export function ProjectRolePerspectiveForm({
  titleId,
  descriptionId,
  backLabel = '프로젝트 생성으로 돌아가기',
  closeLabel = '프로젝트 생성 닫기',
  onBack,
  onClose,
  onSubmit,
}: ProjectRolePerspectiveFormProps) {
  const detailRoleInputId = useId()
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [detailRole, setDetailRole] = useState('')
  const [selectedFocusIds, setSelectedFocusIds] = useState<string[]>([])
  const isDetailRequired = selectedRoleId === 'etc'
  const canSubmit = selectedRoleId.length > 0 && (!isDetailRequired || detailRole.trim().length > 0)

  const handleToggleFocus = (focusId: string) => {
    setSelectedFocusIds((current) => {
      if (current.includes(focusId)) {
        return current.filter((id) => id !== focusId)
      }

      return current.length < MAX_FOCUS_COUNT ? [...current, focusId] : current
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    onSubmit({
      roleId: selectedRoleId,
      detailRole: detailRole.trim(),
      focusIds: selectedFocusIds,
    })
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col gap-m" onSubmit={handleSubmit}>
      <header className="flex h-[42px] shrink-0 items-center justify-between">
        <Button
          aria-label={backLabel}
          className="size-[42px] px-0"
          onClick={onBack}
          size="medium"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={chevronLeftIcon} />
        </Button>
        <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
          새 역할/관점 추가
        </h2>
        <span aria-hidden="true" className="size-[42px]" />
      </header>

      <p className="sr-only" id={descriptionId}>
        프로젝트에 사용할 역할과 관점을 추가합니다.
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-m pb-m">
          <fieldset className="flex flex-col gap-xs">
            <legend className="typo-body-01 text-fg-primary">역할 선택</legend>
            <div className="grid grid-cols-4 gap-s">
              {projectRoleOptions.map((role) => {
                const isSelected = selectedRoleId === role.id

                return (
                  <button
                    aria-pressed={isSelected}
                    className={cn(
                      'flex h-[86px] w-[91px] flex-col items-center gap-xs rounded-m border-stroke-md bg-surface-default p-xs transition-colors',
                      isSelected ? 'border-brand-primary shadow-floating' : 'border-line-default',
                    )}
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    type="button"
                  >
                    <span className="flex h-[40px] w-[75px] items-center justify-center overflow-hidden rounded-xs bg-surface-muted">
                      <img
                        alt=""
                        aria-hidden="true"
                        className="h-[40px] w-[75px] object-contain"
                        height="40"
                        src={role.icon}
                        width="75"
                      />
                    </span>
                    <span className="typo-caption text-fg-primary">{role.label}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-xs px-xs">
              <label className="typo-body-01 text-fg-primary" htmlFor={detailRoleInputId}>
                세부 역할
              </label>
              {isDetailRequired ? (
                <span aria-label="필수" className="typo-body-02 text-brand-primary">
                  *
                </span>
              ) : (
                <span className="typo-body-02 text-fg-secondary">선택</span>
              )}
            </div>
            <div className="flex h-[102px] flex-col rounded-m border-stroke-md border-line-default bg-surface-default px-s py-xs transition-colors focus-within:border-brand-primary">
              <textarea
                aria-required={isDetailRequired}
                className="min-h-0 flex-1 resize-none bg-transparent typo-body-02 text-fg-primary outline-none placeholder:text-fg-secondary"
                id={detailRoleInputId}
                maxLength={DETAIL_ROLE_MAX_LENGTH}
                onChange={(event) => setDetailRole(event.target.value)}
                placeholder="세부역할이 있다면 입력해 주세요. ex) 제품 기획자"
                required={isDetailRequired}
                value={detailRole}
              />
              <span className="text-right typo-body-02 text-gray-500">
                {detailRole.length}/{DETAIL_ROLE_MAX_LENGTH}
              </span>
            </div>
          </div>

          <fieldset className="flex flex-col gap-xs">
            <legend className="flex items-center gap-xs px-xs">
              <span className="typo-body-01 text-fg-primary">관점 선택</span>
              <span className="typo-body-02 text-fg-secondary">
                선택 · 최대 {MAX_FOCUS_COUNT}개
              </span>
            </legend>
            <div className="grid grid-cols-2 gap-s">
              {projectFocusOptions.map((focus) => {
                const isChecked = selectedFocusIds.includes(focus.id)
                const isDisabled = !isChecked && selectedFocusIds.length >= MAX_FOCUS_COUNT

                return (
                  <Checkbox
                    checked={isChecked}
                    className="h-[42px] w-[198px] gap-s rounded-m border-stroke-md border-line-default bg-surface-default px-s"
                    disabled={isDisabled}
                    key={focus.id}
                    label={focus.label}
                    onChange={() => handleToggleFocus(focus.id)}
                  />
                )
              })}
            </div>
          </fieldset>
        </div>
      </div>

      <Button disabled={!canSubmit} fullWidth size="large" type="submit">
        새 역할/관점 추가
      </Button>

      <Button
        aria-label={closeLabel}
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
