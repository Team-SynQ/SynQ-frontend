import { useId } from 'react'

import { Button, OverlayDialog } from '../../../shared/ui'

export type MeetingExitDialogProps = {
  open: boolean
  mode: 'leave' | 'end'
  onCancel: () => void
  onConfirm: () => void
}

export function MeetingExitDialog({
  open,
  mode,
  onCancel,
  onConfirm,
}: MeetingExitDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const title = mode === 'leave' ? '회의를 나가시겠어요?' : '회의를 종료할까요?'
  const confirmLabel = mode === 'leave' ? '나가기' : '종료하기'

  return (
    <OverlayDialog
      className="max-w-[440px] gap-l px-l py-[32px]"
      closeOnEscape
      descriptionId={descriptionId}
      onClose={onCancel}
      open={open}
      titleId={titleId}
    >
      <header className="flex flex-col items-center gap-xs text-center">
        <h2 className="typo-title-02 text-fg-primary" id={titleId}>
          {title}
        </h2>
        <div className="typo-body-01 text-fg-secondary" id={descriptionId}>
          <p>회의 내용은 프로젝트에 저장됩니다.</p>
          <p>상세 회의 정리 기능은 추후 제공될 예정입니다.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-xs">
        <Button fullWidth onClick={onCancel} size="large" variant="fillGray100">
          취소
        </Button>
        <Button fullWidth onClick={onConfirm} size="large">
          {confirmLabel}
        </Button>
      </div>
    </OverlayDialog>
  )
}
