
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';

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
        <LoginPage onLoginSuccess={() => console.log('로그인 성공!')} />
      )}
    </>
  );
}

export default App;




/* import { SharedUiHubPage } from './pages/SharedUiHub'

function App() {
  return <SharedUiHubPage />
}

export default App
 */