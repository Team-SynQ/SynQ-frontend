import { useId, useState } from 'react'

import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { OverlayDialog, Toast } from '../../../shared/ui'
import type { AccountPerspective, AccountPerspectiveDraft } from '../model/accountSettings.types'
import { AccountPerspectiveForm } from './AccountPerspectiveForm'

type EditFeedback = 'success' | 'error'

const feedbackMessages: Record<
  EditFeedback,
  { description: string; size: 'default' | 'wide'; title: string; type: 'success' | 'error' }
> = {
  success: {
    description: '역할·관점 설정이 저장되었습니다.',
    size: 'default',
    title: '설정 저장 성공',
    type: 'success',
  },
  error: {
    description: '역할·관점 설정을 저장하지 못했습니다. 다시 시도해 주세요.',
    size: 'wide',
    title: '설정 저장 실패',
    type: 'error',
  },
}

export type AccountPerspectiveEditDialogProps = {
  onCancel: () => void
  onSubmit: (perspective: AccountPerspective) => Promise<void> | void
  open: boolean
  perspective: AccountPerspective
}

export function AccountPerspectiveEditDialog({
  onCancel,
  onSubmit,
  open,
  perspective,
}: AccountPerspectiveEditDialogProps) {
  const titleId = useId()
  const [feedback, setFeedback] = useState<EditFeedback>()
  const feedbackToast = useTransientVisibility()

  const showFeedback = (nextFeedback: EditFeedback) => {
    setFeedback(nextFeedback)
    feedbackToast.show()
  }

  const handleSubmit = async (draft: AccountPerspectiveDraft) => {
    try {
      await onSubmit({
        ...draft,
        id: perspective.id,
        isDefault: perspective.isDefault,
      })
    } catch {
      showFeedback('error')
      return
    }

    showFeedback('success')
    onCancel()
  }

  const feedbackMessage = feedback ? feedbackMessages[feedback] : undefined

  return (
    <>
      <OverlayDialog
        backdropClassName="bg-overlay-dark-60!"
        className="h-[680px] max-w-[460px]! gap-m! overflow-hidden px-m! py-l! shadow-[0_4px_16px_rgb(0_0_0/0.12)]"
        closeOnEscape
        onClose={onCancel}
        open={open}
        titleId={titleId}
      >
        <header className="shrink-0 text-center">
          <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
            역할/관점 수정하기
          </h2>
        </header>

        {open ? (
          <AccountPerspectiveForm
            initialValue={perspective}
            key={perspective.id}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            submitLabel="역할·관점 수정하기"
          />
        ) : null}
      </OverlayDialog>

      {feedbackMessage && feedbackToast.isMounted ? (
        <Toast
          className="z-[80]"
          description={feedbackMessage.description}
          position="topCenter"
          size={feedbackMessage.size}
          title={feedbackMessage.title}
          type={feedbackMessage.type}
          visible={feedbackToast.isVisible}
        />
      ) : null}
    </>
  )
}
