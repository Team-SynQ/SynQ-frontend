import axios from 'axios'

import type { ApiResponse } from './contracts/api.contracts'

/**
 * 서버 실패 응답을 화면에서 다루기 쉬운 형태로 정규화한 에러입니다.
 * 목 구현의 MockApiError와 같은 모양(status/code/message)이라 UI 처리 코드를 공유할 수 있습니다.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type ApiFailureBody = Partial<Pick<ApiResponse<unknown>, 'code' | 'message'>>

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const response = error.response

    // 응답 자체가 없으면 네트워크·CORS·타임아웃입니다.
    if (!response) {
      return new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.')
    }

    const body = response.data as ApiFailureBody | undefined

    return new ApiError(
      response.status,
      body?.code ?? 'UNKNOWN_ERROR',
      body?.message ?? '요청을 처리하지 못했습니다.',
    )
  }

  return new ApiError(
    0,
    'UNKNOWN_ERROR',
    error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
  )
}
