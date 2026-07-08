import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type ToastType = 'success' | 'error'
export type ToastPosition = 'topRight' | 'bottomRight' | 'topCenter' | 'bottomCenter'
export type ToastSize = 'default' | 'compact'

type ToastProps = {
  type?: ToastType
  size?: ToastSize
  title: string
  description?: string
  autoClose?: boolean
  position?: ToastPosition
  icon?: ReactNode
  className?: string
}

const typeClasses: Record<ToastType, string> = {
  success: 'border-semantic-success',
  error: 'border-semantic-error',
}

const iconClasses: Record<ToastType, string> = {
  success: 'bg-semantic-success',
  error: 'bg-semantic-error',
}

const positionClasses: Record<ToastPosition, string> = {
  topRight: 'right-m top-m',
  bottomRight: 'bottom-m right-m',
  topCenter: 'left-1/2 top-m -translate-x-1/2',
  bottomCenter: 'bottom-m left-1/2 -translate-x-1/2',
}

const sizeClasses: Record<ToastSize, string> = {
  default: 'min-h-[118px] w-full max-w-[460px] gap-m p-m',
  compact: 'min-h-[100px] w-full max-w-[380px] gap-m p-m',
}

const iconSizeClasses: Record<ToastSize, string> = {
  default: 'size-[70px]',
  compact: 'size-[48px]',
}

export function Toast({
  type = 'success',
  size = 'default',
  title,
  description,
  autoClose = true,
  position = 'topRight',
  icon,
  className,
}: ToastProps) {
  return (
    <div className={cn('fixed z-50 flex w-[calc(100%-32px)] max-w-[460px]', positionClasses[position], className)}>
      <section
        aria-live={type === 'error' ? 'assertive' : 'polite'}
        className={cn(
          'flex items-center rounded-l border-stroke-md bg-surface-default shadow-toast',
          typeClasses[type],
          sizeClasses[size],
        )}
        data-auto-close={autoClose}
        role="status"
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full text-fg-inverse',
            iconClasses[type],
            iconSizeClasses[size],
          )}
        >
          {icon ?? <ToastIcon type={type} />}
        </span>
        <span className="flex min-w-0 flex-col gap-xs">
          <strong className={cn('text-fg-primary', size === 'compact' ? 'typo-title-02' : 'typo-title-01')}>{title}</strong>
          {description ? <span className={cn('text-fg-secondary', size === 'compact' ? 'typo-body-02' : 'typo-body-01')}>{description}</span> : null}
        </span>
      </section>
    </div>
  )
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'error') {
    return (
      <svg className="size-[24px]" fill="none" viewBox="0 0 24 24">
        <path d="M12 7v6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <path d="M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    )
  }

  return (
    <svg className="size-[28px]" fill="none" viewBox="0 0 28 28">
      <path d="m7 14 5 5 9-10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
    </svg>
  )
}
