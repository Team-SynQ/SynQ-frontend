import { useRef, useState } from 'react'

import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Button, Toast, UserInfo } from '../../../shared/ui'
import type { ToastSize } from '../../../shared/ui'
import helpIcon from '../assets/help-circle.svg'
import infoIcon from '../assets/info.svg'
import logoutIcon from '../assets/log_out.svg'
import userIcon from '../assets/user.svg'

type AccountSettingsAction = () => Promise<void> | void

export type AccountSettingsActions = {
  onOpenAccountInfo?: AccountSettingsAction
  onOpenHelp?: AccountSettingsAction
  onOpenTerms?: AccountSettingsAction
  onLogout?: AccountSettingsAction
}

type AccountSettingsMenuProps = AccountSettingsActions & {
  email: string
  name: string
  profileImageUrl?: string | null
}

type FailureFeedback = {
  description: string
  size: ToastSize
  title: string
}

const accountInfoFailure: FailureFeedback = {
  description: '역할·관점 설정을 불러오지 못했습니다. 다시 시도해 주세요.',
  size: 'wide',
  title: '역할·관점 조회 실패',
}

const helpFailure: FailureFeedback = {
  description: '도움말을 불러오지 못했습니다. 다시 시도해 주세요.',
  size: 'default',
  title: '도움말 조회 실패',
}

const termsFailure: FailureFeedback = {
  description: '페이지를 열 수 없습니다. 다시 시도해 주세요.',
  size: 'default',
  title: '정책 문서 조회 실패',
}

export function AccountSettingsMenu({
  email,
  name,
  profileImageUrl,
  onOpenAccountInfo,
  onOpenHelp,
  onOpenTerms,
  onLogout,
}: AccountSettingsMenuProps) {
  const controlRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [failureFeedback, setFailureFeedback] = useState<FailureFeedback>()
  const failureToast = useTransientVisibility()
  const menuRef = useDismissableLayer<HTMLDivElement>({
    open,
    onDismiss: () => setOpen(false),
    restoreFocusOnDismiss: false,
    triggerRef: controlRef,
  })

  const runAction = async (
    action: AccountSettingsAction | undefined,
    feedback?: FailureFeedback,
  ) => {
    setOpen(false)
    if (!action) return

    try {
      await action()
    } catch {
      if (!feedback) return
      setFailureFeedback(feedback)
      failureToast.show()
    }
  }

  return (
    <div className="relative w-full" ref={controlRef}>
      {open ? (
        <div
          aria-label="계정 설정"
          className="absolute bottom-[calc(100%+16px)] left-0 z-40 flex w-[172px] flex-col gap-xs rounded-m border-stroke-md border-line-default bg-surface-default py-s shadow-floating"
          id="account-settings-menu"
          ref={menuRef}
          role="menu"
        >
          <AccountSettingsItem
            icon={userIcon}
            label="계정 정보 및 보안"
            onClick={() => void runAction(onOpenAccountInfo, accountInfoFailure)}
          />
          <AccountSettingsItem
            icon={helpIcon}
            label="도움말"
            onClick={() => void runAction(onOpenHelp, helpFailure)}
          />
          <AccountSettingsItem
            icon={infoIcon}
            label="이용약관"
            onClick={() => void runAction(onOpenTerms, termsFailure)}
          />
          <AccountSettingsItem
            icon={logoutIcon}
            label="로그아웃"
            onClick={() => void runAction(onLogout)}
          />
        </div>
      ) : null}

      <UserInfo
        aria-controls="account-settings-menu"
        aria-expanded={open}
        aria-haspopup="menu"
        avatar={
          profileImageUrl ? (
            <img alt="" className="size-full object-cover" src={profileImageUrl} />
          ) : undefined
        }
        email={email}
        name={name}
        onClick={() => setOpen((current) => !current)}
        visualState={open ? 'active' : 'default'}
      />

      {failureToast.isMounted && failureFeedback ? (
        <Toast
          description={failureFeedback.description}
          size={failureFeedback.size}
          title={failureFeedback.title}
          type="error"
          visible={failureToast.isVisible}
        />
      ) : null}
    </div>
  )
}

type AccountSettingsItemProps = {
  icon: string
  label: string
  onClick: () => void
}

function AccountSettingsItem({ icon, label, onClick }: AccountSettingsItemProps) {
  return (
    <Button
      className="w-full justify-start! px-xs text-fg-secondary"
      leftIcon={<img alt="" aria-hidden="true" className="size-[24px]" src={icon} />}
      onClick={onClick}
      role="menuitem"
      size="small"
      variant="basic"
    >
      {label}
    </Button>
  )
}
