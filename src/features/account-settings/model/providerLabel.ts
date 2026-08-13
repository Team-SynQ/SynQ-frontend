const providerLabels: Record<string, string> = {
  GOOGLE: 'Google 가입',
  KAKAO: '카카오 가입',
  NAVER: '네이버 가입',
}

/** 운영은 소셜 3종만 지원하므로, 그 외(개발용 이메일 계정 등)는 이메일 가입으로 표시합니다. */
export function toProviderLabel(provider: string): string {
  return providerLabels[provider.toUpperCase()] ?? '이메일 가입'
}
