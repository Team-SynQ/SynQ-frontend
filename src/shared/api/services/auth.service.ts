import { API_BASE_URL } from '../apiBaseUrl'
import { readAccessToken } from '../../lib/authStorage'
import type {
  KakaoLoginRequest,
  GoogleLoginRequest,
  EmailLoginRequest,
  RefreshTokenRequest,
  NaverStateResponse,
  NaverLoginRequest,
  AuthResponse,
} from '../contracts/auth.contracts'

export const authService = {
  kakaoLogin: async (data: KakaoLoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/kakao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('카카오 로그인 요청 실패')
    return response.json()
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('구글 로그인 요청 실패')
    return response.json()
  },

  /** 이메일·비밀번호 로그인. 비밀번호가 틀리면 401이 돌아와 여기서 에러로 바뀝니다. */
  emailLogin: async (data: EmailLoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('이메일 로그인 요청 실패')
    return response.json()
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('토큰 재발급 요청 실패')
    return response.json()
  },

  getNaverState: async (): Promise<NaverStateResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/naver/state`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('네이버 state 발급 요청 실패')
    return response.json()
  },

  naverLogin: async (data: NaverLoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/naver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('네이버 로그인 요청 실패')
    return response.json()
  },

  logout: async (): Promise<{
    isSuccess: boolean
    code: string
    message: string
    result: string
  }> => {
    const token = readAccessToken()

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!response.ok) throw new Error('로그아웃 요청 실패')
    return response.json()
  },
}
