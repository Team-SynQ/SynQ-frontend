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
  transition: 'all 0.5s ease-in-out'
};

interface LandingPageProps {
  onLandingEnd: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLandingEnd }) => {
  const [logoType, setLogoType] = useState<LogoVariant>('symbol');

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setLogoType('wordmark');
    }, 1500);


    const transitionTimer = setTimeout(() => {
      onLandingEnd();
    }, 2500);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(transitionTimer);
    };
  }, [onLandingEnd]);

  return (
    <div style={containerStyle}>
      <Logo variant={logoType} />
    </div>
  );
};

export default LandingPage;