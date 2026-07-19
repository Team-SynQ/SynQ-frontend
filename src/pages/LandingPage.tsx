import React, { useState, useEffect } from 'react';

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
  const [currentLogo, setCurrentLogo] = useState<'/assets/images/landing-symbol.png' | '/assets/images/landing-wordmark.png'>('/assets/images/landing-symbol.png');
  const [opacity, setOpacity] = useState<number>(1);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, 1200);

    const changeLogoTimer = setTimeout(() => {
      setCurrentLogo('/assets/images/landing-wordmark.png');
      setOpacity(1);
    }, 1500);

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
        <img 
          src={currentLogo} 
          alt={currentLogo === '/assets/images/landing-symbol.png' ? "SynQ 심볼 로고" : "SynQ 워드마크 로고"} 
          className="h-[80px] w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default LandingPage;