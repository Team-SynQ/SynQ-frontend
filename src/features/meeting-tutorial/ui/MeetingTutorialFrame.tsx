import synqLogoInverse from '../../../shared/assets/logos/synq-logo-inverse.svg'
import { Button, Checkbox } from '../../../shared/ui'

export type MeetingTutorialFrameProps = {
  dontShowAgain?: boolean
  scale?: number
  onDontShowAgainChange?: (checked: boolean) => void
  onSkip?: () => void
}

export function MeetingTutorialFrame({
  dontShowAgain = false,
  scale = 1,
  onDontShowAgainChange,
  onSkip,
}: MeetingTutorialFrameProps) {
  return (
    <header
      className="absolute inset-x-0 top-0 flex items-start justify-between"
      data-meeting-tutorial-frame
      style={{ padding: 32 * scale }}
    >
      <img alt="SynQ" src={synqLogoInverse} style={{ height: 30 * scale, width: 78.621 * scale }} />

      <div className="flex items-center" style={{ gap: 16 * scale }}>
        <div
          className="flex items-center border-stroke-md border-line-default bg-surface-elevated"
          style={{
            borderRadius: 8 * scale,
            height: 32 * scale,
            paddingInline: 16 * scale,
          }}
        >
          <Checkbox
            checked={dontShowAgain}
            label="다시 보지 않기"
            onChange={(event) => onDontShowAgainChange?.(event.target.checked)}
            scale={scale}
          />
        </div>
        <Button
          onClick={onSkip}
          size="small"
          style={{
            borderRadius: 8 * scale,
            fontSize: 14 * scale,
            fontWeight: 500,
            height: 32 * scale,
            letterSpacing: -0.35 * scale,
            lineHeight: 1.4,
            paddingInline: 16 * scale,
          }}
          variant="fillGray100"
        >
          건너뛰기
        </Button>
      </div>
    </header>
  )
}
