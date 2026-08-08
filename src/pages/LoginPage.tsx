import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { createKakaoOAuthState } from '../shared/lib/kakaoOAuthState'
import { Toast } from '../shared/ui/Toast'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [toastOpacity, setToastOpacity] = useState(0)
  const [toastCycle] = useState(0)

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

  const handleOtherSocialLogin = () => {
    // TODO: 네이버/구글 로그인 구현 시 연동 처리
    navigate('/setup/role')
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

        <div className="flex flex-col w-full gap-3 mb-10">
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
            onClick={handleOtherSocialLogin}
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
            onClick={handleOtherSocialLogin}
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
