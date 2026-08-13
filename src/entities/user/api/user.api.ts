import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { ApiResponse } from '../../../shared/api/contracts/api.contracts'
import type {
  ProfileImageResponse,
  RoleProfileRequest,
  RoleProfileResponse,
  UserMeResponse,
  UserNameUpdateRequest,
} from '../../../shared/api/contracts/user.contracts'
import type { CurrentUser, RoleProfile } from '../model/user.types'

export type UserApi = {
  getMe(): Promise<UserMeResponse>
  updateMyName(request: UserNameUpdateRequest): Promise<UserMeResponse>
  getMyRoleProfiles(): Promise<RoleProfileResponse[]>
  createRoleProfile(request: RoleProfileRequest): Promise<RoleProfileResponse>
  setDefaultRoleProfile(profileId: number): Promise<void>
  updateRoleProfile(profileId: number, request: RoleProfileRequest): Promise<RoleProfileResponse>
  deleteRoleProfile(profileId: number): Promise<void>
  uploadProfileImage(file: File): Promise<ProfileImageResponse>
  deleteProfileImage(): Promise<void>
}

export const userApi: UserApi = {
  async getMe() {
    const response = await axiosInstance.get<ApiResponse<UserMeResponse>>('/users/me')
    return response.data.result
  },
  async updateMyName(request) {
    const response = await axiosInstance.patch<ApiResponse<UserMeResponse>>(
      '/users/me/name',
      request,
    )
    return response.data.result
  },
  async getMyRoleProfiles() {
    const response =
      await axiosInstance.get<ApiResponse<RoleProfileResponse[]>>('/users/me/role-profiles')
    return response.data.result
  },
  async createRoleProfile(request) {
    const response = await axiosInstance.post<ApiResponse<RoleProfileResponse>>(
      '/users/me/role-profiles',
      request,
    )
    return response.data.result
  },
  async setDefaultRoleProfile(profileId) {
    await axiosInstance.patch(`/users/me/role-profiles/${profileId}/default`)
  },
  async updateRoleProfile(profileId, request) {
    const response = await axiosInstance.patch<ApiResponse<RoleProfileResponse>>(
      `/users/me/role-profiles/${profileId}`,
      request,
    )
    return response.data.result
  },
  async deleteRoleProfile(profileId) {
    await axiosInstance.delete(`/users/me/role-profiles/${profileId}`)
  },
  async uploadProfileImage(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosInstance.post<ApiResponse<ProfileImageResponse>>(
      '/users/me/profile-image',
      formData,
    )
    return response.data.result
  },
  async deleteProfileImage() {
    await axiosInstance.delete('/users/me/profile-image')
  },
}

// 사이드바 등 화면은 빈 문자열을 기대하므로 email의 null을 여기서 흡수합니다.
function toCurrentUser(me: UserMeResponse): CurrentUser {
  return {
    userId: me.userId,
    name: me.name,
    email: me.email ?? '',
    profileImageUrl: me.profileImageUrl,
  }
}

export async function loadCurrentUser(): Promise<CurrentUser> {
  console.log('[user] 내 정보 조회 시작')

  try {
    const me = await userApi.getMe()
    console.log('[user] 내 정보 조회 성공', { userId: me.userId, provider: me.provider })

    return toCurrentUser(me)
  } catch (error) {
    console.error('[user] 내 정보 조회 실패', { error })
    throw error
  }
}

export async function changeMyName(name: string): Promise<CurrentUser> {
  console.log('[user] 이름 변경 시작')

  try {
    const me = await userApi.updateMyName({ name })
    console.log('[user] 이름 변경 성공', { userId: me.userId })
    return toCurrentUser(me)
  } catch (error) {
    console.error('[user] 이름 변경 실패', { error })
    throw error
  }
}

export async function loadMyRoleProfiles(): Promise<RoleProfile[]> {
  console.log('[user] 역할·관점 프로필 조회 시작')

  try {
    const profiles = await userApi.getMyRoleProfiles()
    console.log('[user] 역할·관점 프로필 조회 성공', { profileCount: profiles.length })
    return profiles
  } catch (error) {
    console.error('[user] 역할·관점 프로필 조회 실패', { error })
    throw error
  }
}

export async function changeDefaultRoleProfile(profileId: number): Promise<void> {
  console.log('[user] 기본 관점 변경 시작', { profileId })

  try {
    await userApi.setDefaultRoleProfile(profileId)
    console.log('[user] 기본 관점 변경 성공', { profileId })
  } catch (error) {
    console.error('[user] 기본 관점 변경 실패', { profileId, error })
    throw error
  }
}

export async function addMyRoleProfile(request: RoleProfileRequest): Promise<RoleProfile> {
  console.log('[user] 역할·관점 프로필 추가 시작')

  try {
    const created = await userApi.createRoleProfile(request)
    console.log('[user] 역할·관점 프로필 추가 성공', {
      profileId: created.id,
      isDefault: created.isDefault,
    })
    return created
  } catch (error) {
    console.error('[user] 역할·관점 프로필 추가 실패', { error })
    throw error
  }
}

export async function changeMyRoleProfile(
  profileId: number,
  request: RoleProfileRequest,
): Promise<RoleProfile> {
  console.log('[user] 역할·관점 프로필 수정 시작', { profileId })

  try {
    const updated = await userApi.updateRoleProfile(profileId, request)
    console.log('[user] 역할·관점 프로필 수정 성공', { profileId })
    return updated
  } catch (error) {
    console.error('[user] 역할·관점 프로필 수정 실패', { profileId, error })
    throw error
  }
}

export async function removeMyRoleProfile(profileId: number): Promise<void> {
  console.log('[user] 역할·관점 프로필 삭제 시작', { profileId })

  try {
    await userApi.deleteRoleProfile(profileId)
    console.log('[user] 역할·관점 프로필 삭제 성공', { profileId })
  } catch (error) {
    console.error('[user] 역할·관점 프로필 삭제 실패', { profileId, error })
    throw error
  }
}

export async function changeMyProfileImage(file: File): Promise<string> {
  console.log('[user] 프로필 이미지 변경 시작', { fileName: file.name, fileSize: file.size })

  try {
    const { profileImageUrl } = await userApi.uploadProfileImage(file)
    console.log('[user] 프로필 이미지 변경 성공')
    return profileImageUrl
  } catch (error) {
    console.error('[user] 프로필 이미지 변경 실패', { error })
    throw error
  }
}

export async function resetMyProfileImage(): Promise<void> {
  console.log('[user] 기본 이미지로 변경 시작')

  try {
    await userApi.deleteProfileImage()
    console.log('[user] 기본 이미지로 변경 성공')
  } catch (error) {
    console.error('[user] 기본 이미지로 변경 실패', { error })
    throw error
  }
}
