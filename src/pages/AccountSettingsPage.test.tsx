import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AccountSettingsPage } from './AccountSettingsPage'

const user = {
  email: 'honggildong@gmail.com',
  name: '홍길동',
}

describe('AccountSettingsPage', () => {
  it('composes the project sidebar, personal settings panel, and account content', () => {
    render(
      <MemoryRouter>
        <AccountSettingsPage user={user} />
      </MemoryRouter>,
    )

    expect(screen.getAllByText(user.email)).toHaveLength(2)
    expect(screen.getByRole('navigation', { name: '개인 설정' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '계정 정보 및 보안' })).toBeInTheDocument()
  })

  it('updates the account card and sidebar after changing the name', async () => {
    const browserUser = userEvent.setup()
    render(
      <MemoryRouter>
        <AccountSettingsPage user={user} />
      </MemoryRouter>,
    )

    await browserUser.click(screen.getByRole('button', { name: '이름 변경' }))
    const input = screen.getByLabelText('이름')
    await browserUser.clear(input)
    await browserUser.type(input, '김씽큐')
    await browserUser.click(screen.getByRole('button', { name: '이름 변경하기' }))

    expect(await screen.findAllByText('김씽큐')).toHaveLength(2)
  })
})
