import type {
  RoleProfilePerspective,
  RoleProfileRole,
} from '../../../shared/api/contracts/user.contracts'

export type CurrentUser = {
  userId: number
  name: string
  email: string
  provider: string
  profileImageUrl: string | null
}

/** 서버가 내려주는 역할·관점 프로필입니다. 화면 라벨 변환은 상위 레이어가 담당합니다. */
export type RoleProfile = {
  id: number
  isDefault: boolean
  role: RoleProfileRole
  detailRole?: string
  perspectives: RoleProfilePerspective[]
}
