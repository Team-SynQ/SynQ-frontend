import { useState } from 'react'

import { Button } from '../../../shared/ui'
import { helpIntroductionSteps, type HelpIntroductionStep } from '../model/helpIntroduction.config'

export type HelpViewProps = {
  onOpenMeetingTutorial?: () => void
}

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

export function HelpView({ onOpenMeetingTutorial }: HelpViewProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = helpIntroductionSteps[currentStep]
  const lastStep = currentStep === helpIntroductionSteps.length - 1

  const handleNext = () => {
    setCurrentStep((current) => (current + 1) % helpIntroductionSteps.length)
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
            aria-selected="true"
            className="h-[64px] w-[190px] border-b-2 border-fg-primary px-m font-semibold typo-title-02 text-[#121212]"
            onClick={() => setCurrentStep(0)}
            role="tab"
            type="button"
          >
            SynQ 소개 다시보기
          </button>
          <button
            aria-selected="false"
            className="h-[64px] w-[190px] border-b-2 border-transparent px-m typo-title-02 text-fg-secondary"
            onClick={onOpenMeetingTutorial}
            role="tab"
            type="button"
          >
            회의 사용법 다시보기
          </button>
        </div>
      </header>

      <div className="ml-[168px] flex min-h-0 w-[760px] flex-1 flex-col items-center gap-l self-start pb-s">
        <div className="flex min-h-0 w-full flex-1 items-start justify-center overflow-y-auto pt-[44px]">
          <HelpBoardImage
            imageDisplaySize={step.imageDisplaySize}
            imageSrc={step.imageSrc}
            title={step.title}
          />
        </div>

        <div className="flex shrink-0 flex-col items-center gap-s">
          <div
            aria-label={`${currentStep + 1}/${helpIntroductionSteps.length} 단계`}
            className="flex h-[6px] items-center gap-[4px]"
            role="status"
          >
            {helpIntroductionSteps.map((item, index) => (
              <span
                aria-hidden="true"
                className={`size-[6px] rounded-full ${
                  index === currentStep ? 'bg-brand-primary' : 'bg-line-default'
                }`}
                key={item.title}
              />
            ))}
          </div>

          <div className="flex w-[509px] flex-col items-center gap-xs text-center">
            <h2 className="m-0 typo-title-02 text-fg-primary">{step.title}</h2>
            <p className="m-0 whitespace-pre-line typo-body-01 text-fg-secondary">
              {step.description}
            </p>
          </div>
        </div>

        <Button className="w-[375px]" onClick={handleNext} size="large">
          {lastStep ? '다시보기' : '다음'}
        </Button>
      </div>
    </section>
  )
}
