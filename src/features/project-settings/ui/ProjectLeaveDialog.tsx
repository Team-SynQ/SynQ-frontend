import { useId, type FormEvent } from 'react'

import { Button, OverlayDialog } from '../../../shared/ui'

type ProjectLeaveDialogProps = {
  projectName: string
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  pending?: boolean
}

export function ProjectLeaveDialog({
  projectName,
  onCancel,
  onConfirm,
  open,
  pending = false,
}: ProjectLeaveDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pending) onConfirm()
  }

  return (
    <OverlayDialog
      className="max-w-[440px]! gap-l"
      closeOnEscape={!pending}
      descriptionId={descriptionId}
      onClose={pending ? undefined : onCancel}
      open={open}
      titleId={titleId}
    >
      <form className="flex flex-col gap-l" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-s">
          <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
            {`‘${projectName}’ 프로젝트를 나가시겠습니까?`}
          </h2>
          <p className="m-0 typo-body-01 text-fg-secondary" id={descriptionId}>
            나간 이후에도 초대장을 통해 다시 돌아올 수 있습니다.
          </p>
        </div>

        <div className="flex gap-s">
          <Button
            className="w-[112px]"
            disabled={pending}
            onClick={onCancel}
            size="large"
            variant="fillGray100"
          >
            취소
          </Button>
          <Button
            aria-busy={pending}
            className="min-w-0 flex-1"
            disabled={pending}
            size="large"
            type="submit"
          >
            나가기
          </Button>
        </div>
      </form>
    </OverlayDialog>
  )
}
