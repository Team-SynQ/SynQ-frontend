import React, { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { consumePendingInviteToken } from '../features/project-invite'
import { authService } from '../shared/api/services/auth.service'
import { saveAuthTokens } from '../shared/lib/authStorage'
import { createKakaoOAuthState } from '../shared/lib/kakaoOAuthState'
import { Button, InputBox } from '../shared/ui'
import { Toast } from '../shared/ui/Toast'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [toastOpacity, setToastOpacity] = useState(0)
  const [toastCycle] = useState(0)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isEmailLoginSubmitting, setIsEmailLoginSubmitting] = useState(false)
  const [emailLoginError, setEmailLoginError] = useState<string | null>(null)

  /**
   * 대회 심사처럼 소셜 계정을 쓸 수 없는 경우를 위한 이메일 로그인입니다.
   * 로그인 후 어디로 보낼지는 소셜 로그인 콜백과 같은 기준을 씁니다.
   */
  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isEmailLoginSubmitting) return

    setIsEmailLoginSubmitting(true)
    setEmailLoginError(null)

    try {
      const response = await authService.emailLogin({ email: email.trim(), password })
      if (!response.isSuccess || !response.result) throw new Error('이메일 로그인 실패')

      const { accessToken, refreshToken, isNewUser, onboardingCompleted } = response.result
      saveAuthTokens({ accessToken, refreshToken })

      const needsSetup = isNewUser || !onboardingCompleted
      const pendingInviteToken = needsSetup ? null : consumePendingInviteToken()
      const targetPath = needsSetup
        ? '/setup/role'
        : pendingInviteToken
          ? `/invite/${pendingInviteToken}`
          : '/projects'

      navigate(targetPath, { replace: true })
    } catch (error) {
      // 서버가 401로 구분해 주지만, 어느 쪽이 틀렸는지는 알려 주지 않는 편이 안전합니다.
      console.error('이메일 로그인 실패:', error)
      setEmailLoginError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setIsEmailLoginSubmitting(false)
    }
  }

  const handleKakaoLogin = () => {
    const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID
    const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI

    if (!clientId || !redirectUri) {
      console.error(
        '.env 파일에 카카오 설정 정보(VITE_KAKAO_CLIENT_ID, VITE_KAKAO_REDIRECT_URI)가 존재하지 않습니다.',
      )
      return
    }

    const state = createKakaoOAuthState()
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code&state=${encodeURIComponent(state)}`

    window.location.href = kakaoAuthUrl
  }

  const handleNaverLogin = async () => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID
    const redirectUri = import.meta.env.VITE_NAVER_REDIRECT_URI

    if (!clientId || !redirectUri) {
      console.error(
        '.env 파일에 네이버 설정 정보(VITE_NAVER_CLIENT_ID, VITE_NAVER_REDIRECT_URI)가 존재하지 않습니다.',
      )
      return
    }

    try {
      const response = await authService.getNaverState()

      if (response.isSuccess && response.result.state) {
        const state = response.result.state
        const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri,
        )}&state=${encodeURIComponent(state)}`

        window.location.href = naverAuthUrl
      }
    } catch (error) {
      console.error('네이버 로그인 요청 실패:', error)
    }
  }

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI

    if (!clientId || !redirectUri) {
      console.error(
        '.env 파일에 구글 설정 정보(VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI)가 존재하지 않습니다.',
      )
      return
    }

    const googleAuthUrl =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&response_type=code' +
      '&scope=openid%20email%20profile'

    window.location.href = googleAuthUrl
  }

  useEffect(() => {
    if (showToast) {
      const fadeInTimer = setTimeout(() => {
        setToastOpacity(1)
      }, 50)

      const fadeOutTimer = setTimeout(() => {
        setToastOpacity(0)
      }, 3000)

      const removeTimer = setTimeout(() => {
        setShowToast(false)
      }, 3300)

      return () => {
        clearTimeout(fadeInTimer)
        clearTimeout(fadeOutTimer)
        clearTimeout(removeTimer)
      }
    }
  }, [showToast, toastCycle])

  return (
    <div className="flex w-screen h-screen justify-center items-center bg-[#F4F6F9] select-none relative">
      {showToast && (
        <div
          style={{
            opacity: toastOpacity,
            transition: 'opacity 300ms ease-in-out',
          }}
          className="fixed z-50 top-10 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] md:w-[400px]"
        >
          <Toast
            type="error"
            size="compact"
            position="topRight"
            title="소셜 인증 실패"
            description="로그인을 완료하지 못했습니다. 다시 시도해 주세요."
            className="!static !w-full"
          />
        </div>
      )}

      <div className="w-[480px] bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-10 py-12 flex flex-col items-start text-left">
        <div className="mb-6">
          <img
            src="/assets/images/landing-wordmark.png"
            alt="SynQ 로고"
            className="h-[30px] w-auto object-contain"
          />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-2">
          씽큐로 모두의 이해를 하나로
          <br />
          씽크를 맞춰보아요 :)
        </h1>

        <p className="text-gray-400 text-xs md:text-sm mb-10">1분이면 회원가입 가능해요.</p>

        <div className="flex flex-col w-full gap-3 mb-6">
          <button
            onClick={handleKakaoLogin}
            className="flex items-center justify-center w-full h-12 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-semibold text-sm rounded-xl transition-colors relative cursor-pointer"
          >
            <img
              src="/assets/images/logo-kakao.png"
              alt=""
              className="w-6 h-6 absolute left-6 object-contain"
            />
            카카오로 계속하기
          </button>

          <button
            onClick={handleNaverLogin}
            className="flex items-center justify-center w-full h-12 bg-[#03C75A] hover:bg-[#02B34F] text-white font-semibold text-sm rounded-xl transition-colors relative cursor-pointer"
          >
            <img
              src="/assets/images/logo-naver.png"
              alt=""
              className="w-6 h-6 absolute left-6 object-contain"
            />
            네이버로 계속하기
          </button>

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full h-12 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#333333] font-semibold text-sm rounded-xl transition-colors relative cursor-pointer"
          >
            <img
              src="/assets/images/logo-google.png"
              alt=""
              className="w-6 h-6 absolute left-6 object-contain"
            />
            구글로 계속하기
          </button>
        </div>

        <div className="flex w-full items-center gap-3 mb-6">
          <span className="h-[1px] flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <span className="h-[1px] flex-1 bg-gray-200" />
        </div>

        <form
          className="flex flex-col w-full gap-3 mb-10"
          onSubmit={(event) => void handleEmailLogin(event)}
        >
          <InputBox
            autoComplete="email"
            disabled={isEmailLoginSubmitting}
            label="이메일"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="이메일을 입력해 주세요"
            required
            size="large"
            type="email"
            value={email}
          />
          <InputBox
            autoComplete="current-password"
            disabled={isEmailLoginSubmitting}
            errorText={emailLoginError ?? undefined}
            label="비밀번호"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력해 주세요"
            required
            size="large"
            type="password"
            value={password}
          />
          <Button
            aria-busy={isEmailLoginSubmitting}
            className="w-full"
            disabled={isEmailLoginSubmitting || !email.trim() || !password}
            size="large"
            type="submit"
          >
            {isEmailLoginSubmitting ? '로그인 중...' : '이메일로 로그인'}
          </Button>
        </form>

        <footer className="flex justify-center items-center w-full gap-4 text-xs text-gray-400">
          <button
            type="button"
            onClick={() => navigate('/privacy')}
            className="hover:underline focus:outline-none cursor-pointer"
          >
            개인정보 처리방침
          </button>
          <span className="w-[1px] h-3 bg-gray-200" />
          <button
            type="button"
            onClick={() => navigate('/terms')}
            className="hover:underline focus:outline-none cursor-pointer"
          >
            이용 약관
          </button>
        </footer>
      </div>
    </div>
  )
}

export default LoginPage
