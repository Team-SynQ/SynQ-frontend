import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type ButtonVariant = 'primaryFill' | 'primaryLine' | 'fillGray100' | 'basic'
export type ButtonSize = 'large' | 'medium' | 'small'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primaryFill:
    'bg-brand-primary text-fg-inverse hover:bg-brand-primary-hover active:bg-brand-primary-active disabled:bg-line-default disabled:text-fg-inverse',
  primaryLine:
    'border-stroke-md border-primary-300 bg-surface-default text-brand-primary hover:bg-primary-100 active:bg-primary-200 disabled:border-line-default disabled:bg-line-default disabled:text-fg-inverse',
  fillGray100:
    'border-stroke-md border-line-default bg-surface-default text-gray-700 hover:bg-surface-muted active:bg-overlay-dark-08 disabled:border-line-default disabled:bg-line-default disabled:text-fg-inverse',
  basic:
    'bg-transparent text-fg-secondary hover:bg-overlay-dark-02 hover:text-gray-700 active:bg-overlay-dark-08 disabled:text-line-default disabled:opacity-100',
}

const sizeClasses: Record<ButtonSize, string> = {
  large: 'h-[52px] rounded-m typo-title-02',
  medium: 'h-[42px] rounded-[10px] typo-body-01',
  small: 'h-[32px] rounded-[var(--radius-s)] typo-body-02',
}

const basicSizeClasses: Record<ButtonSize, string> = {
  large: 'rounded-xs',
  medium: 'rounded-xs',
  small: 'rounded-xs',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primaryFill',
    size = 'medium',
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const hasHorizontalPaddingOverride = className
    ?.split(/\s+/)
    .some((classToken) => classToken.startsWith('px-'))

  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-xs whitespace-nowrap transition-colors disabled:cursor-not-allowed',
        fullWidth && 'w-full',
        variantClasses[variant],
        sizeClasses[size],
        !hasHorizontalPaddingOverride && 'px-s',
        variant === 'basic' && basicSizeClasses[size],
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    >
      {leftIcon}
      {children ? <span>{children}</span> : null}
      {rightIcon}
    </button>
  )
})
