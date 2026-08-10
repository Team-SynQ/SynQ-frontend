const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://synq-api.duckdns.org'

export interface UserMeResult {
  userId: number
  name: string
  email: string
  provider: string
  profileImageUrl: string | null
}

export interface UserMeResponse {
  isSuccess: boolean
  code: string
  message: string
  result: UserMeResult
}

export const userService = {
  getMe: async (): Promise<UserMeResponse> => {
    const token = localStorage.getItem('accessToken')

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      throw new Error('사용자 정보 조회 실패')
    }

    return response.json()
  },
}