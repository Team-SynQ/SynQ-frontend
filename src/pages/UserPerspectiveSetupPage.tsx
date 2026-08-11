import React, { useState } from 'react'

import { PERSPECTIVE_OPTIONS } from './userSetupOptions'

interface UserPerspectiveSetupPageProps {
  /** 초대로 참여한 프로젝트 이름. 있으면 프로젝트 참여용 문구로 바뀝니다. */
  projectName?: string
  onNext?: (selectedPerspectives: string[]) => void
  onPrev?: () => void
}

const UserPerspectiveSetupPage: React.FC<UserPerspectiveSetupPageProps> = ({
  projectName,
  onNext,
  onPrev,
}) => {
  const [selectedPerspectives, setSelectedPerspectives] = useState<string[]>([])

  const handleToggle = (id: string) => {
    if (selectedPerspectives.includes(id)) {
      setSelectedPerspectives((prev) => prev.filter((item) => item !== id))
    } else {
      if (selectedPerspectives.length < 3) {
        setSelectedPerspectives((prev) => [...prev, id])
      }
    }
  }

  const isNextEnabled = selectedPerspectives.length > 0

  const handleNext = () => {
    if (!isNextEnabled) return
    onNext?.(selectedPerspectives)
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-screen bg-white px-4 py-8 select-none">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-gray-200" />
        <span className="w-2 h-2 rounded-full bg-[#0089FF]" />
        <span className="w-2 h-2 rounded-full bg-gray-200" />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
          {projectName ? (
            <>
              {`‘${projectName}’ 회의에서`} <br />
              어떤 내용을 중요하게 보고 싶나요?
            </>
          ) : (
            'SynQ가 어떤 관점으로 회의를 봐주면 좋을까요?'
          )}
        </h1>
        <p className="text-xs md:text-sm text-gray-400">
          {projectName
            ? '관점은 "회의 내용을 어떤 기준으로 보고 싶은가"를 의미해요.'
            : '선택한 관점에 따라 AI Hint와 회의 정리가 달라져요.'}
        </p>
      </div>

      <div className="w-full max-w-[540px] mb-8">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-semibold text-gray-700">관점 선택</span>
          <span className="text-xs text-gray-400">선택 · 최대 3개</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PERSPECTIVE_OPTIONS.map((option) => {
            const isChecked = selectedPerspectives.includes(option.id)
            const isMaxReached = selectedPerspectives.length >= 3
            const isDisabled = !isChecked && isMaxReached

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggle(option.id)}
                disabled={isDisabled}
                className={`flex items-center gap-3 h-14 px-4 rounded-xl border-2 transition-all text-left ${
                  isChecked
                    ? 'border-[#0089FF] bg-white shadow-sm'
                    : isDisabled
                      ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-[#0089FF] text-white' : 'border border-gray-300 bg-white'
                  }`}
                >
                  {isChecked && (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  )}
                </div>

                <span
                  className={`text-sm font-semibold ${
                    isChecked ? 'text-gray-900' : isDisabled ? 'text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-full max-w-[540px] flex flex-col items-center">
        <p className="text-xs text-gray-400 mb-4">
          {projectName
            ? '선택한 역할·관점은 계정의 기본 설정으로도 저장되며 추후 수정할 수 있어요.'
            : '모든 설정은 추후 수정 가능합니다.'}
        </p>

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="w-[120px] h-12 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            이전
          </button>
          <button
            type="button"
            disabled={!isNextEnabled}
            onClick={handleNext}
            className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-colors ${
              isNextEnabled
                ? 'bg-[#0089FF] text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserPerspectiveSetupPage
