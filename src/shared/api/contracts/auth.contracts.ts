export interface KakaoLoginRequest {
  code: string
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