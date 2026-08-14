import axios from 'axios'

import { API_BASE_URL } from './apiBaseUrl'
import { toApiError } from './apiError'
import { readAccessToken } from '../lib/authStorage'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

let isRedirecting = false

axiosInstance.interceptors.request.use((config) => {
  const accessToken = readAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// 401 세션 만료 감지 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)

    if (apiError.status === 401) {
      const requestUrl = axios.isAxiosError(error) ? error.config?.url : ''
      const isLoginEndpoint =
        requestUrl?.includes('/auth/kakao') ||
        requestUrl?.includes('/auth/google') ||
        requestUrl?.includes('/auth/naver')

      if (!isLoginEndpoint && !window.location.pathname.startsWith('/login')) {
        if (!isRedirecting) {
          isRedirecting = true

          try {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          } catch {
            // ignore
          }

          window.location.replace('/login')
        }
      }
    }

    return Promise.reject(apiError)
  },
)
