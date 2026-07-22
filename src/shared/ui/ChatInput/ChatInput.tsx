import type { FormEvent, InputHTMLAttributes } from 'react'

import sendIcon from '../../assets/icons/send.svg'
import { cn } from '../../lib/cn'

type ChatInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  onSend?: () => void
  sendLabel?: string
  wrapperClassName?: string
}

export function ChatInput({
  onSend,
  sendLabel = '보내기',
  wrapperClassName,
  className,
  disabled,
  ...props
}: ChatInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSend?.()
  }

  return (
    <form
      className={cn(
        'flex h-[58px] w-full max-w-[452px] items-center rounded-m border-stroke-md border-line-default bg-surface-muted p-s',
        wrapperClassName,
      )}
      onSubmit={handleSubmit}
    >
      <input
        className={cn(
          'min-w-0 flex-1 bg-transparent typo-transcription-body-01 text-fg-primary outline-none placeholder:text-fg-secondary disabled:cursor-not-allowed',
          className,
        )}
        disabled={disabled}
        type="text"
        {...props}
      />
      <button
        aria-label={sendLabel}
        className="flex size-[24px] shrink-0 items-center justify-center rounded-xs text-brand-primary transition-colors hover:bg-overlay-dark-02 disabled:cursor-not-allowed disabled:text-fg-secondary"
        disabled={disabled}
        type="submit"
      >
        <SendIcon />
      </button>
    </form>
  )
}

function SendIcon() {
  return <img alt="" aria-hidden="true" className="size-[24px]" src={sendIcon} />
}
