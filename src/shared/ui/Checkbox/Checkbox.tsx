import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn('inline-flex items-center gap-xs typo-body-02 text-fg-primary', className)}>
      <input className="size-4.5 accent-brand-primary" type="checkbox" {...props} />
      {label ? <span>{label}</span> : null}
    </label>
  )
}
