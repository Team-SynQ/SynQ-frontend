import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <section className={cn('flex flex-col items-center justify-center gap-s py-xl text-center', className)}>
      <div className="flex size-[48px] items-center justify-center rounded-full bg-surface-muted text-brand-primary">
        0
      </div>
      <div className="flex flex-col gap-xs">
        <p className="typo-body-01 text-fg-primary">{title}</p>
        {description ? <p className="typo-body-02 text-fg-secondary">{description}</p> : null}
      </div>
      {action}
    </section>
  )
}
