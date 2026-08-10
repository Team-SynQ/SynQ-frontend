import axios from 'axios'

import { API_BASE_URL } from './apiBaseUrl'
import { toApiError } from './apiError'
import { readAccessToken } from '../lib/authStorage'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

axiosInstance.interceptors.request.use((config) => {
  const accessToken = readAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// 서버 실패 응답을 ApiError(status/code/message)로 정규화해 화면으로 넘깁니다.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
