const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://api.synqai.co.kr')

/**
 * 개발 서버에서는 Vite 프록시(/api)를 거쳐 같은 출처로 요청합니다.
 * 백엔드가 localhost 출처를 CORS 허용하기 전까지의 우회이며,
 * VITE_API_BASE_URL을 지정하면 그 값이 항상 우선합니다.
 *
 * 소비자가 `${API_BASE_URL}/path` 형태로 이어 붙이므로 끝 슬래시는 여기서 벗깁니다.
 * 환경변수에 슬래시를 붙여 넣으면 경로가 `//path`가 되어 서버 라우팅이 어긋납니다.
 */
export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '')

export const API_PROXY_PREFIX = '/api'
export const API_ORIGIN = 'https://api.synqai.co.kr'
