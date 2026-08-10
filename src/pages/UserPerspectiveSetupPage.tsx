import React, { useState } from 'react'

const PERSPECTIVE_OPTIONS = [
  { id: 'schedule', label: '일정' },
  { id: 'scope', label: '기능 범위' },
  { id: 'decision', label: '의사 결정' },
  { id: 'ux', label: '사용자 경험' },
  { id: 'tech_risk', label: '기술 리스크' },
  { id: 'cost_performance', label: '비용/성과' },
  { id: 'customer_feedback', label: '고객 반응' },
  { id: 'ops_issue', label: '운영 이슈' },
  { id: 'action_item', label: '액션 아이템' },
  { id: 'team_qna', label: '팀 질문' },
]

interface UserPerspectiveSetupPageProps {
  onNext?: (selectedPerspectives: string[]) => void
  onPrev?: () => void
}

const UserPerspectiveSetupPage: React.FC<UserPerspectiveSetupPageProps> = ({ onNext, onPrev }) => {
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
          SynQ가 어떤 관점으로 회의를 봐주면 좋을까요?
        </h1>
        <p className="text-xs md:text-sm text-gray-400">
          선택한 관점에 따라 AI Hint와 회의 정리가 달라져요.
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
        <p className="text-xs text-gray-400 mb-4">모든 설정은 추후 수정 가능합니다.</p>

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
