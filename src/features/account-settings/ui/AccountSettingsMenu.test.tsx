import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AccountSettingsMenu } from './AccountSettingsMenu'

const account = {
  email: 'honggildong@gmail.com',
  name: '홍길동',
}

describe('AccountSettingsMenu', () => {
  it('opens the Figma-sized account menu from the user card', async () => {
    const user = userEvent.setup()
    render(<AccountSettingsMenu {...account} />)

    await user.click(screen.getByRole('button', { name: /홍길동/ }))

    const menu = screen.getByRole('menu', { name: '계정 설정' })
    expect(menu).toHaveClass('w-[172px]', 'gap-xs', 'rounded-m', 'border-line-default', 'py-s')
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(4)

    const accountInfoItem = within(menu).getByRole('menuitem', {
      name: '계정 정보 및 보안',
    })
    expect(accountInfoItem).toHaveClass('h-[32px]', 'px-xs', 'typo-body-02')
    expect(accountInfoItem.querySelector('img')).toHaveClass('size-[24px]')
  })

  it('runs a selected action and closes the menu', async () => {
    const user = userEvent.setup()
    const onOpenHelp = vi.fn()
    render(<AccountSettingsMenu {...account} onOpenHelp={onOpenHelp} />)

    await user.click(screen.getByRole('button', { name: /홍길동/ }))
    await user.click(screen.getByRole('menuitem', { name: '도움말' }))

    expect(onOpenHelp).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu', { name: '계정 설정' })).not.toBeInTheDocument()
  })

  it('shows the matching Figma error toast when an action fails', async () => {
    const user = userEvent.setup()
    const onOpenTerms = vi.fn().mockRejectedValue(new Error('failed'))
    render(<AccountSettingsMenu {...account} onOpenTerms={onOpenTerms} />)

    await user.click(screen.getByRole('button', { name: /홍길동/ }))
    await user.click(screen.getByRole('menuitem', { name: '이용약관' }))

    await waitFor(() => {
      expect(screen.getByRole('status', { name: '정책 문서 조회 실패' })).toBeInTheDocument()
    })
    expect(screen.getByText('페이지를 열 수 없습니다. 다시 시도해 주세요.')).toBeInTheDocument()
  })
})
