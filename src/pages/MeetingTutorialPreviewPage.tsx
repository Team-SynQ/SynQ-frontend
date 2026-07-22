import { useState } from 'react'

import {
  MeetingTutorialOverlay,
  SecondTutorialMeetingScreen,
  ThirdTutorialMeetingScreen,
  type MeetingTutorialStep,
} from '../features/meeting-tutorial'

export function MeetingTutorialPreviewPage() {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [step, setStep] = useState<MeetingTutorialStep>(2)

  return (
    <div className="fixed inset-0 overflow-auto bg-surface-default">
      <div className="relative size-full min-h-[720px] min-w-[1024px]">
        {step === 3 ? <ThirdTutorialMeetingScreen /> : <SecondTutorialMeetingScreen />}
        <MeetingTutorialOverlay
          contained
          dontShowAgain={dontShowAgain}
          onDontShowAgainChange={setDontShowAgain}
          onStepChange={setStep}
          step={step}
        />
      </div>
    </div>
  )
}
