import React, { useState, useEffect } from 'react';
import { Logo } from '../shared/ui/Logo';
import type { LogoVariant } from '../shared/ui/Logo';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  height: '100vh',
  backgroundColor: '#FFFFFF',
};

interface LandingPageProps {
  onLandingEnd: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLandingEnd }) => {
  const [logoType, setLogoType] = useState<LogoVariant>('symbol');
  const [opacity, setOpacity] = useState<number>(1);

  useEffect(() => {
    // 1. 1200ms 시점에 페이드 아웃 시작
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, 1200);

    // 2. 1500ms 시점에 완전히 투명해졌을 때 variant를 변경하고 다시 페이드 인
    const changeLogoTimer = setTimeout(() => {
      setLogoType('wordmark');
      setOpacity(1);
    }, 1500);

    // 3. 2500ms 시점에 온보딩 화면으로 최종 전환 신호 전송
    const transitionTimer = setTimeout(() => {
      onLandingEnd();
    }, 2500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(changeLogoTimer);
      clearTimeout(transitionTimer);
    };
  }, [onLandingEnd]);

  return (
    <div style={containerStyle}>
      <div 
        style={{ 
          opacity: opacity, 
          transition: 'opacity 0.3s ease-in-out' 
        }}
      >
        <Logo variant={logoType} />
      </div>
    </div>
  );
};

export default LandingPage;