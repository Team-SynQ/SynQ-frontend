import React from 'react'

interface UserSetupPreviewPageProps {
  selectedRoleLabel?: string
  selectedRoleIcon?: string
  detailRole?: string
  selectedPerspectiveLabels?: string[]
  onComplete?: () => void
  onPrev?: () => void
}

const UserSetupPreviewPage: React.FC<UserSetupPreviewPageProps> = ({
  selectedRoleLabel = '',
  selectedRoleIcon = '',
  detailRole = '',
  selectedPerspectiveLabels = [],
  onComplete,
  onPrev,
}) => {
  const perspectivesText =
    selectedPerspectiveLabels.length > 0 ? selectedPerspectiveLabels.join(', ') : '-'

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-screen bg-white px-4 py-8 select-none">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-[#0089FF]" />
        <span className="w-2 h-2 rounded-full bg-[#0089FF]" />
        <span className="w-2 h-2 rounded-full bg-[#0089FF]" />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
          선택 결과 미리보기
        </h1>
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
          SynQ가 나에게 더 필요한 힌트와 정리를
          <br className="block sm:hidden" />
          제공할 수 있도록 마지막으로 확인해 주세요.
        </p>
      </div>

      <div className="w-full max-w-[480px] mb-8">
        <div className="w-full h-[140px] bg-[#F2F7FF] rounded-2xl flex items-center justify-center p-4 mb-6 overflow-hidden">
          {selectedRoleIcon && (
            <img
              src={selectedRoleIcon}
              alt={selectedRoleLabel}
              className="h-20 w-20 object-contain"
            />
          )}
        </div>

        <div className="flex flex-col gap-3 px-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">역할</span>
            <span className="text-gray-900 font-semibold">{selectedRoleLabel || '-'}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">세부 역할</span>
            <span className="text-gray-900 font-semibold">{detailRole || '-'}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">관점</span>
            <span className="text-gray-900 font-semibold text-right pl-4">{perspectivesText}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[480px] flex flex-col items-center">
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
            onClick={onComplete}
            className="flex-1 h-12 rounded-xl bg-[#0089FF] text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserSetupPreviewPage
