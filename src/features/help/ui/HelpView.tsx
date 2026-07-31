import { useState, type ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'
import { helpIntroductionSteps, type HelpIntroductionStep } from '../model/helpIntroduction.config'
import {
  helpMeetingTutorialContent,
  helpMeetingTutorialSteps,
  type HelpMeetingTutorialStep,
} from '../model/helpMeetingTutorial.config'

export type HelpViewProps = {
  renderMeetingTutorial?: (step: HelpMeetingTutorialStep) => ReactNode
}

type HelpTab = 'introduction' | 'meeting'

type HelpBoardImageProps = Pick<HelpIntroductionStep, 'imageDisplaySize' | 'imageSrc' | 'title'>

function HelpBoardImage({ imageDisplaySize, imageSrc, title }: HelpBoardImageProps) {
  return (
    <div className="h-[530px] w-[760px] shrink-0 rounded-m">
      <div className="relative size-full overflow-hidden rounded-m">
        <img
          alt={`${title} 안내 화면`}
          className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
          height={imageDisplaySize.height}
          src={imageSrc}
          style={imageDisplaySize}
          width={imageDisplaySize.width}
        />
      </div>
    </div>
  )
}

export function HelpView({ renderMeetingTutorial }: HelpViewProps) {
  const [activeTab, setActiveTab] = useState<HelpTab>('introduction')
  const [introductionStep, setIntroductionStep] = useState(0)
  const [meetingStep, setMeetingStep] = useState<HelpMeetingTutorialStep>(1)
  const introduction = helpIntroductionSteps[introductionStep]
  const meeting = helpMeetingTutorialContent[meetingStep]
  const activeStep = activeTab === 'introduction' ? introductionStep + 1 : meetingStep

  const selectIntroduction = () => {
    setActiveTab('introduction')
    setIntroductionStep(0)
  }

  const selectMeeting = () => {
    setActiveTab('meeting')
    setMeetingStep(1)
  }

  const handleNext = () => {
    if (activeTab === 'introduction') {
      setIntroductionStep((current) => (current + 1) % helpIntroductionSteps.length)
      return
    }

    setMeetingStep((current) =>
      current === helpMeetingTutorialSteps.length ? 1 : ((current + 1) as HelpMeetingTutorialStep),
    )
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col items-center gap-s self-stretch">
      <header className="flex w-full shrink-0 flex-col gap-xs">
        <h1 className="m-0 typo-title-01 text-fg-primary">도움말</h1>
        <div
          aria-label="도움말 유형"
          className="flex w-full border-b-2 border-line-strong"
          role="tablist"
        >
          <button
            aria-selected={activeTab === 'introduction'}
            className={cn(
              'h-[64px] w-[190px] border-b-2 px-m typo-title-02',
              activeTab === 'introduction'
                ? 'border-fg-primary font-semibold! text-fg-primary'
                : 'border-transparent font-normal! text-fg-secondary',
            )}
            onClick={selectIntroduction}
            role="tab"
            type="button"
          >
            SynQ 소개 다시보기
          </button>
          <button
            aria-selected={activeTab === 'meeting'}
            className={cn(
              'h-[64px] w-[190px] border-b-2 px-m typo-title-02',
              activeTab === 'meeting'
                ? 'border-fg-primary font-semibold! text-fg-primary'
                : 'border-transparent font-normal! text-fg-secondary',
            )}
            onClick={selectMeeting}
            role="tab"
            type="button"
          >
            회의 사용법 다시보기
          </button>
        </div>
      </header>

      <div
        className={cn(
          'ml-[168px] flex min-h-0 flex-1 flex-col items-center gap-l self-start pb-s',
          'w-[760px]',
        )}
      >
        <div className="flex min-h-0 w-full flex-1 items-start justify-center overflow-y-auto pt-[44px]">
          {activeTab === 'introduction' ? (
            <HelpBoardImage
              imageDisplaySize={introduction.imageDisplaySize}
              imageSrc={introduction.imageSrc}
              title={introduction.title}
            />
          ) : (
            (renderMeetingTutorial?.(meetingStep) ?? (
              <div
                aria-label={`회의 사용법 ${meetingStep}단계 프레임`}
                className="h-[530px] w-[760px] shrink-0 rounded-m bg-surface-muted"
                role="img"
              />
            ))
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-s">
          <div
            aria-label={`${activeStep}/3 단계`}
            className="flex h-[6px] items-center gap-[6px]"
            role="status"
          >
            {[1, 2, 3].map((step) => (
              <span
                aria-hidden="true"
                className={cn(
                  'size-[6px] rounded-full',
                  step === activeStep ? 'bg-brand-primary' : 'bg-line-default',
                )}
                key={step}
              />
            ))}
          </div>

          <div className="flex w-[509px] flex-col items-center gap-xs text-center">
            <h2 className="m-0 typo-title-02 text-fg-primary">
              {activeTab === 'introduction' ? introduction.title : meeting.title}
            </h2>
            <p className="m-0 whitespace-pre-line typo-body-01 text-fg-secondary">
              {activeTab === 'introduction' ? introduction.description : meeting.description}
            </p>
          </div>
        </div>

        <Button className="w-[375px]" onClick={handleNext} size="large">
          {activeStep === 3 ? '다시보기' : '다음'}
        </Button>
      </div>
    </section>
  )
}
