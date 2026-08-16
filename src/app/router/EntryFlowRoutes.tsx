import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import LandingPage from '../../pages/LandingPage'
import OnboardingPage from '../../pages/OnboardingPage'
import { ONBOARDING_COMPLETED_KEY, readAccessToken } from '../../shared/lib/authStorage'

export function LandingRoute() {
  const navigate = useNavigate()

  const handleLandingEnd = useCallback(() => {
    const hasAccessToken = Boolean(readAccessToken())
    if (hasAccessToken) {
      navigate('/projects', { replace: true })
      return
    }

    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true'
    if (hasSeenOnboarding) {
      navigate('/login', { replace: true })
      return
    }

    navigate('/onboarding', { replace: true })
  }, [navigate])

  return <LandingPage onLandingEnd={handleLandingEnd} />
}

export function OnboardingRoute() {
  const navigate = useNavigate()

  const handleOnboardingEnd = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true')
    navigate('/login', { replace: true })
  }, [navigate])

  return <OnboardingPage onOnboardingEnd={handleOnboardingEnd} />
}
