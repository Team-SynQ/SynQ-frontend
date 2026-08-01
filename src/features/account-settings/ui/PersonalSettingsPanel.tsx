import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'
import helpIcon from '../assets/help-circle.svg'
import infoIcon from '../assets/info.svg'
import logoutIcon from '../assets/log_out.svg'
import userIcon from '../assets/user.svg'

export type AccountSettingsSection = 'account' | 'help' | 'policy'

type PersonalSettingsPanelProps = {
  activeSection?: AccountSettingsSection
  onLogout?: () => void
  onSelectSection?: (section: AccountSettingsSection) => void
}

const sections = [
  { id: 'account' as const, icon: userIcon, label: '계정 및 기본 설정' },
  { id: 'help' as const, icon: helpIcon, label: '도움말' },
  { id: 'policy' as const, icon: infoIcon, label: '정책 문서' },
]

export function PersonalSettingsPanel({
  activeSection = 'account',
  onLogout,
  onSelectSection,
}: PersonalSettingsPanelProps) {
  return (
    <nav
      aria-label="개인 설정"
      className="flex h-full w-[179px] shrink-0 flex-col justify-between rounded-m p-xs"
    >
      <div className="flex flex-col gap-xs">
        {sections.map((section) => (
          <Button
            aria-current={activeSection === section.id ? 'page' : undefined}
            className={cn(
              'w-full justify-start! rounded-[10px]! px-xs text-fg-secondary',
              activeSection === section.id && 'bg-overlay-dark-08!',
            )}
            key={section.id}
            leftIcon={<img alt="" aria-hidden="true" className="size-[24px]" src={section.icon} />}
            onClick={() => onSelectSection?.(section.id)}
            size="medium"
            variant="basic"
          >
            {section.label}
          </Button>
        ))}
      </div>

      <Button
        className="w-full justify-start! px-xs text-fg-secondary"
        leftIcon={<img alt="" aria-hidden="true" className="size-[24px]" src={logoutIcon} />}
        onClick={onLogout}
        size="small"
        variant="basic"
      >
        로그아웃
      </Button>
    </nav>
  )
}
