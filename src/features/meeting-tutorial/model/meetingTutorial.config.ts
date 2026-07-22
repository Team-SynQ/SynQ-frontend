export const meetingTutorialSteps = [1, 2, 3] as const

export type MeetingTutorialStep = (typeof meetingTutorialSteps)[number]

type HighlightRect = {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

type TooltipPlacement = {
  x: number
  y: number
  width: number
  pointer: 'top' | 'bottom'
}

type MeetingTutorialContent = {
  description: string
  highlights: HighlightRect[]
  targetIds: string[]
  tooltip: TooltipPlacement
  connectorPath?: string
}

export const meetingTutorialContent: Record<MeetingTutorialStep, MeetingTutorialContent> = {
  1: {
    description: '회의 중 발화는 실시간으로 기록되어 팀원과 함께 확인할 수 있습니다.',
    highlights: [
      { x: 32, y: 186, width: 876, height: 126, radius: 12 },
      { x: 32, y: 328, width: 876, height: 126, radius: 12 },
      { x: 32, y: 470, width: 876, height: 101, radius: 12 },
    ],
    targetIds: ['transcript-1', 'transcript-2', 'transcript-3'],
    tooltip: { x: 184, y: 634, width: 490, pointer: 'top' },
  },
  2: {
    description:
      '발화를 선택하면 SynQ 힌트를 확인하고, AI Chat으로 회의와 자료를 기반으로 질문할 수 있습니다.',
    highlights: [
      { x: 938, y: 88, width: 502, height: 936, radius: 0 },
      { x: 32, y: 598, width: 876, height: 106, radius: 12 },
      { x: 32, y: 712, width: 876, height: 216, radius: 12 },
    ],
    targetIds: ['ai-chat-panel', 'selected-utterance', 'synq-hint'],
    tooltip: { x: 170, y: 462, width: 406, pointer: 'bottom' },
    connectorPath: 'M 918 492 H 806 V 598',
  },
  3: {
    description: '회의 후 내 역할과 관점을 기준으로 회의 핵심 내용을 빠르게 확인할 수 있습니다.',
    highlights: [
      { x: 250, y: 201, width: 1156, height: 80, radius: 20 },
      { x: 250, y: 297, width: 1156, height: 80, radius: 20 },
      { x: 250, y: 393, width: 1156, height: 80, radius: 20 },
      { x: 250, y: 489, width: 1156, height: 80, radius: 20 },
    ],
    targetIds: ['record-section-1', 'record-section-2', 'record-section-3', 'record-section-4'],
    tooltip: { x: 287, y: 623, width: 355, pointer: 'top' },
  },
}
