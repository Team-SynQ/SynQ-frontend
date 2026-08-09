export interface KakaoLoginRequest {
  code: string
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
