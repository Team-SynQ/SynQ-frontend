export interface KakaoLoginRequest {
  code: string
  /** 인가 요청에 사용한 redirect URI. 생략하면 백엔드 설정값으로 폴백한다. */
  redirectUri?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface NaverStateResult {
  state: string
}

export interface NaverStateResponse {
  isSuccess: boolean
  code: string
  message: string
  result: NaverStateResult
}

export interface NaverLoginRequest {
  code: string
  state: string
  /** 인가 요청에 사용한 redirect URI. 생략하면 백엔드 설정값으로 폴백한다. */
  redirectUri?: string
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  isNewUser: boolean
  onboardingCompleted: boolean
}

export interface AuthResponse {
  isSuccess: boolean
  code: string
  message: string
  result: AuthResult
}
