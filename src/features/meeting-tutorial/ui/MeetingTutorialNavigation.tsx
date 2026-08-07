import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'
import { meetingTutorialSteps, type MeetingTutorialStep } from '../model/meetingTutorial.config'

export type MeetingTutorialNavigationProps = {
  step: MeetingTutorialStep
  scale?: number
  onStepChange: (step: MeetingTutorialStep) => void
  onComplete: () => void
}

export function MeetingTutorialNavigation({
  step,
  scale = 1,
  onStepChange,
  onComplete,
}: MeetingTutorialNavigationProps) {
  const handlePrimaryAction = () => {
    const currentIndex = meetingTutorialSteps.indexOf(step)
    const nextStep = meetingTutorialSteps[currentIndex + 1]

    if (nextStep) {
      onStepChange(nextStep)
      return
    }

    onComplete()
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 flex justify-center"
      style={{ padding: 32 * scale }}
    >
      <div className="flex flex-col items-center" style={{ gap: 24 * scale, width: 282 * scale }}>
        <div
          aria-label={`현재 ${step} / ${meetingTutorialSteps.length}단계`}
          className="flex items-center"
          role="status"
          style={{ gap: 6 * scale }}
        >
          {meetingTutorialSteps.map((targetStep) => (
            <span
              aria-current={targetStep === step ? 'step' : undefined}
              className={cn(
                'rounded-full',
                targetStep === step ? 'bg-brand-primary' : 'bg-line-strong',
              )}
              data-tutorial-step-indicator={targetStep}
              key={targetStep}
              style={{ height: 6 * scale, width: 6 * scale }}
            />
          ))}
        </div>

        <Button
          className="border-transparent shadow-[0_0_15px_rgb(0_0_0/0.2)]"
          onClick={handlePrimaryAction}
          size="large"
          style={{
            borderRadius: 12 * scale,
            fontSize: 20 * scale,
            height: 52 * scale,
            width: 282 * scale,
          }}
          variant="fillGray100"
        >
          {step === meetingTutorialSteps.at(-1) ? '회의 시작하기' : '다음'}
        </Button>
      </div>
    </div>
  )
}
