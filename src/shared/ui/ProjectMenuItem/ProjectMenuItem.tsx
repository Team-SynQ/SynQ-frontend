import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type ProjectMenuItemState = 'default' | 'hover' | 'active'

type ProjectMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  visualState?: ProjectMenuItemState
  icon?: ReactNode
}

const stateClasses: Record<ProjectMenuItemState, string> = {
  default: 'bg-surface-default text-fg-secondary',
  hover: 'bg-surface-muted text-fg-secondary',
  active: 'bg-surface-muted text-fg-primary',
}

export function ProjectMenuItem({
  visualState = 'default',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ProjectMenuItemProps) {
  return (
    <button
      className={cn(
        'flex h-[42px] w-full items-center gap-s rounded-m px-s typo-body-01 transition-colors hover:bg-surface-muted active:bg-surface-muted',
        stateClasses[visualState],
        className,
      )}
      type={type}
      {...props}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </button>
  )
}
