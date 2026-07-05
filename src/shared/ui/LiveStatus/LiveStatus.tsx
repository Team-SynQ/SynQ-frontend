import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export type LiveStatusType = 'live' | 'offline'

type LiveStatusProps = HTMLAttributes<HTMLSpanElement> & {
  status?: LiveStatusType
}

const statusClasses: Record<LiveStatusType, string> = {
  live: 'border-semantic-error bg-surface-default text-semantic-error',
  offline: 'border-line-default bg-line-default text-fg-secondary',
}

const dotClasses: Record<LiveStatusType, string> = {
  live: 'bg-semantic-error',
  offline: 'bg-line-strong',
}

const statusLabels: Record<LiveStatusType, string> = {
  live: 'Live',
  offline: 'Offline',
}

export function LiveStatus({ status = 'live', className, children, ...props }: LiveStatusProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[35px] items-center gap-xs rounded-full border-stroke-md px-m typo-body-01',
        statusClasses[status],
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn('size-[10px] rounded-full', dotClasses[status])} />
      {children ?? statusLabels[status]}
    </span>
  )
}
