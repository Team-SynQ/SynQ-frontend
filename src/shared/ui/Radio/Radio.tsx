import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

export function Radio({ label, className, disabled, ...props }: RadioProps) {
  return (
    <label className={cn('inline-flex items-center gap-xs typo-body-02 text-fg-primary', disabled && 'text-fg-secondary', className)}>
      <input className="peer sr-only" disabled={disabled} type="radio" {...props} />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-[16px] shrink-0 items-center justify-center rounded-full border-stroke-md border-line-strong bg-surface-default transition-colors',
          'peer-checked:border-brand-primary peer-checked:[&>span]:block',
          'peer-disabled:border-line-default peer-disabled:bg-line-default',
        )}
      >
        <span className="hidden size-[8px] rounded-full bg-brand-primary" />
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  )
}
