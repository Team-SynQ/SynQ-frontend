import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type PanelType = 'fold' | 'unfolded'

type PanelProps = {
  type?: PanelType
  header?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  className?: string
}

export function Panel({ type = 'unfolded', header, footer, children, className }: PanelProps) {
  const isFold = type === 'fold'

  return (
    <aside
      className={cn(
        'flex min-h-[420px] flex-col justify-between border-stroke-md border-line-default bg-surface-elevated shadow-panel',
        isFold ? 'w-[72px] items-center px-xs py-xl' : 'w-[220px] px-m py-xl',
        className,
      )}
    >
      <div className={cn('flex w-full flex-col gap-s', isFold && 'items-center')}>
        {header}
        {children}
      </div>
      {footer ? <div className={cn('w-full', isFold && 'flex justify-center')}>{footer}</div> : null}
    </aside>
  )
}
