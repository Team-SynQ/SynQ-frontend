export type UserMeResponse = {
  userId: number
  name: string
  /** 소셜 로그인 사용자는 이메일이 없을 수 있습니다. */
  email: string | null
  provider: string
  /** 프로필 이미지를 등록한 적이 없으면 null입니다. */
  profileImageUrl: string | null
}

export type UserNameUpdateRequest = {
  name: string
}

export type ProfileImageResponse = {
  profileImageUrl: string
}

export type RoleProfileRole =
  | 'PLANNING_OPERATION'
  | 'DESIGN_CONTENT'
  | 'DEV_TECH'
  | 'MARKETING_BRANDING'
  | 'SALES_CUSTOMER'
  | 'DATA_RESEARCH'
  | 'STRATEGY_MANAGEMENT'
  | 'ETC'

export type RoleProfilePerspective =
  | 'SCHEDULE'
  | 'SCOPE'
  | 'DECISION'
  | 'UX'
  | 'TECH_RISK'
  | 'COST_PERFORMANCE'
  | 'CUSTOMER_REACTION'
  | 'OPERATION_ISSUE'
  | 'ACTION_ITEM'
  | 'TEAM_QUESTION'

export type RoleProfileRequest = {
  role: RoleProfileRole
  detailRole?: string
  perspectives: RoleProfilePerspective[]
}

export type RoleProfileResponse = {
  id: number
  isDefault: boolean
  role: RoleProfileRole
  detailRole?: string
  perspectives: RoleProfilePerspective[]
}
