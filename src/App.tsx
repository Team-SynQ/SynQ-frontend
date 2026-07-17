import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'onboarding' | 'auth'>('landing');

  return (
    <>
      {currentScreen === 'landing' && (
        <LandingPage onLandingEnd={() => setCurrentScreen('onboarding')} />
      )}
      {currentScreen === 'onboarding' && (
        <OnboardingPage onOnboardingEnd={() => setCurrentScreen('auth')} />
      )}
      {currentScreen === 'auth' && (
        // 온보딩 완료 후 보일 임시 로그인/메인 화면 자리입니다.
        <div className="flex w-screen h-screen items-center justify-center bg-white text-xl font-bold">
          로그인 / 인증 페이지 (개발 예정)
        </div>
      )}
    </>
  );
}

export default App;

/*
import LandingPage from './pages/LandingPage'

function App() {
  
  return <LandingPage onLandingEnd={() => {}} />
}

export default App



import { SharedUiHubPage } from './pages/SharedUiHub'

function App() {
  return <SharedUiHubPage />
}

export default App
*/