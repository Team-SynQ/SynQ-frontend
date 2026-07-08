import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type ModifyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function ModifyInput({ className, disabled, ...props }: ModifyInputProps) {
  return (
    <label className="flex w-full max-w-[844px] flex-col gap-xs">
      <span className="sr-only">수정 입력</span>
      <span className="flex h-[42px] w-full items-center rounded-m border-stroke-md border-line-default bg-surface-default px-s py-xs">
        <input
          className={cn(
            'min-w-0 flex-1 bg-transparent typo-transcription-body-01 text-fg-primary outline-none placeholder:text-fg-secondary disabled:cursor-not-allowed',
            className,
          )}
          disabled={disabled}
          type="text"
          {...props}
        />
      </span>
    </label>
  )
}
