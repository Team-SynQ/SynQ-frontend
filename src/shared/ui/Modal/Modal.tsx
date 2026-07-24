import { useId, type ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../Button'

export type ModalType = 'confirm' | 'form' | 'info'

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
  const isInfo = type === 'info'

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
        {description ? <p className="typo-body-01 text-fg-secondary">{description}</p> : null}
        {children ? (
          <div className={cn(type === 'form' && 'pt-xs', isInfo && 'rounded-m bg-surface-muted p-s typo-transcription-body-01 text-fg-secondary')}>
            {children}
          </div>
        ) : null}
      </div>

      {isInfo ? (
        <Button fullWidth onClick={onCancel} size="large" variant="fillGray100">
          {cancelLabel}
        </Button>
      ) : (
        <div className="flex w-full gap-s">
          <Button className="w-[112px]" onClick={onCancel} size="large" variant="fillGray100">
            {cancelLabel}
          </Button>
          <Button className="flex-1" onClick={onConfirm} size="large">
            {confirmLabel}
          </Button>
        </div>
      )}
    </section>
  )
}
