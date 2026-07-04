import { useId, type ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../Button'

export type ModalType = 'confirm' | 'form'

type ModalProps = {
  type?: ModalType
  title: string
  description?: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  className?: string
}

export function Modal({
  type = 'confirm',
  title,
  description,
  children,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  className,
}: ModalProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      aria-modal="true"
      className={cn(
        'flex w-full max-w-[440px] flex-col gap-l rounded-l border-stroke-md border-line-default bg-surface-default p-l shadow-floating',
        className,
      )}
      role="dialog"
    >
      <div className="flex flex-col gap-s">
        <h2 className="typo-title-02 text-fg-primary" id={titleId}>
          {title}
        </h2>
        {description ? <p className="typo-body-02 text-fg-secondary">{description}</p> : null}
        {type === 'form' && children ? <div className="pt-xs">{children}</div> : children}
      </div>
      <div className="grid grid-cols-2 gap-s">
        <Button variant="fillGray100" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </section>
  )
}
