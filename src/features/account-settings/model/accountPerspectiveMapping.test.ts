import { describe, expect, it } from 'vitest'

import type { RoleProfile } from '../../../entities/user'
import { toAccountPerspective, toRoleProfileRequest } from './accountPerspectiveMapping'

describe('accountPerspectiveMapping', () => {
  it('maps every server perspective to a screen tag and back without loss', () => {
    const profile: RoleProfile = {
      id: 11,
      isDefault: false,
      role: 'DEV_TECH',
      perspectives: [
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
      ],
    }

    const perspective = toAccountPerspective(profile)
    expect(perspective.focusTags).toHaveLength(profile.perspectives.length)

    const request = toRoleProfileRequest(perspective)
    expect(request.perspectives).toEqual(profile.perspectives)
  })

  it('keeps COST_PERFORMANCE when a profile is viewed and saved again', () => {
    const profile: RoleProfile = {
      id: 12,
      isDefault: false,
      role: 'STRATEGY_MANAGEMENT',
      perspectives: ['COST_PERFORMANCE', 'SCHEDULE'],
    }

    const request = toRoleProfileRequest(toAccountPerspective(profile))

    expect(request.perspectives).toContain('COST_PERFORMANCE')
    expect(request.perspectives).toContain('SCHEDULE')
  })
})
