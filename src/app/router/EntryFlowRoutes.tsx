import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import MarketingLandingPage from '../../pages/marketing-landing/MarketingLandingPage'
import OnboardingPage from '../../pages/OnboardingPage'
import { ONBOARDING_COMPLETED_KEY, readAccessToken } from '../../shared/lib/authStorage'

export function LandingRoute() {
  const navigate = useNavigate()

  // 랜딩의 '씽큐 시작하기'가 앱 진입점이다. 로그인·온보딩 여부에 따라 들어갈 곳이 갈린다.
  const handleStart = useCallback(() => {
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

  return <MarketingLandingPage onStart={handleStart} />
}

export function OnboardingRoute() {
  const navigate = useNavigate()

  const handleOnboardingEnd = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true')
    navigate('/login', { replace: true })
  }, [navigate])

  return <OnboardingPage onOnboardingEnd={handleOnboardingEnd} />
}
