import { axiosInstance } from '../axiosInstance'

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
    const response = await axiosInstance.get<UserMeResponse>('/users/me')
    return response.data
  },

  createRoleProfile: async (
    payload: CreateRoleProfileRequest,
  ): Promise<CreateRoleProfileResponse> => {
    const response = await axiosInstance.post<CreateRoleProfileResponse>(
      '/users/me/role-profiles',
      payload,
    )
    return response.data
  },
}
