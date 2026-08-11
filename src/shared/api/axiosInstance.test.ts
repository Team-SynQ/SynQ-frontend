import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMocks = vi.hoisted(() => {
  const requestUse = vi.fn()
  const responseUse = vi.fn()
  const instance = {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  }

  return {
    create: vi.fn(() => instance),
    isAxiosError: vi.fn(() => false),
    requestUse,
    responseUse,
  }
})

vi.mock('axios', () => ({
  default: {
    create: axiosMocks.create,
    isAxiosError: axiosMocks.isAxiosError,
  },
}))

import { API_BASE_URL } from './apiBaseUrl'
import { ApiError } from './apiError'
import './axiosInstance'

describe('axiosInstance', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('uses the configured API base URL', () => {
    expect(axiosMocks.create).toHaveBeenCalledWith({
      baseURL: API_BASE_URL,
    })
  })

  it('adds the stored access token in the request interceptor', () => {
    window.localStorage.setItem('accessToken', 'access-token')
    const interceptor = axiosMocks.requestUse.mock.calls[0][0]
    const config = interceptor({ headers: {} })

    expect(config.headers.Authorization).toBe('Bearer access-token')
  })

  it('normalizes failed responses into ApiError', async () => {
    const onRejected = axiosMocks.responseUse.mock.calls[0][1]

    await expect(onRejected(new Error('boom'))).rejects.toBeInstanceOf(ApiError)
  })
})
