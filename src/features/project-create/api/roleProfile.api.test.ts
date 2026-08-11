import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRoleProfileOption } from './roleProfile.api'

const axiosMocks = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock('../../../shared/api/axiosInstance', () => ({
  axiosInstance: axiosMocks,
}))

describe('createRoleProfileOption', () => {
  beforeEach(() => {
    axiosMocks.post.mockReset()
  })

  it('maps the project creation form values to the role profile API enums', async () => {
    axiosMocks.post.mockResolvedValue({
      data: {
        result: {
          id: 7,
          isDefault: false,
          role: 'DESIGN_CONTENT',
          detailRole: '콘텐츠 디자이너',
          perspectives: ['UX', 'CUSTOMER_REACTION'],
        },
      },
    })

    const option = await createRoleProfileOption({
      roleId: 'design',
      detailRole: '콘텐츠 디자이너',
      focusIds: ['ux', 'customer-feedback'],
    })

    expect(axiosMocks.post).toHaveBeenCalledWith('/users/me/role-profiles', {
      role: 'DESIGN_CONTENT',
      detailRole: '콘텐츠 디자이너',
      perspectives: ['UX', 'CUSTOMER_REACTION'],
    })
    expect(option).toEqual({
      id: 'role-profile-7',
      label: '디자인/콘텐츠',
      description: '사용자 경험, 고객 반응',
      selectedDescription: '사용자 경험, 고객 반응',
    })
  })
})
