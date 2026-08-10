/**
 * 개발 서버에서는 Vite 프록시(/api)를 거쳐 같은 출처로 요청합니다.
 * 백엔드가 localhost 출처를 CORS 허용하기 전까지의 우회이며,
 * VITE_API_BASE_URL을 지정하면 그 값이 항상 우선합니다.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'https://synq-api.duckdns.org')

export const API_PROXY_PREFIX = '/api'
export const API_ORIGIN = 'https://synq-api.duckdns.org'
