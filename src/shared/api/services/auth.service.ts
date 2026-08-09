import type {
  KakaoLoginRequest,
  RefreshTokenRequest,
  AuthResponse,
} from '../contracts/auth.contracts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://synq-api.duckdns.org'

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

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('토큰 재발급 요청 실패')
    return response.json()
  },
}
