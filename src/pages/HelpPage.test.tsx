import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { HelpPage } from './HelpPage'

const user = {
  email: 'honggildong@gmail.com',
  name: '홍길동',
}

describe('HelpPage', () => {
  it('reuses the project sidebar and active personal settings panel', () => {
    renderHelpPage()

    expect(screen.getByRole('navigation', { name: '개인 설정' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '도움말' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByText(user.email)).toHaveLength(1)
  })

  it('moves to account settings', async () => {
    const browserUser = userEvent.setup()
    renderHelpPage()

    await browserUser.click(screen.getByRole('button', { name: '계정 및 기본 설정' }))
    expect(screen.getByRole('heading', { name: '계정 설정 목적지' })).toBeInTheDocument()
  })

  it('switches to the embedded meeting tutorial frame', async () => {
    const browserUser = userEvent.setup()
    renderHelpPage()

    await browserUser.click(screen.getByRole('tab', { name: '회의 사용법 다시보기' }))

    expect(screen.getByRole('img', { name: '회의 사용법 1단계 안내 화면' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '놓치지 않도록, 회의는 함께 기록돼요' }),
    ).toBeInTheDocument()
  })
})

function renderHelpPage() {
  return render(
    <MemoryRouter initialEntries={['/settings/help']}>
      <Routes>
        <Route element={<HelpPage user={user} />} path="/settings/help" />
        <Route element={<h1>계정 설정 목적지</h1>} path="/settings/account" />
      </Routes>
    </MemoryRouter>,
  )
}
