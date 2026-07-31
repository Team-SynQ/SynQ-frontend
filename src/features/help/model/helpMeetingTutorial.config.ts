export const helpMeetingTutorialSteps = [1, 2, 3] as const

export type HelpMeetingTutorialStep = (typeof helpMeetingTutorialSteps)[number]

type HelpMeetingTutorialContent = {
  description: string
  title: string
}

export const helpMeetingTutorialContent: Record<
  HelpMeetingTutorialStep,
  HelpMeetingTutorialContent
> = {
  1: {
    description: '회의 중 발화가 실시간으로 전사되어 팀이 같은 내용을 함께 확인할 수 있습니다.',
    title: '놓치지 않도록, 회의는 함께 기록돼요',
  },
  2: {
    description:
      '발화를 선택하면 SynQ 힌트를 확인하고,\nAI Chat으로 회의와 자료를 기반으로 질문할 수 있습니다.',
    title: '중요한 발화는 더 깊게 이해할 수 있어요',
  },
  3: {
    description: '회의가 끝나면 역할과 관점 기준으로 내 액션과 중요한 내용을 자동으로 정리합니다.',
    title: '기록보다 이해, 이해보다 실행까지',
  },
}
