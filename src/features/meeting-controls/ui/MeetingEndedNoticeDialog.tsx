import { useId } from 'react'

import { Button, OverlayDialog } from '../../../shared/ui'

export type MeetingEndedNoticeDialogProps = {
  open: boolean
  onConfirm: () => void
}

/**
 * 진행자가 회의를 끝냈다고 서버가 알렸을 때 참여자에게 보여 준다.
 *
 * 진행자가 이탈해 서버가 강제 종료한 경우와 정상 종료한 경우를 구분하지 않는다.
 * 참여자에게는 같은 상황이고, 서버도 두 경우에 같은 메시지를 보낸다.
 * 닫을 방법을 확인 버튼 하나로만 두어 종료된 회의 화면에 남지 않게 한다.
 */
export function MeetingEndedNoticeDialog({ open, onConfirm }: MeetingEndedNoticeDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <OverlayDialog
      className="max-w-[440px] gap-l px-l py-[32px]"
      descriptionId={descriptionId}
      open={open}
      titleId={titleId}
    >
      <header className="flex flex-col items-center gap-xs text-center">
        {/* 진행자의 저장 완료 모달과 제목이 겹치지 않아야 한다. 접근성 이름이 같으면 구분할 수 없다. */}
        <h2 className="typo-title-02 text-fg-primary" id={titleId}>
          진행자가 회의를 종료했습니다.
        </h2>
        <div className="typo-body-01 text-fg-secondary" id={descriptionId}>
          <p>회의 내용은 프로젝트에 저장됩니다.</p>
        </div>
      </header>

      <Button fullWidth onClick={onConfirm} size="large">
        확인
      </Button>
    </OverlayDialog>
  )
}
