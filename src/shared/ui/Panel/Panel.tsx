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
        'flex min-h-screen flex-col overflow-hidden border-stroke-md border-line-default bg-surface-default py-xl shadow-panel transition-[width,padding] duration-300 ease-in-out motion-reduce:transition-none',
        isFold ? 'w-[72px] items-center px-xs' : 'w-[220px] items-start justify-between px-m',
        className,
      )}
    >
      <div className={cn('flex w-full flex-col gap-xl', isFold && 'items-center')}>
        {header}
        {children ? <div className={cn('flex w-full flex-col gap-xs', isFold && 'items-center')}>{children}</div> : null}
      </div>
      {footer ? <div className={cn('w-full', isFold && 'flex justify-center')}>{footer}</div> : null}
    </aside>
  )
}
