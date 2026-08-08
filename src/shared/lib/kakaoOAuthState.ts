const KAKAO_OAUTH_STATE_KEY = 'kakaoOAuthState'

export function createKakaoOAuthState() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const state = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

  sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state)

  return state
}

export function consumeKakaoOAuthState(receivedState: string | null) {
  const storedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY)
  sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY)

  return Boolean(receivedState && storedState && receivedState === storedState)
}
