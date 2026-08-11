import { describe, expect, it } from 'vitest'

import { PERSPECTIVE_OPTIONS, ROLE_OPTIONS } from '../../pages/userSetupOptions'
import {
  PERSPECTIVE_ENUM_MAP,
  ROLE_ENUM_MAP,
  toPerspectiveEnums,
  toRoleEnum,
} from './onboardingMapper'

// Swagger RoleProfileRequest 기준. 프론트 계약 타입과 서버가 어긋나면 여기서 먼저 깨진다.
const SERVER_ROLES = [
  'PLANNING_OPERATION',
  'DESIGN_CONTENT',
  'DEV_TECH',
  'MARKETING_BRANDING',
  'SALES_CUSTOMER',
  'DATA_RESEARCH',
  'STRATEGY_MANAGEMENT',
  'ETC',
]

const SERVER_PERSPECTIVES = [
  'SCHEDULE',
  'SCOPE',
  'DECISION',
  'UX',
  'TECH_RISK',
  'COST_PERFORMANCE',
  'CUSTOMER_REACTION',
  'OPERATION_ISSUE',
  'ACTION_ITEM',
  'TEAM_QUESTION',
]

describe('온보딩 enum 매핑', () => {
  it('화면의 역할 선택지가 모두 서버 enum으로 변환된다', () => {
    for (const option of ROLE_OPTIONS) {
      expect(SERVER_ROLES).toContain(toRoleEnum(option.id))
    }
  })

  it('화면의 관점 선택지가 모두 서버 enum으로 변환된다', () => {
    const ids = PERSPECTIVE_OPTIONS.map((option) => option.id)

    for (const value of toPerspectiveEnums(ids)) {
      expect(SERVER_PERSPECTIVES).toContain(value)
    }
    expect(toPerspectiveEnums(ids)).toHaveLength(ids.length)
  })

  it('매핑에 없는 값은 조용히 통과시키지 않는다', () => {
    expect(() => toRoleEnum('없는역할')).toThrow('지원하지 않는 역할입니다')
    expect(() => toPerspectiveEnums(['없는관점'])).toThrow('지원하지 않는 관점입니다')
  })

  // 400의 실제 원인이었던 값들이다. 되돌아가지 않게 고정한다.
  it('과거에 틀렸던 값이 서버 정의와 일치한다', () => {
    expect(ROLE_ENUM_MAP.dev).toBe('DEV_TECH')
    expect(PERSPECTIVE_ENUM_MAP.customer_feedback).toBe('CUSTOMER_REACTION')
    expect(PERSPECTIVE_ENUM_MAP.ops_issue).toBe('OPERATION_ISSUE')
    expect(PERSPECTIVE_ENUM_MAP.team_qna).toBe('TEAM_QUESTION')
  })
})
