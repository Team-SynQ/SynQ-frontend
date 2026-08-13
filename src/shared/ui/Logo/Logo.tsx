import type { HTMLAttributes } from 'react'

import synqLogo from '../../assets/logos/synq-logo.svg'
import synqSymbol from '../../assets/logos/synq-symbol.svg'
import { cn } from '../../lib/cn'

export type LogoVariant = 'wordmark' | 'symbol'

type LogoProps = HTMLAttributes<HTMLDivElement> & {
  variant?: LogoVariant
}

export function Logo({ variant = 'wordmark', className, ...props }: LogoProps) {
  const isSymbol = variant === 'symbol'
  const widthClass = isSymbol ? 'w-[24px]' : 'w-[79px]'

  return (
    <div
      aria-label="SynQ"
      className={cn('inline-flex h-[30px] items-center', widthClass, className)}
      role="img"
      {...props}
    >
      <img
        alt=""
        aria-hidden="true"
        className={cn('h-[30px]', widthClass)}
        src={isSymbol ? synqSymbol : synqLogo}
      />
    </div>
  )
}
