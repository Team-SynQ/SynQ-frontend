import { useEffect, useId, useState } from 'react'

import { AccountPerspectiveForm, type AccountPerspectiveDraft } from '../../account-settings'
import { OverlayDialog } from '../../../shared/ui'
import { loadProjectRolePerspective } from '../api/projectRolePerspective.api'

export type ProjectRolePerspectiveDialogProps = {
  projectId: number
  open: boolean
  onClose: () => void
  onSubmit: (draft: AccountPerspectiveDraft) => Promise<void>
  loadRolePerspective?: (projectId: number) => Promise<AccountPerspectiveDraft | null>
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; value: AccountPerspectiveDraft | null }
  | { status: 'error' }

/**
 * 이 프로젝트에만 적용되는 역할·관점을 고친다. 계정 기본 프로필과는 별개다.
 * 폼은 계정 설정과 같은 것을 쓴다 — 시안도 같은 규격이고 선택지도 동일하다.
 */
export function ProjectRolePerspectiveDialog({
  projectId,
  open,
  onClose,
  onSubmit,
  loadRolePerspective = loadProjectRolePerspective,
}: ProjectRolePerspectiveDialogProps) {
  const titleId = useId()
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    if (!open) return

    let isSubscribed = true
    // effect 본문에서 직접 setState 하면 lint가 막는다. 마이크로태스크로 미룬다 — 조회 응답보다 항상 먼저 돈다.
    void Promise.resolve().then(() => {
      if (isSubscribed) setLoadState({ status: 'loading' })
    })

    void loadRolePerspective(projectId)
      .then((value) => {
        if (!isSubscribed) return
        setLoadState({ status: 'ready', value })
      })
      .catch(() => {
        if (!isSubscribed) return
        setLoadState({ status: 'error' })
      })

    return () => {
      isSubscribed = false
    }
  }, [loadRolePerspective, open, projectId])

  return (
    <OverlayDialog
      backdropClassName="bg-overlay-dark-60!"
      className="h-[680px] max-w-[460px]! gap-m! overflow-hidden px-m! py-l! shadow-[0_4px_16px_rgb(0_0_0/0.12)]"
      closeOnEscape
      onClose={onClose}
      open={open}
      titleId={titleId}
    >
      <header className="shrink-0 text-center">
        <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
          역할/관점 수정
        </h2>
      </header>

      {loadState.status === 'loading' ? (
        <p aria-live="polite" className="m-auto typo-body-01 text-fg-secondary">
          역할·관점을 불러오는 중입니다.
        </p>
      ) : null}

      {loadState.status === 'error' ? (
        <p className="m-auto typo-body-01 text-fg-secondary" role="alert">
          역할·관점을 불러오지 못했습니다. 다시 시도해 주세요.
        </p>
      ) : null}

      {loadState.status === 'ready' ? (
        <AccountPerspectiveForm
          initialValue={loadState.value ?? undefined}
          onCancel={onClose}
          onSubmit={onSubmit}
          showCancel={false}
          submitLabel="저장하기"
        />
      ) : null}
    </OverlayDialog>
  )
}
