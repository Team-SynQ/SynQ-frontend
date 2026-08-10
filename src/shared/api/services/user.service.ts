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

export interface CreateRoleProfileRequest {
  role: string
  detailRole?: string
  perspectives: string[]
}

export interface RoleProfileResult {
  id: number
  isDefault: boolean
  role: string
  detailRole: string
  perspectives: string[]
}

export interface CreateRoleProfileResponse {
  isSuccess: boolean
  code: string
  message: string
  result: RoleProfileResult
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

  createRoleProfile: async (
    payload: CreateRoleProfileRequest,
  ): Promise<CreateRoleProfileResponse> => {
    const token = localStorage.getItem('accessToken')

    const response = await fetch(`${API_BASE_URL}/users/me/role-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('역할/관점 프로필 저장 실패')
    }

    return response.json()
  },
}