import { useState, type FormEvent } from 'react'

import { cn } from '../../../shared/lib/cn'
import { Button, Checkbox } from '../../../shared/ui'
import {
  accountFocusOptions,
  accountRoleOptions,
  type AccountFocusTag,
  type AccountRoleLabel,
} from '../model/accountPerspectiveOptions'
import type { AccountPerspectiveDraft } from '../model/accountSettings.types'

const DETAIL_ROLE_MAX_LENGTH = 30
const MAX_FOCUS_TAGS = 3

export type AccountPerspectiveFormProps = {
  initialValue?: AccountPerspectiveDraft
  onCancel: () => void
  onSubmit: (perspective: AccountPerspectiveDraft) => Promise<void> | void
  submitLabel: string
}

export function AccountPerspectiveForm({
  initialValue,
  onCancel,
  onSubmit,
  submitLabel,
}: AccountPerspectiveFormProps) {
  const initialRole = accountRoleOptions.find(
    ({ label }) => label === initialValue?.roleLabel,
  )?.label
  const initialDetailRole = initialValue?.detailRole ?? ''
  const initialFocusTags = (initialValue?.focusTags ?? []).filter(isAccountFocusTag)
  const [roleLabel, setRoleLabel] = useState<AccountRoleLabel | undefined>(initialRole)
  const [detailRole, setDetailRole] = useState(initialDetailRole)
  const [focusTags, setFocusTags] = useState<AccountFocusTag[]>(initialFocusTags)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedDetailRole = detailRole.trim()
  const changed =
    roleLabel !== initialValue?.roleLabel ||
    normalizedDetailRole !== initialDetailRole ||
    focusTags.join('|') !== initialFocusTags.join('|')
  const canSubmit = Boolean(roleLabel) && focusTags.length > 0 && changed && !isSubmitting

  const toggleFocusTag = (tag: AccountFocusTag) => {
    setFocusTags((current) => {
      if (current.includes(tag)) return current.filter((currentTag) => currentTag !== tag)
      if (current.length >= MAX_FOCUS_TAGS) return current
      return accountFocusOptions.filter(
        (option): option is AccountFocusTag => current.includes(option) || option === tag,
      )
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    const role = accountRoleOptions.find(({ label }) => label === roleLabel)
    if (!role) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        detailRole: normalizedDetailRole || undefined,
        focusDescription: focusTags.join(', '),
        focusTags,
        icon: role.icon,
        roleLabel: role.label,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="flex h-[550px] min-h-0 w-[412px] flex-col gap-m"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-m overflow-y-auto">
        <fieldset className="m-0 flex shrink-0 flex-col gap-xs border-0 p-0">
          <legend className="mb-xs typo-body-01 text-fg-primary">역할 선택</legend>
          <div className="grid grid-cols-4 gap-s">
            {accountRoleOptions.map((role) => {
              const selected = role.label === roleLabel
              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    'flex h-[86px] w-[91px] flex-col items-center gap-xs rounded-m border-stroke-md bg-surface-default p-xs transition-colors',
                    selected
                      ? 'border-brand-primary shadow-[0_4px_8px_rgb(0_144_255/0.12)]'
                      : 'border-line-default hover:bg-surface-muted',
                  )}
                  key={role.label}
                  onClick={() => setRoleLabel(role.label)}
                  type="button"
                >
                  <span className="h-[40px] w-[75px] overflow-hidden rounded-xs bg-surface-muted">
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

        <label className="flex shrink-0 flex-col gap-xs">
          <span className="flex items-center gap-xs px-xs">
            <span className="typo-body-01 text-fg-primary">세부 역할</span>
            <span className="typo-body-02 text-fg-secondary">선택</span>
          </span>
          <span className="flex h-[102px] flex-col rounded-m border-stroke-md border-line-default bg-surface-default px-s py-xs focus-within:border-brand-primary">
            <textarea
              aria-label="세부 역할"
              className="min-h-0 flex-1 resize-none bg-transparent typo-body-02 text-fg-primary outline-none placeholder:text-fg-secondary"
              maxLength={DETAIL_ROLE_MAX_LENGTH}
              onChange={(event) => setDetailRole(event.target.value)}
              placeholder="세부역할이 있다면 입력해 주세요. ex) 제품 기획자"
              value={detailRole}
            />
            <span aria-hidden="true" className="text-right typo-body-02 text-gray-500">
              {detailRole.length}/{DETAIL_ROLE_MAX_LENGTH}
            </span>
          </span>
        </label>

        <fieldset className="m-0 flex shrink-0 flex-col gap-xs border-0 p-0">
          <legend className="mb-xs flex items-center gap-xs px-xs">
            <span className="typo-body-01 text-fg-primary">관점 선택</span>
            <span className="typo-body-02 text-fg-secondary">선택 · 최대 3개</span>
          </legend>
          <div className="grid grid-cols-2 gap-s">
            {accountFocusOptions.map((tag) => {
              const checked = focusTags.includes(tag)
              return (
                <Checkbox
                  checked={checked}
                  className={cn(
                    'h-[42px] w-[198px] gap-s rounded-m border-stroke-md px-s transition-colors',
                    checked
                      ? 'border-brand-primary shadow-[0_4px_8px_rgb(0_144_255/0.12)]'
                      : 'border-line-default',
                  )}
                  disabled={!checked && focusTags.length >= MAX_FOCUS_TAGS}
                  key={tag}
                  label={tag}
                  onChange={() => toggleFocusTag(tag)}
                />
              )
            })}
          </div>
        </fieldset>
      </div>

      <div className="flex w-full shrink-0 gap-s">
        <Button
          className="w-[91px]"
          disabled={isSubmitting}
          onClick={onCancel}
          size="large"
          variant="fillGray100"
        >
          취소
        </Button>
        <Button className="min-w-0 flex-1" disabled={!canSubmit} size="large" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function isAccountFocusTag(value: string): value is AccountFocusTag {
  return accountFocusOptions.some((option) => option === value)
}
