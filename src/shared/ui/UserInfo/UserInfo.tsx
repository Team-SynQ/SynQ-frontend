import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type UserInfoState = 'default' | 'hover' | 'active'

type UserInfoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  visualState?: UserInfoState
  name: string
  email: string
  avatar?: ReactNode
}

const stateClasses: Record<UserInfoState, string> = {
  default: 'bg-surface-default',
  hover: 'bg-surface-muted',
  active: 'bg-surface-muted',
}

export function UserInfo({
  visualState = 'default',
  name,
  email,
  avatar,
  className,
  type = 'button',
  ...props
}: UserInfoProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-xs rounded-m py-xs text-left transition-colors hover:bg-surface-muted',
        stateClasses[visualState],
        className,
      )}
      type={type}
      {...props}
    >
      <span className="flex size-[32px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-line-default text-fg-secondary">
        {avatar ?? <DefaultAvatarIcon />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate typo-body-02 text-fg-primary">{name}</span>
        <span className="truncate typo-caption text-fg-secondary">{email}</span>
      </span>
    </button>
  )
}

function DefaultAvatarIcon() {
  return (
    <svg aria-hidden="true" className="size-[24px]" fill="none" viewBox="0 0 24 24">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor" opacity="0.5" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}
