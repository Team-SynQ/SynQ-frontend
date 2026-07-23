import React, { useState } from 'react';
import { Button } from '../shared/ui/Button';

const ONBOARDING_STEPS = [
  {
    title: "회의 중, 이해하지 못한 채 넘어간 순간이 있나요?",
    description: "SynQ는 프로젝트 자료와 지난 회의 맥락을 바탕으로\n의미 · 내 영향 · 팀 질문을 실시간으로 연결합니다.",
    imageSrc: "/assets/images/onboarding-step1.png"
  },
  {
    title: "회의의 흐름을 놓치지 않고 바로 질문하세요",
    description: "이해가 필요한 순간, 궁금한 발화를 선택하면\n회의 중 바로 AI에게 질문할 수 있습니다.",
    imageSrc: "/assets/images/onboarding-step2.png"
  },
  {
    title: "기록보다 이해, 이해보다 실행까지",
    description: "회의가 끝난 뒤, 역할과 관점 기준으로\n내 액션과 중요한 내용을 자동 정리합니다.",
    imageSrc: "/assets/images/onboarding-step3.png"
  }
];

// 💡 CodeRabbit 리뷰 반영: onOnboardingEnd를 필수(Required) prop으로 변경
interface OnboardingPageProps {
  onOnboardingEnd: () => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onOnboardingEnd }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = ONBOARDING_STEPS.length;
  const currentData = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onOnboardingEnd(); // 필수 prop이므로 optional chaining(?.) 제거
    }
  };

  const handleSkip = () => {
    onOnboardingEnd(); // 문법 오류 수정 및 콜백 직접 실행
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-white select-none">
      <header className="flex justify-between items-center px-10 py-6">
        <img
          src="/assets/images/landing-wordmark.png"
          alt="SynQ 로고"
          className="h-7 object-contain"
        />
        <button 
          onClick={handleSkip}
          className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
        >
          건너뛰기
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 whitespace-pre-line">
          {currentData.title}
        </h1>
        <p className="text-gray-500 text-sm md:text-base mb-8 whitespace-pre-line leading-relaxed">
          {currentData.description}
        </p>

        <div className="w-full max-w-[700px] h-auto aspect-[1.4/1] overflow-hidden flex items-center justify-center mb-8">
          <img 
            src={currentData.imageSrc} 
            alt={`${currentData.title} 안내 화면`} 
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? 'bg-blue-500 w-4' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-[400px]">
          <Button 
            onClick={handleNext}
            className="w-full py-4 text-base font-semibold"
          >
            {currentStep === totalSteps - 1 ? "SynQ 시작하기" : "다음"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;