import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

export function Checkbox({ label, className, disabled, ...props }: CheckboxProps) {
  return (
    <label className={cn('inline-flex items-center gap-xs typo-body-02 text-fg-primary', disabled && 'text-fg-secondary', className)}>
      <input className="peer sr-only" disabled={disabled} type="checkbox" {...props} />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-[18px] shrink-0 items-center justify-center rounded-[2px] border-stroke-md border-line-strong bg-surface-default text-fg-inverse transition-colors',
          'peer-checked:border-brand-primary peer-checked:bg-brand-primary peer-checked:[&>svg]:block',
          'peer-disabled:border-line-default peer-disabled:bg-line-default',
        )}
      >
        <svg className="hidden size-[12px]" fill="none" viewBox="0 0 12 12">
          <path d="M2.5 6.2 5 8.5 9.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  )
}
