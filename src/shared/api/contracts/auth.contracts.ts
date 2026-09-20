export interface GoogleLoginRequest {
  code: string
  redirectUri: string
}

export interface KakaoLoginRequest {
  code: string
  /** 인가 요청에 사용한 redirect URI. 생략하면 백엔드 설정값으로 폴백한다. */
  redirectUri?: string
}

/**
 * 이메일·비밀번호 로그인. 서버 명세상 개발·테스트용 API이며,
 * 실제 사용자 가입 경로는 카카오·네이버·구글 소셜 로그인뿐입니다.
 */
export interface EmailLoginRequest {
  email: string
  password: string
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
