import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

export function Radio({ label, className, ...props }: RadioProps) {
  return (
    <label className={cn('inline-flex items-center gap-xs typo-body-02 text-fg-primary', className)}>
      <input className="size-[16px] accent-brand-primary" type="radio" {...props} />
      {label ? <span>{label}</span> : null}
    </label>
  )
}
