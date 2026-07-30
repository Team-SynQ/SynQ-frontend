import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { defaultAccountPerspectives } from '../model/accountSettings.types'
import { AccountSettingsView } from './AccountSettingsView'

describe('AccountSettingsView', () => {
  it('renders the Figma account card and perspective rows', () => {
    render(
      <AccountSettingsView
        email="honggildong@gmail.com"
        name="홍길동"
        perspectives={defaultAccountPerspectives}
      />,
    )

    expect(screen.getByRole('heading', { name: '계정 정보 및 보안' })).toBeInTheDocument()
    expect(screen.getByText('Google 가입')).toHaveClass('h-[32px]')
    expect(screen.getByRole('button', { name: '이름 변경' })).toHaveClass('w-[120px]')
    expect(screen.getByRole('button', { name: '프로필 이미지 수정' })).toHaveClass(
      'relative',
      'z-10',
    )
    expect(screen.getByRole('button', { name: '역할·관점 추가' })).toHaveClass(
      'h-[42px]',
      'w-[150px]',
    )
    expect(screen.getByText('기본 관점')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('exposes the account editing actions', async () => {
    const user = userEvent.setup()
    const onSaveName = vi.fn()
    const onOpenPerspectiveMenu = vi.fn()

    render(
      <AccountSettingsView
        email="honggildong@gmail.com"
        name="홍길동"
        onSaveName={onSaveName}
        onOpenPerspectiveMenu={onOpenPerspectiveMenu}
        perspectives={defaultAccountPerspectives}
      />,
    )

    await user.click(screen.getByRole('button', { name: '이름 변경' }))
    const nameInput = screen.getByLabelText('이름')
    await user.clear(nameInput)
    await user.type(nameInput, '김씽큐')
    await user.click(screen.getByRole('button', { name: '이름 변경하기' }))

    await waitFor(() => expect(onSaveName).toHaveBeenCalledWith('김씽큐'))
    await user.click(screen.getByRole('button', { name: '기획/운영 관점 더보기' }))
    expect(onOpenPerspectiveMenu).toHaveBeenCalledWith('planning-operations')
  })
})
