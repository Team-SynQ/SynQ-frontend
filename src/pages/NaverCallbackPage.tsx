import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { authService } from '../shared/api/services/auth.service'
import { Toast } from '../shared/ui/Toast'

export const NaverCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [showToast, setShowToast] = useState(false)
  const [toastOpacity, setToastOpacity] = useState(0)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [toastTitle, setToastTitle] = useState('')
  const [toastDescription, setToastDescription] = useState('')

  const isSubmitted = useRef(false)
  const toastTimerIdsRef = useRef<number[]>([])

  const scheduleToastTimer = useCallback((handler: () => void, delayMs: number) => {
    toastTimerIdsRef.current.push(window.setTimeout(handler, delayMs))
  }, [])

  // unmount 후 navigate가 실행되지 않도록 예약된 토스트 타이머를 정리합니다.
  useEffect(() => {
    const timerIds = toastTimerIdsRef.current
    return () => {
      timerIds.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [])

  const triggerSuccessToast = useCallback(
    (targetPath: string) => {
      setToastType('success')
      setToastTitle('로그인 성공')
      setToastDescription('성공적으로 로그인되었습니다.')
      setShowToast(true)
      setToastOpacity(1)

      scheduleToastTimer(() => {
        setToastOpacity(0)
      }, 1200)

      scheduleToastTimer(() => {
        setShowToast(false)
        navigate(targetPath)
      }, 1500)
    },
    [navigate, scheduleToastTimer],
  )

  const triggerErrorToast = useCallback(() => {
    setToastType('error')
    setToastTitle('소셜 인증 실패')
    setToastDescription('로그인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
    setShowToast(true)
    setToastOpacity(1)

    scheduleToastTimer(() => {
      setToastOpacity(0)
    }, 2200)

    scheduleToastTimer(() => {
      setShowToast(false)
      navigate('/login')
    }, 2500)
  }, [navigate, scheduleToastTimer])

  useEffect(() => {
    if (isSubmitted.current) return
    isSubmitted.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      void Promise.resolve().then(triggerErrorToast)
      return
    }

    authService
      .naverLogin({ code, state, redirectUri: import.meta.env.VITE_NAVER_REDIRECT_URI })
      .then((response) => {
        if (response.isSuccess && response.result) {
          const { accessToken, refreshToken, isNewUser, onboardingCompleted } = response.result

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          const targetPath = isNewUser || !onboardingCompleted ? '/setup/role' : '/projects'
          triggerSuccessToast(targetPath)
        } else {
          triggerErrorToast()
        }
      })
      .catch((error) => {
        console.error('네이버 로그인 인증 실패:', error)
        triggerErrorToast()
      })
  }, [searchParams, triggerErrorToast, triggerSuccessToast])

  return (
    <div className="relative flex w-screen h-screen justify-center items-center bg-[#F4F6F9] text-gray-600 font-medium text-sm select-none">
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: toastOpacity,
            transition: 'opacity 300ms ease-in-out',
            zIndex: 9999,
            width: '100%',
            maxWidth: '400px',
            padding: '0 16px',
            boxSizing: 'border-box',
          }}
          className="pointer-events-none"
        >
          <div className="pointer-events-auto">
            <Toast
              type={toastType}
              size="compact"
              title={toastTitle}
              description={toastDescription}
              className="!w-full !static !transform-none !top-auto !right-auto !left-auto"
            />
          </div>
        </div>
      )}
      네이버 로그인 처리 중입니다...
    </div>
  )
}

export default NaverCallbackPage
