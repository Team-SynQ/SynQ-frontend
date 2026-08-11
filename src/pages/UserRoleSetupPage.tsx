import React, { useState, useEffect } from 'react'
import { userService } from '../shared/api/services/user.service'
import { Toast } from '../shared/ui/Toast'

const ROLE_OPTIONS = [
  { id: 'pm', label: '기획/운영', icon: '/assets/images/role-pm.png' },
  { id: 'design', label: '디자인/콘텐츠', icon: '/assets/images/role-design.png' },
  { id: 'dev', label: '개발/기술', icon: '/assets/images/role-dev.png' },
  { id: 'marketing', label: '마케팅/브랜딩', icon: '/assets/images/role-marketing.png' },
  { id: 'sales', label: '영업/고객', icon: '/assets/images/role-sales.png' },
  { id: 'data', label: '데이터/리서치', icon: '/assets/images/role-data.png' },
  { id: 'exec', label: '경영/전략', icon: '/assets/images/role-exec.png' },
  { id: 'etc', label: '기타', icon: '/assets/images/role-etc.png' },
]

interface UserRoleSetupPageProps {
  username?: string
  /** 초대로 참여한 프로젝트 이름. 있으면 프로젝트 참여용 문구로 바뀝니다. */
  projectName?: string
  onNext?: (data: { selectedRole: string; detailRole: string }) => void
  onPrev?: () => void
}

const UserRoleSetupPage: React.FC<UserRoleSetupPageProps> = ({
  username = 'username',
  projectName,
  onNext,
  onPrev,
}) => {
  const [displayName, setDisplayName] = useState<string>(username !== 'username' ? username : '')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [detailRole, setDetailRole] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const isEtcSelected = selectedRole === 'etc'
  const isNextEnabled = selectedRole !== null

  useEffect(() => {
    userService
      .getMe()
      .then((response) => {
        if (response.isSuccess && response.result?.name) {
          setDisplayName(response.result.name)
        }
      })
      .catch((error) => {
        console.error('사용자 정보 조회 실패:', error)
      })
  }, [])

  useEffect(() => {
    if (!showToast) return

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 2000)

    const removeTimer = setTimeout(() => {
      setShowToast(false)
      setIsFadingOut(false)
    }, 2300)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [showToast])

  const triggerToast = () => {
    setShowToast(false)
    setIsFadingOut(false)
    setTimeout(() => {
      setShowToast(true)
    }, 50)
  }

  const handleNext = () => {
    if (!selectedRole) return

    if (isEtcSelected && detailRole.trim().length === 0) {
      triggerToast()
      return
    }

    onNext?.({ selectedRole, detailRole })
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-screen bg-white px-4 py-8 select-none">
      {showToast && (
        <div
          className={`transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
        >
          <Toast
            type="error"
            size="compact"
            position="topCenter"
            title="기타 역할 세부 입력 누락"
            description="세부 역할을 입력해 주세요."
          />
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-[#0089FF]" />
        <span className="w-2 h-2 rounded-full bg-gray-200" />
        <span className="w-2 h-2 rounded-full bg-gray-200" />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
          {displayName ? `${displayName}님 반갑습니다.` : '반갑습니다.'}
        </h2>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
          {projectName ? (
            <>
              {`‘${projectName}’에서는`} <br />
              어떤 역할로 참여하시나요?
            </>
          ) : (
            '회의에서 어떤 역할로 참여하시나요?'
          )}
        </h1>
        <p className="text-xs md:text-sm text-gray-400">
          {projectName
            ? '"회의에서 나는 어떤 사람인가"를 의미해요.'
            : '내가 맡은 역할에 맞는 정보를 제공하기 위해 사용해요.'}
        </p>
      </div>

      <div className="w-full max-w-[580px] mb-6">
        <label className="block text-xs font-semibold text-gray-700 mb-2">역할 선택</label>
        <div className="grid grid-cols-4 gap-3">
          {ROLE_OPTIONS.map((role) => {
            const isSelected = selectedRole === role.id
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(role.id)
                  setShowToast(false)
                }}
                className={`flex flex-col items-center justify-between h-[124px] p-3 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#0089FF] bg-white shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="w-full h-[68px] bg-[#F2F7FF] rounded-xl flex items-center justify-center p-2">
                  <img src={role.icon} alt={role.label} className="w-12 h-12 object-contain" />
                </div>
                <span
                  className={`text-xs font-semibold pb-1 ${
                    isSelected ? 'text-[#0089FF]' : 'text-gray-800'
                  }`}
                >
                  {role.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-full max-w-[580px] mb-8">
        <div className="flex items-center gap-1 mb-2">
          <label className="text-xs font-semibold text-gray-700">세부 역할</label>
          {isEtcSelected ? (
            <span className="text-[#0089FF] text-xs font-bold">*</span>
          ) : (
            <span className="text-xs text-gray-400">선택</span>
          )}
        </div>

        <div className="relative">
          <textarea
            value={detailRole}
            onChange={(e) => {
              if (e.target.value.length <= 30) {
                setDetailRole(e.target.value)
                if (e.target.value.trim().length > 0) {
                  setShowToast(false)
                }
              }
            }}
            placeholder="세부역할이 있다면 입력해 주세요. ex) 제품 기획자"
            rows={3}
            className={`w-full p-4 rounded-xl border-2 bg-[#F9FAFB] text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-colors resize-none ${
              isEtcSelected && detailRole.length > 0
                ? 'border-[#0089FF]'
                : 'border-gray-200 focus:border-gray-300'
            }`}
          />
          <span className="absolute bottom-3 right-4 text-xs text-gray-400">
            {detailRole.length}/30
          </span>
        </div>
      </div>

      <div className="w-full max-w-[580px] flex flex-col items-center">
        <p className="text-xs text-gray-400 mb-4">
          {projectName
            ? '선택한 역할·관점은 계정의 기본 설정으로도 저장되며 추후 수정할 수 있어요.'
            : '모든 설정은 추후 수정 가능합니다.'}
        </p>

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="w-[120px] h-12 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold hover:bg-gray-200 transition-colors"
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

export default UserRoleSetupPage
