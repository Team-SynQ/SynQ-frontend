import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type ButtonVariant = 'primaryFill' | 'primaryLine' | 'fillGray100' | 'basic'
export type ButtonSize = 'large' | 'medium' | 'small'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primaryFill:
    'bg-brand-primary text-fg-inverse hover:bg-brand-primary-hover active:bg-brand-primary-active disabled:bg-line-default disabled:text-fg-inverse',
  primaryLine:
    'border-stroke-md border-primary-300 bg-surface-elevated text-brand-primary hover:bg-primary-100 active:bg-primary-200 disabled:border-line-default disabled:bg-line-default disabled:text-fg-inverse',
  fillGray100:
    'border-stroke-md border-line-default bg-surface-elevated text-fg-primary hover:bg-gray-100 active:bg-overlay-dark-08 disabled:border-line-default disabled:bg-line-default disabled:text-fg-inverse',
  basic:
    'bg-transparent text-fg-primary hover:bg-overlay-dark-02 active:bg-overlay-dark-08 disabled:text-fg-secondary disabled:opacity-40',
}

const sizeClasses: Record<ButtonSize, string> = {
  large: 'h-[52px] rounded-m px-s typo-body-01',
  medium: 'h-[42px] rounded-[10px] px-s typo-body-02',
  small: 'h-[34px] rounded-s px-s typo-caption',
}

export function Button({
  variant = 'primaryFill',
  size = 'medium',
  leftIcon,
  rightIcon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-xs whitespace-nowrap transition-colors disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  )
}
