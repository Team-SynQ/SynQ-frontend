import type { ReactNode } from 'react'

import errorIcon from '../../assets/icons/toast-error.svg'
import successIcon from '../../assets/icons/toast-success.svg'
import { cn } from '../../lib/cn'

export type ToastType = 'success' | 'error'
export type ToastPosition = 'topRight' | 'bottomRight' | 'topCenter' | 'bottomCenter'
export type ToastSize = 'default' | 'compact' | 'wide'

type ToastProps = {
  type?: ToastType
  size?: ToastSize
  title: string
  description?: string
  autoClose?: boolean
  position?: ToastPosition
  icon?: ReactNode
  visible?: boolean
  className?: string
}

const typeClasses: Record<ToastType, string> = {
  success: 'border-semantic-success shadow-toast-success',
  error: 'border-semantic-error shadow-toast-error',
}

const iconClasses: Record<ToastType, string> = {
  success: 'bg-transparent',
  error: 'bg-transparent',
}

// ✅ Tailwind v4 postfix '!' 적용 (위치 오버라이드 우선순위 확보)
const positionClasses: Record<ToastPosition, string> = {
  topRight: 'right-m! top-m!',
  bottomRight: 'bottom-m! right-m!',
  topCenter: 'left-1/2! top-m! -translate-x-1/2!',
  bottomCenter: 'bottom-m! left-1/2! -translate-x-1/2!',
}

const sizeClasses: Record<ToastSize, string> = {
  default: 'min-h-[118px] w-full gap-m p-m',
  compact: 'min-h-[100px] w-full gap-m p-m',
  wide: 'min-h-[118px] w-full gap-m p-m',
}

const wrapperSizeClasses: Record<ToastSize, string> = {
  default: 'max-w-[460px]',
  compact: 'max-w-[380px]',
  wide: 'max-w-[497px]',
}

const iconSizeClasses: Record<ToastSize, string> = {
  default: 'size-[70px]',
  compact: 'size-[48px]',
  wide: 'size-[70px]',
}

export function Toast({
  type = 'success',
  size = 'default',
  title,
  description,
  autoClose = true,
  position = 'topRight',
  icon,
  visible = true,
  className,
}: ToastProps) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed z-50 flex w-[calc(100%-32px)]',
        positionClasses[position],
        wrapperSizeClasses[size],
        'transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-xs opacity-0',
        className,
      )}
    >
      <section
        aria-label={title}
        aria-live={visible ? (type === 'error' ? 'assertive' : 'polite') : 'off'}
        className={cn(
          'flex items-center rounded-[20px] border-stroke-md bg-surface-default',
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
          {icon ?? <ToastIcon size={size} type={type} />}
        </span>
        <span className="flex min-w-0 flex-col gap-xs">
          <strong className={cn('text-fg-primary', size === 'compact' ? 'typo-title-02' : 'typo-title-01')}>{title}</strong>
          {description ? <span className={cn('text-fg-secondary', size === 'compact' ? 'typo-body-02' : 'typo-body-01')}>{description}</span> : null}
        </span>
      </section>
    </div>
  )
}

function ToastIcon({ type, size }: { type: ToastType; size: ToastSize }) {
  const iconSource = type === 'error' ? errorIcon : successIcon

  return (
    <img
      alt=""
      aria-hidden="true"
      className={iconSizeClasses[size]}
      height={size === 'compact' ? 48 : 70}
      src={iconSource}
      width={size === 'compact' ? 48 : 70}
    />
  )
}
