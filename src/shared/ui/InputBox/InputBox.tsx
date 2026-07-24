import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type InputBoxSize = 'large' | 'medium' | 'default'
export type InputBoxState = 'default' | 'hover' | 'active' | 'error' | 'disabled' | 'filled'

type InputBoxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: InputBoxSize
  visualState?: InputBoxState
  label?: string
  helperText?: string
  errorText?: string
  leftSlot?: ReactNode
  rightSlot?: ReactNode
}

const sizeClasses: Record<InputBoxSize, string> = {
  large: 'h-[52px] typo-body-01',
  medium: 'h-[42px] typo-body-02',
  default: 'h-[42px] typo-body-02',
}

const stateClasses: Record<InputBoxState, string> = {
  default: 'border-line-default bg-surface-default text-fg-secondary',
  hover: 'border-line-default bg-surface-default text-fg-secondary',
  active: 'border-brand-primary bg-surface-default text-fg-primary',
  error: 'border-semantic-error bg-surface-default text-fg-primary',
  disabled: 'border-line-default bg-line-default text-fg-inverse',
  filled: 'border-line-default bg-surface-default text-fg-primary',
}

export function InputBox({
  size = 'medium',
  visualState = 'default',
  label,
  helperText,
  errorText,
  leftSlot,
  rightSlot,
  disabled,
  className,
  ...props
}: InputBoxProps) {
  const state = disabled ? 'disabled' : errorText ? 'error' : visualState

  return (
    <label className={cn('flex w-full flex-col gap-xs', className)}>
      {label ? <span className="typo-body-02 text-fg-primary">{label}</span> : null}
      <span
        className={cn(
          'flex items-center gap-xs rounded-m border-stroke-md px-s transition-colors focus-within:border-brand-primary focus-within:bg-surface-default',
          sizeClasses[size],
          stateClasses[state],
        )}
      >
        {leftSlot}
        <input
          className="min-w-0 flex-1 bg-transparent text-current outline-none placeholder:text-fg-secondary disabled:cursor-not-allowed disabled:placeholder:text-fg-inverse"
          disabled={disabled}
          {...props}
        />
        {rightSlot}
      </span>
      {errorText ? (
        <span className="typo-caption text-semantic-error">{errorText}</span>
      ) : helperText ? (
        <span className="typo-caption text-fg-secondary">{helperText}</span>
      ) : null}
    </label>
  )
}
