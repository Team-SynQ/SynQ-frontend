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
  large: 'h-[52px]',
  medium: 'h-[42px]',
  default: 'h-[42px]',
}

const stateClasses: Record<InputBoxState, string> = {
  default: 'border-line-strong bg-surface-elevated',
  hover: 'border-line-default bg-gray-100',
  active: 'border-brand-primary bg-primary-100',
  error: 'border-semantic-error bg-surface-elevated',
  disabled: 'border-line-default bg-line-default text-fg-secondary',
  filled: 'border-line-strong bg-surface-elevated',
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
          'flex items-center gap-xs rounded-m border-stroke-md px-s transition-colors focus-within:border-brand-primary focus-within:bg-primary-100',
          sizeClasses[size],
          stateClasses[state],
        )}
      >
        {leftSlot}
        <input
          className="min-w-0 flex-1 bg-transparent typo-body-02 text-fg-primary outline-none placeholder:text-fg-secondary disabled:cursor-not-allowed"
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
