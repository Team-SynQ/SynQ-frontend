import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export type OverlayDialogProps = {
  open: boolean
  titleId: string
  descriptionId?: string
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  onClose?: () => void
  className?: string
  children: ReactNode
}

export function OverlayDialog({
  open,
  titleId,
  descriptionId,
  closeOnEscape = false,
  closeOnBackdrop = false,
  onClose,
  className,
  children,
}: OverlayDialogProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const dialog = dialogRef.current
    const focusable = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    ;(focusable ?? dialog)?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  const getFocusableElements = () =>
    Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      if (closeOnEscape) {
        event.preventDefault()
        onClose?.()
      }
      return
    }

    if (event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) {
      event.preventDefault()
      dialogRef.current?.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay-black-60 px-s py-m"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          'flex w-full max-w-[440px] flex-col gap-l rounded-[20px] border-stroke-md border-line-default bg-surface-default p-l shadow-[0_4px_12px_rgb(0_0_0/0.08)]',
          className,
        )}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        {children}
      </section>
    </div>
  )
}
