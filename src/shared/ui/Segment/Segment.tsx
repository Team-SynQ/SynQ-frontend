import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type SegmentItemState = 'default' | 'hover' | 'active'

type SegmentItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  visualState?: SegmentItemState
}

type SegmentProps = {
  children: ReactNode
  className?: string
}

const itemStateClasses: Record<SegmentItemState, string> = {
  default: 'bg-transparent',
  hover: 'bg-overlay-dark-08',
  active: 'border-stroke-md border-line-default bg-surface-default',
}

export function Segment({ children, className }: SegmentProps) {
  return (
    <div className={cn('inline-flex gap-xs rounded-m bg-surface-muted p-[4px]', className)}>
      {children}
    </div>
  )
}

export function SegmentItem({
  visualState = 'default',
  className,
  children,
  type = 'button',
  ...props
}: SegmentItemProps) {
  return (
    <button
      className={cn(
        'flex h-[34px] min-w-[122px] items-center justify-center rounded-[10px] px-s typo-body-01 text-gray-700 transition-colors hover:bg-overlay-dark-08',
        itemStateClasses[visualState],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
