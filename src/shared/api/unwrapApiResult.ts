import type { AxiosResponse } from 'axios'

import { ApiError } from './apiError'
import type { ApiResponse } from './contracts/api.contracts'

/**
 * 공통 응답 봉투를 벗겨 result만 돌려준다. 봉투는 전송 계층 밖으로 나가지 않는다.
 *
 * HTTP는 성공했는데 봉투가 실패를 말하는 경우가 있어, 실패 응답과 같은 `ApiError`로 맞춰 던진다.
 * 서버가 메시지를 주지 않을 때만 호출부가 준 문구를 쓴다.
 */
export function unwrapApiResult<T>(
  response: AxiosResponse<ApiResponse<T>>,
  failureMessage: string,
): T {
  const body = response.data

  if (!body?.isSuccess) {
    throw new ApiError(
      response.status,
      body?.code || 'UNKNOWN_ERROR',
      body?.message || failureMessage,
    )
  }

  return body.result
}
