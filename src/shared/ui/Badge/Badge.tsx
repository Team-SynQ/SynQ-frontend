import type { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export type BadgeSize = 'small' | 'extraSmall'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  size?: BadgeSize
}

const sizeClasses: Record<BadgeSize, string> = {
  small: 'h-[32px] px-xs typo-body-02',
  extraSmall: 'h-[24px] px-xs typo-body-02',
}

export function Badge({ size = 'small', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-s bg-primary-100 text-brand-primary',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
