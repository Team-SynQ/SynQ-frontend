import type { MeetingTutorialStep } from '../model/meetingTutorial.config'

export type MeetingTutorialPreviewProps = {
  step: MeetingTutorialStep
}

const staticPreviewFrames = {
  1: { figmaNodeId: '1961:18027', imageSrc: '/assets/images/help-meeting-tutorial-step1.png' },
  2: { figmaNodeId: '1961:18711', imageSrc: '/assets/images/help-meeting-tutorial-step2.png' },
  3: { figmaNodeId: '1961:22695', imageSrc: '/assets/images/help-meeting-tutorial-step3.png' },
} as const

export function MeetingTutorialPreview({ step }: MeetingTutorialPreviewProps) {
  const frame = staticPreviewFrames[step]

  return (
    <img
      alt={`회의 사용법 ${step}단계 안내 화면`}
      className="h-[530px] w-[760px] shrink-0 rounded-m object-cover shadow-tutorial-preview"
      data-figma-node-id={frame.figmaNodeId}
      height={530}
      src={frame.imageSrc}
      width={760}
    />
  )
}
