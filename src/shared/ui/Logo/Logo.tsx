import type { HTMLAttributes } from 'react'

import synqLogo from '../../assets/logos/synq-logo.svg'
import { cn } from '../../lib/cn'

export type LogoVariant = 'wordmark' | 'symbol'

type LogoProps = HTMLAttributes<HTMLDivElement> & {
  variant?: LogoVariant
}

export function Logo({ variant = 'wordmark', className, ...props }: LogoProps) {
  const isSymbol = variant === 'symbol'

  if (!isSymbol) {
    return (
      <div
        aria-label="SynQ"
        className={cn('inline-flex h-[30px] w-[79px] items-center', className)}
        role="img"
        {...props}
      >
        <img alt="" aria-hidden="true" className="h-[30px] w-[79px]" src={synqLogo} />
      </div>
    )
  }

  return (
    <div
      aria-label="SynQ"
      className={cn(
        'inline-flex h-[30px] items-center text-brand-primary',
        isSymbol ? 'w-[23px]' : 'w-[79px] gap-xs',
        className,
      )}
      role="img"
      {...props}
    >
      <LogoMark />
    </div>
  )
}

function LogoMark() {
  return (
    <svg aria-hidden="true" className="h-[30px] w-[23px] shrink-0" fill="none" viewBox="0 0 23 30">
      <path d="M11.5 2 20 7v10l-8.5 5L3 17V7z" fill="currentColor" opacity="0.18" />
      <path
        d="M11.5 2 20 7v10l-8.5 5L3 17V7z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M8 13h7M11.5 9.5v7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M7 26h9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}
