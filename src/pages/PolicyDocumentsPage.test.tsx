import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { PolicyDocumentsPage } from './PolicyDocumentsPage'

const user = {
  email: 'honggildong@gmail.com',
  name: '홍길동',
}

describe('PolicyDocumentsPage', () => {
  it('composes the settings shell with the policy content', () => {
    renderPolicyDocumentsPage()

    expect(screen.getByRole('heading', { name: '정책 문서' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: '개인 설정' })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '이용 약관' })).toHaveAttribute('aria-selected', 'true')
  })

  it('moves to help settings from the sidebar profile menu', async () => {
    const browserUser = userEvent.setup()
    renderPolicyDocumentsPage()

    await browserUser.click(screen.getByRole('button', { name: new RegExp(user.name) }))
    await browserUser.click(screen.getByRole('menuitem', { name: '도움말' }))
    expect(screen.getByRole('heading', { name: '도움말 목적지' })).toBeInTheDocument()
  })
})

function renderPolicyDocumentsPage() {
  return render(
    <MemoryRouter initialEntries={['/settings/policy']}>
      <Routes>
        <Route element={<PolicyDocumentsPage user={user} />} path="/settings/policy" />
        <Route element={<h1>도움말 목적지</h1>} path="/settings/help" />
      </Routes>
    </MemoryRouter>,
  )
}
