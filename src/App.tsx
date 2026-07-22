import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import { MeetingPage } from './pages/MeetingPage'
import { MeetingStartPage } from './pages/MeetingStartPage'
import { MeetingTutorialPage } from './pages/MeetingTutorialPage'
import OnboardingPage from './pages/OnboardingPage'

function EntryFlow() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'onboarding' | 'auth'>('landing')

  return (
    <>
      {currentScreen === 'landing' ? (
        <LandingPage onLandingEnd={() => setCurrentScreen('onboarding')} />
      ) : null}
      {currentScreen === 'onboarding' ? (
        <OnboardingPage onOnboardingEnd={() => setCurrentScreen('auth')} />
      ) : null}
      {currentScreen === 'auth' ? <LoginPage /> : null}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<EntryFlow />} path="/" />
        <Route element={<MeetingStartPage />} path="/meetings/:meetingId/start" />
        <Route element={<MeetingTutorialPage />} path="/meetings/:meetingId/tutorial" />
        <Route element={<MeetingPage />} path="/meetings/:meetingId/live" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
