import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type ToastType = 'success' | 'error'
export type ToastPosition = 'topRight' | 'bottomRight' | 'topCenter' | 'bottomCenter'

type ToastProps = {
  type?: ToastType
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
  topRight: 'items-end justify-start',
  bottomRight: 'items-end justify-end',
  topCenter: 'items-center justify-start',
  bottomCenter: 'items-center justify-end',
}

export function Toast({
  type = 'success',
  title,
  description,
  autoClose = true,
  position = 'topRight',
  icon,
  className,
}: ToastProps) {
  return (
    <div className={cn('flex min-h-[120px]', positionClasses[position], className)}>
      <section
        aria-live={type === 'error' ? 'assertive' : 'polite'}
        className={cn(
          'flex w-full max-w-[460px] items-center gap-m rounded-l border-stroke-md bg-surface-elevated p-m shadow-toast',
          typeClasses[type],
        )}
        data-auto-close={autoClose}
        role="status"
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex size-[40px] shrink-0 items-center justify-center rounded-full text-fg-inverse',
            iconClasses[type],
          )}
        >
          {icon ?? (type === 'success' ? '✓' : '!')}
        </span>
        <span className="flex min-w-0 flex-col gap-[2px]">
          <strong className="typo-body-01 text-fg-primary">{title}</strong>
          {description ? <span className="typo-body-02 text-fg-secondary">{description}</span> : null}
        </span>
      </section>
    </div>
  )
}
