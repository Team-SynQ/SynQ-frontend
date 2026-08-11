import type { AxiosResponse } from 'axios'

import { ApiError, toApiError } from './apiError'
import type { ApiResponse } from './contracts/api.contracts'

/**
 * 실패를 도메인 문구로 보강한다.
 *
 * 서버가 사유를 준 경우(`code`가 있는 경우)와 네트워크 오류는 그대로 둔다.
 * 인터셉터가 붙인 기본값 `UNKNOWN_ERROR`일 때만, 어떤 동작이 실패했는지 알 수 있도록
 * 호출부의 문구로 바꾼다. 이러지 않으면 화면에 '요청을 처리하지 못했습니다.'만 남는다.
 */
function withFailureMessage(error: unknown, failureMessage: string): ApiError {
  const apiError = toApiError(error)
  if (apiError.code !== 'UNKNOWN_ERROR') return apiError

  return new ApiError(apiError.status, apiError.code, failureMessage)
}

/** 공통 응답 봉투를 벗겨 result만 돌려준다. 봉투는 전송 계층 밖으로 나가지 않는다. */
export function unwrapApiResult<T>(
  response: AxiosResponse<ApiResponse<T>>,
  failureMessage: string,
): T {
  const body = response.data

  // HTTP는 성공했는데 봉투가 실패를 말하는 경우가 있다. 실패 응답과 같은 ApiError로 맞춘다.
  if (!body?.isSuccess) {
    throw new ApiError(
      response.status,
      body?.code || 'UNKNOWN_ERROR',
      body?.message || failureMessage,
    )
  }

  return body.result
}

/** 봉투가 있는 요청을 보내고 result만 돌려준다. */
export async function requestApiResult<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
  failureMessage: string,
): Promise<T> {
  let response: AxiosResponse<ApiResponse<T>>

  try {
    response = await request
  } catch (error) {
    throw withFailureMessage(error, failureMessage)
  }

  return unwrapApiResult(response, failureMessage)
}

/** 본문이 없는 요청(204 등)을 보낸다. 벗길 봉투가 없으므로 실패만 다듬는다. */
export async function requestApiVoid(
  request: Promise<AxiosResponse<unknown>>,
  failureMessage: string,
): Promise<void> {
  try {
    await request
  } catch (error) {
    throw withFailureMessage(error, failureMessage)
  }
}
