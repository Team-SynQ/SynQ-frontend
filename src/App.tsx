import React, { useState } from 'react';
import UserRoleSetupPage from './pages/UserRoleSetupPage';
import UserPerspectiveSetupPage from './pages/UserPerspectiveSetupPage';
import UserSetupPreviewPage from './pages/UserSetupPreviewPage';

const ROLE_LABEL_MAP: Record<string, string> = {
  pm: '기획/운영',
  design: '디자인/콘텐츠',
  dev: '개발/기술',
  marketing: '마케팅/브랜딩',
  sales: '영업/고객',
  data: '데이터/리서치',
  exec: '경영/전략',
  etc: '기타',
};

const ROLE_ICON_MAP: Record<string, string> = {
  pm: '/assets/images/role-pm.png',
  design: '/assets/images/role-design.png',
  dev: '/assets/images/role-dev.png',
  marketing: '/assets/images/role-marketing.png',
  sales: '/assets/images/role-sales.png',
  data: '/assets/images/role-data.png',
  exec: '/assets/images/role-exec.png',
  etc: '/assets/images/role-etc.png',
};

const PERSPECTIVE_LABEL_MAP: Record<string, string> = {
  schedule: '일정',
  scope: '기능 범위',
  decision: '의사 결정',
  ux: '사용자 경험',
  tech_risk: '기술 리스크',
  cost_performance: '비용/성과',
  customer_feedback: '고객 반응',
  ops_issue: '운영 이슈',
  action_item: '액션 아이템',
  team_qna: '팀 질문',
};

function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [roleData, setRoleData] = useState<{ selectedRole: string; detailRole: string } | null>(null);
  const [perspectives, setPerspectives] = useState<string[]>([]);

  const selectedRoleLabel = roleData ? ROLE_LABEL_MAP[roleData.selectedRole] || roleData.selectedRole : '';
  const selectedRoleIcon = roleData ? ROLE_ICON_MAP[roleData.selectedRole] || '' : '';
  const selectedPerspectiveLabels = perspectives.map(id => PERSPECTIVE_LABEL_MAP[id] || id);

  return (
    <div>
      {step === 1 && (
        <UserRoleSetupPage
          username="username"
          onNext={(data) => {
            setRoleData(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <UserPerspectiveSetupPage
          onPrev={() => setStep(1)}
          onNext={(selectedPerspectives) => {
            setPerspectives(selectedPerspectives);
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <UserSetupPreviewPage
          selectedRoleLabel={selectedRoleLabel}
          selectedRoleIcon={selectedRoleIcon}
          detailRole={roleData?.detailRole}
          selectedPerspectiveLabels={selectedPerspectiveLabels}
          onPrev={() => setStep(2)}
          onComplete={() => {
            console.log('최종 온보딩 완료 데이터:', {
              ...roleData,
              perspectives,
            });
            alert('온보딩 설정이 완료되었습니다!');
          }}
        />
      )}
    </div>
  );
}

export default App;



/*



















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
  const [isFading, setIsFading] = useState(false)

  const handleNavigate = (nextScreen: 'landing' | 'onboarding' | 'auth') => {
    setIsFading(true)
    setTimeout(() => {
      setCurrentScreen(nextScreen)
      setIsFading(false)
    }, 300)
  }

  return (
    <div
      className={`w-screen h-screen transition-opacity duration-300 ease-in-out ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {currentScreen === 'landing' ? (
        <LandingPage onLandingEnd={() => handleNavigate('onboarding')} />
      ) : null}
      {currentScreen === 'onboarding' ? (
       <OnboardingPage onOnboardingEnd={() => handleNavigate('auth')} />
      ) : null}
      {currentScreen === 'auth' ? <LoginPage /> : null}
    </div>
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

*/

