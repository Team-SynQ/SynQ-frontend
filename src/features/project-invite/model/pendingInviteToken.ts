const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken'

/** 참여에는 로그인이 필요하므로, 로그인 직전에 초대 토큰을 보관했다가 로그인 후 초대 화면으로 복귀할 때 사용합니다. */
export function savePendingInviteToken(inviteToken: string) {
  sessionStorage.setItem(PENDING_INVITE_TOKEN_KEY, inviteToken)
}

export function consumePendingInviteToken(): string | null {
  const inviteToken = sessionStorage.getItem(PENDING_INVITE_TOKEN_KEY)
  sessionStorage.removeItem(PENDING_INVITE_TOKEN_KEY)
  return inviteToken
}
