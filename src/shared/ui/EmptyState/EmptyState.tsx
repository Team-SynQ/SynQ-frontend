import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

const defaultIcon = (
  <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
    <path
      d="M7 4.75h7.25L18 8.5v10.75H7z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
    <path
      d="M14.25 4.75V8.5H18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
    <path
      d="M9.75 13h5.5M9.75 16h3.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  </svg>
)

export function EmptyState({
  title,
  description,
  action,
  icon = defaultIcon,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn('flex flex-col items-center justify-center gap-s py-xl text-center', className)}
    >
      <div className="flex size-[48px] items-center justify-center rounded-full bg-surface-muted text-brand-primary">
        {icon}
      </div>
      <div className="flex flex-col gap-xs">
        <p className="typo-body-01 text-fg-primary">{title}</p>
        {description ? <p className="typo-body-02 text-fg-secondary">{description}</p> : null}
      </div>
      {action}
    </section>
  )
}
