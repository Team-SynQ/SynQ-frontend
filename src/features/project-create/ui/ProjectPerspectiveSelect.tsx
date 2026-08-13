import { useId, useState } from 'react'

import chevronDownIcon from '../../../shared/assets/icons/chevron-down.svg'
import plusIcon from '../../../shared/assets/icons/plus.svg'
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'

import type { ProjectPerspectiveOption } from '../model/projectCreate.types'

type ProjectPerspectiveSelectProps = {
  label: string
  options: ProjectPerspectiveOption[]
  value: string
  onAddPerspective?: () => void
  onChange: (value: string) => void
}

export function ProjectPerspectiveSelect({
  label,
  options,
  value,
  onAddPerspective,
  onChange,
}: ProjectPerspectiveSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const listboxId = useId()
  const selectedOption = options.find((option) => option.id === value) ?? options[0]

  const handleSelect = (optionId: string) => {
    onChange(optionId)
    setIsOpen(false)
  }

  const handleAddPerspective = () => {
    setIsOpen(false)
    onAddPerspective?.()
  }

  return (
    <div className="relative flex w-full flex-col gap-xs">
      <span className="px-xs typo-body-01 text-fg-primary">{label}</span>
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
        {selectedOption ? (
          <>
            <span className="shrink-0 truncate typo-body-02 text-fg-primary">
              {selectedOption.label}
            </span>
            <span className="min-w-0 flex-1 truncate typo-body-02 text-fg-secondary">
              {selectedOption.selectedDescription}
            </span>
          </>
        ) : (
          // 프로필을 아직 불러오지 못했거나 등록한 관점이 없는 경우입니다. 관점 추가로 만들 수 있습니다.
          <span className="min-w-0 flex-1 truncate typo-body-02 text-fg-secondary">
            아래 관점 추가로 역할·관점을 만들어 주세요
          </span>
        )}
        <img
          alt=""
          aria-hidden="true"
          className={cn('size-[28px] shrink-0 transition-transform', isOpen && 'rotate-180')}
          src={chevronDownIcon}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 top-[calc(100%+16px)] z-20 flex w-full flex-col rounded-m border-stroke-md border-brand-primary bg-surface-default px-s shadow-floating"
          id={listboxId}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              aria-selected={option.id === value}
              className={cn(
                'flex h-[52px] w-full items-center gap-xs text-left',
                index > 0 && 'border-t-stroke-md border-line-default',
              )}
              key={option.id}
              onClick={() => handleSelect(option.id)}
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
            onClick={handleAddPerspective}
            size="small"
            variant="basic"
          >
            <img alt="" aria-hidden="true" className="size-[24px]" src={plusIcon} />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
