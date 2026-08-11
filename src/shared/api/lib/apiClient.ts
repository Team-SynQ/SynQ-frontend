import type { ApiResponse } from '../contracts/meeting.contracts'

/**
 * 회의·전사를 mock 대신 실제 백엔드에 붙일지 결정한다.
 * 프로젝트 API가 아직 mock이라 기본값은 mock이고, 실제 연동 확인이 필요할 때만 켠다.
 *
 * 테스트에서는 항상 mock을 쓴다. `.env.local`의 플래그가 vitest까지 새어 들어가면
 * 테스트가 실제 네트워크를 호출하게 된다. (`mock/lib/mockApi.ts`도 같은 방식으로 test를 가른다.)
 */
export const USE_REAL_MEETING_API =
  import.meta.env.MODE !== 'test' && import.meta.env.VITE_USE_REAL_MEETING_API === 'true'

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

/**
 * Swagger의 bearerAuth를 사용하는 요청 헤더를 만든다.
 * 토큰이 없으면 Authorization을 붙이지 않고, 서버가 401로 판단하게 둔다.
 */
export function createAuthHeaders(): Record<string, string> {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/** 공통 응답 봉투를 벗겨 result만 돌려준다. 봉투는 전송 계층 밖으로 나가지 않는다. */
export async function readApiResult<T>(response: Response, failureMessage: string): Promise<T> {
  if (!response.ok) throw new Error(failureMessage)

  const body = (await response.json()) as ApiResponse<T>
  if (!body.isSuccess) throw new Error(body.message || failureMessage)
  return body.result
}
