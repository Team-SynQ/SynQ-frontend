import { useCallback, useId, useRef, useState } from 'react'

import chevronDownIcon from '../../../shared/assets/icons/chevron-down.svg'
import plusIcon from '../../../shared/assets/icons/plus.svg'
import { cn } from '../../../shared/lib/cn'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'
import { Button } from '../../../shared/ui'
import type { ProjectInformationPerspective } from '../model/projectInformation.types'
type ProjectInformationPerspectiveSelectProps = {
  options: ProjectInformationPerspective[]
  value: ProjectInformationPerspective
  onAdd: () => void
  onChange: (value: ProjectInformationPerspective) => void
}

export function ProjectInformationPerspectiveSelect({ options, value, onAdd, onChange }: ProjectInformationPerspectiveSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const listboxId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeListbox = useCallback(() => setIsOpen(false), [])
  const listboxRef = useDismissableLayer<HTMLDivElement>({
    open: isOpen,
    onDismiss: closeListbox,
    restoreFocusOnDismiss: false,
    triggerRef,
  })
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
        ref={triggerRef}
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
          ref={listboxRef}
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
                closeListbox()
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
              closeListbox()
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
