export type HelpIntroductionStep = {
  description: string
  imageDisplaySize: {
    height: number
    width: number
  }
  imageSrc: string
  title: string
}

export const helpIntroductionSteps: HelpIntroductionStep[] = [
  {
    description:
      'SynQ는 프로젝트 자료와 지난 회의 맥락을 바탕으로\n의미 · 내 영향 · 팀 질문을 실시간으로 연결합니다.',
    imageDisplaySize: { height: 589, width: 815 },
    imageSrc: '/assets/images/onboarding-step1.png',
    title: '회의 중, 이해하지 못한 채 넘어간 순간이 있나요?',
  },
  {
    description:
      '이해가 필요한 순간, 궁금한 발화를 선택하면\n회의 중 바로 AI에게 질문할 수 있습니다.',
    imageDisplaySize: { height: 589, width: 815 },
    imageSrc: '/assets/images/onboarding-step2.png',
    title: '회의의 흐름을 놓치지 않고 바로 질문하세요',
  },
  {
    description: '회의가 끝난 뒤, 역할과 관점 기준으로\n내 액션과 중요한 내용을 자동 정리합니다.',
    imageDisplaySize: { height: 601, width: 816 },
    imageSrc: '/assets/images/onboarding-step3.png',
    title: '기록보다 이해, 이해보다 실행까지',
  },
]
