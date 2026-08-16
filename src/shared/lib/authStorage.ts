const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
export const ONBOARDING_COMPLETED_KEY = 'synq_has_seen_onboarding'

export function readAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function saveAuthTokens(tokens: { accessToken: string; refreshToken: string }) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearAuthTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(ONBOARDING_COMPLETED_KEY)
}

export function clearOnboardingHistory() {
  window.localStorage.removeItem(ONBOARDING_COMPLETED_KEY)
}
