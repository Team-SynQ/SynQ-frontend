import { useId, useState, type FormEvent } from 'react'

import closeIcon from '../../../shared/assets/icons/close.svg'
import { Button, Checkbox, OverlayDialog } from '../../../shared/ui'
import trashcanImage from '../assets/trashcan.svg'

type ProjectDeleteDialogProps = {
  open: boolean
  onClose: () => void
  onDelete: () => Promise<void> | void
}

export function ProjectDeleteDialog({ open, onClose, onDelete }: ProjectDeleteDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <OverlayDialog
      className="relative h-[680px] max-h-[calc(100dvh-48px)] max-w-[460px] gap-m px-m py-l shadow-floating"
      closeOnEscape
      descriptionId={descriptionId}
      onClose={onClose}
      open={open}
      titleId={titleId}
    >
      {open ? (
        <ProjectDeleteForm
          descriptionId={descriptionId}
          onClose={onClose}
          onDelete={onDelete}
          titleId={titleId}
        />
      ) : null}
    </OverlayDialog>
  )
}

type ProjectDeleteFormProps = Omit<ProjectDeleteDialogProps, 'open'> & {
  titleId: string
  descriptionId: string
}

function ProjectDeleteForm({ titleId, descriptionId, onClose, onDelete }: ProjectDeleteFormProps) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isConfirmed || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onDelete()
      onClose()
    } catch {
      // The page shows the Figma error toast and keeps this dialog open for retry.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col gap-m" onSubmit={handleSubmit}>
      <header className="flex h-[42px] shrink-0 items-center justify-center">
        <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
          프로젝트 삭제
        </h2>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-l">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-xs">
          <DeleteIllustration />
          <strong className="typo-title-02 text-fg-primary">주의</strong>
          <p
            className="m-0 whitespace-pre-line text-center typo-body-01 text-fg-secondary"
            id={descriptionId}
          >
            {'프로젝트 삭제 시 회의 기록과\nAI 참고자료도 함께 삭제될 수 있습니다.'}
          </p>
        </div>
        <div className="flex flex-col gap-s">
          <Checkbox
            checked={isConfirmed}
            className="text-fg-secondary"
            label="주의 사항을 확인했습니다."
            onChange={(event) => setIsConfirmed(event.target.checked)}
          />
          <Button
            aria-busy={isSubmitting}
            disabled={!isConfirmed || isSubmitting}
            fullWidth
            size="large"
            type="submit"
          >
            {isSubmitting ? '삭제 중...' : '삭제하기'}
          </Button>
        </div>
      </div>
      <Button
        aria-label="프로젝트 삭제 닫기"
        className="absolute right-[15px] top-[15px] size-[42px] px-0"
        onClick={onClose}
        size="medium"
        variant="basic"
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-[24px]"
          height="24"
          src={closeIcon}
          width="24"
        />
      </Button>
    </form>
  )
}

function DeleteIllustration() {
  return (
    <div className="flex h-[220px] w-full items-center justify-center" aria-hidden="true">
      <div className="relative flex h-[150px] w-[228px] items-center justify-center rounded-xs border-stroke-md border-brand-primary shadow-floating">
        <img
          alt=""
          className="h-[127px] w-[173px]"
          data-testid="project-delete-illustration"
          height="127"
          src={trashcanImage}
          width="173"
        />
        {[
          'left-[6px] top-[6px]',
          'right-[6px] top-[6px]',
          'bottom-[6px] left-[6px]',
          'bottom-[6px] right-[6px]',
        ].map((position) => (
          <span
            className={`absolute flex size-[18px] items-center justify-center rounded-full border-stroke-md border-brand-primary ${position}`}
            key={position}
          >
            <img alt="" className="size-[12px]" height="12" src={closeIcon} width="12" />
          </span>
        ))}
      </div>
    </div>
  )
}
