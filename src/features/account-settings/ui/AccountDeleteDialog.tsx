import { useId, useState, type FormEvent } from 'react'

import { ApiError } from '../../../shared/api/apiError'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Button, OverlayDialog, Toast } from '../../../shared/ui'

const DEFAULT_ERROR_MESSAGE = '탈퇴를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'

export type AccountDeleteDialogProps = {
  onCancel: () => void
  onConfirm: () => Promise<void> | void
  open: boolean
}

export function AccountDeleteDialog({ onCancel, onConfirm, open }: AccountDeleteDialogProps) {
  const titleId = useId()

  return (
    <OverlayDialog
      backdropClassName="bg-overlay-dark-60!"
      className="max-w-[380px]! gap-m! px-m! py-l! shadow-[0_4px_16px_rgb(0_0_0/0.12)]"
      closeOnEscape
      onClose={onCancel}
      open={open}
      titleId={titleId}
    >
      {open ? (
        <AccountDeleteForm onCancel={onCancel} onConfirm={onConfirm} titleId={titleId} />
      ) : null}
    </OverlayDialog>
  )
}

type AccountDeleteFormProps = Omit<AccountDeleteDialogProps, 'open'> & {
  titleId: string
}

function AccountDeleteForm({ onCancel, onConfirm, titleId }: AccountDeleteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(DEFAULT_ERROR_MESSAGE)
  const errorToast = useTransientVisibility()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await onConfirm()
      // 성공 시 화면 전환(로그아웃 처리)까지 호출자가 담당하므로 여기서는 더 손대지 않는다.
    } catch (error) {
      // 활성 프로젝트 소유자는 탈퇴할 수 없다는 안내(409)처럼 서버 메시지를 그대로 보여줘야
      // 사용자가 무엇을 정리해야 탈퇴할 수 있는지 알 수 있다.
      setErrorMessage(error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE)
      errorToast.show()
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form className="flex w-full flex-col gap-l" onSubmit={(event) => void handleSubmit(event)}>
        <header className="flex flex-col gap-s text-center">
          <h2 className="typo-title-02 text-fg-primary" id={titleId}>
            정말 탈퇴하시겠어요?
          </h2>
          <p className="m-0 whitespace-pre-line typo-body-01 text-fg-secondary">
            {
              '탈퇴 시 회의 기록, AI 참고자료를 포함한\n계정 정보가 모두 삭제되며 되돌릴 수 없습니다.'
            }
          </p>
        </header>

        <div className="flex w-full gap-s">
          <Button
            className="w-[112px]"
            disabled={isSubmitting}
            onClick={onCancel}
            size="large"
            variant="fillGray100"
          >
            취소
          </Button>
          <Button
            aria-busy={isSubmitting}
            className="min-w-0 flex-1"
            disabled={isSubmitting}
            size="large"
            type="submit"
          >
            {isSubmitting ? '탈퇴 처리 중...' : '탈퇴하기'}
          </Button>
        </div>
      </form>

      {errorToast.isMounted ? (
        <Toast
          description={errorMessage}
          position="topCenter"
          title="회원 탈퇴 실패"
          type="error"
          visible={errorToast.isVisible}
        />
      ) : null}
    </>
  )
}
