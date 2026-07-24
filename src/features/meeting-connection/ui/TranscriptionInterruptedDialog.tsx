import { useId } from 'react'

import { Button, OverlayDialog } from '../../../shared/ui'

export type TranscriptionInterruptedDialogProps = {
  open: boolean
  onClose: () => void
}

export function TranscriptionInterruptedDialog({
  open,
  onClose,
}: TranscriptionInterruptedDialogProps) {
  const titleId = useId()

  return (
    <OverlayDialog
      className="shadow-none"
      closeOnEscape
      onClose={onClose}
      open={open}
      titleId={titleId}
    >
      <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
        <span className="block">전사가 일시 중단되었습니다.</span>
        <span className="block">연결 상태와 마이크 권한을 확인해 주세요.</span>
      </h2>
      <Button fullWidth onClick={onClose} size="large" variant="fillGray100">
        닫기
      </Button>
    </OverlayDialog>
  )
}
