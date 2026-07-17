
import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'onboarding'>('landing');

  return (
    <>
      {currentScreen === 'landing' ? (
        <LandingPage onLandingEnd={() => setCurrentScreen('onboarding')} />
      ) : (
        <OnboardingPage />
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