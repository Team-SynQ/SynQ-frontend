import { useId } from 'react'

import { Button, OverlayDialog } from '../../../shared/ui'

export type JoinRequestResultDialogProps = {
  projectTitle: string
  status: 'APPROVED' | 'REJECTED'
  open: boolean
  onConfirm: () => void
}

/**
 * 참여 요청이 승인·거절된 것을 알린다.
 *
 * 닫기(X)나 바깥 클릭으로 넘길 수 없게 한다. 서버가 읽음 상태를 관리하지 않아
 * 이 화면을 닫을 때 프론트가 「봤다」고 기록하는데, 그 경로를 버튼 하나로 묶어야 놓치는 결과가 없다.
 */
export function JoinRequestResultDialog({
  projectTitle,
  status,
  open,
  onConfirm,
}: JoinRequestResultDialogProps) {
  const titleId = useId()
  const isApproved = status === 'APPROVED'

  return (
    <OverlayDialog
      backdropClassName="bg-overlay-dark-60!"
      className="max-w-[440px]! gap-l px-l py-l shadow-[0_4px_24px_rgb(0_0_0/0.08)]"
      open={open}
      titleId={titleId}
    >
      <div className="flex flex-col gap-l">
        <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
          {isApproved
            ? `‘${projectTitle}’ 참여가 승인되었어요.`
            : `‘${projectTitle}’ 참여가 승인되지 않았어요.`}
        </h2>
        <Button className="w-full" onClick={onConfirm} size="large">
          {isApproved ? '프로젝트 보기' : '확인'}
        </Button>
      </div>
    </OverlayDialog>
  )
}
