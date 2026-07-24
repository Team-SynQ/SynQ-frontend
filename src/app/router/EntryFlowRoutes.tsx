import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import LandingPage from '../../pages/LandingPage'
import OnboardingPage from '../../pages/OnboardingPage'

export function LandingRoute() {
  const navigate = useNavigate()
  const handleLandingEnd = useCallback(() => {
    navigate('/onboarding', { replace: true })
  }, [navigate])

  return <LandingPage onLandingEnd={handleLandingEnd} />
}

export function OnboardingRoute() {
  const navigate = useNavigate()
  const handleOnboardingEnd = useCallback(() => {
    navigate('/login', { replace: true })
  }, [navigate])

  return <OnboardingPage onOnboardingEnd={handleOnboardingEnd} />
}
