import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
  MeetingTutorialOverlay,
  SecondTutorialMeetingScreen,
  setMeetingTutorialHidden,
  ThirdTutorialMeetingScreen,
  type MeetingTutorialStep,
} from '../features/meeting-tutorial'

export function MeetingTutorialPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { meetingId = 'demo' } = useParams()
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [step, setStep] = useState<MeetingTutorialStep>(1)

  const enterMeeting = () => {
    setMeetingTutorialHidden(dontShowAgain)
    navigate(`/meetings/${encodeURIComponent(meetingId)}/live`, {
      replace: true,
      state: location.state,
    })
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-surface-default">
      <div className="relative size-full min-h-[720px] min-w-[1024px]">
        {step === 3 ? <ThirdTutorialMeetingScreen /> : <SecondTutorialMeetingScreen />}
        <MeetingTutorialOverlay
          contained
          dontShowAgain={dontShowAgain}
          onDontShowAgainChange={setDontShowAgain}
          onSkip={enterMeeting}
          onStepChange={setStep}
          step={step}
        />
      </div>
    </div>
  )
}
