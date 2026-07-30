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

  it('exposes the account name editing action', async () => {
    const user = userEvent.setup()
    const onSaveName = vi.fn()

    render(
      <AccountSettingsView
        email="honggildong@gmail.com"
        name="홍길동"
        onSaveName={onSaveName}
        perspectives={defaultAccountPerspectives}
      />,
    )

    await user.click(screen.getByRole('button', { name: '이름 변경' }))
    const nameInput = screen.getByLabelText('이름')
    await user.clear(nameInput)
    await user.type(nameInput, '김씽큐')
    await user.click(screen.getByRole('button', { name: '이름 변경하기' }))

    await waitFor(() => expect(onSaveName).toHaveBeenCalledWith('김씽큐'))
  })

  it('opens and submits the Figma add perspective dialog', async () => {
    const user = userEvent.setup()
    const onAddPerspective = vi.fn()

    render(
      <AccountSettingsView
        email="honggildong@gmail.com"
        name="홍길동"
        onAddPerspective={onAddPerspective}
        perspectives={defaultAccountPerspectives}
      />,
    )

    await user.click(screen.getByRole('button', { name: '역할·관점 추가' }))
    expect(screen.getByRole('dialog', { name: '새 역할/관점 추가하기' })).toHaveClass(
      'h-[680px]',
      'max-w-[460px]!',
    )

    await user.click(screen.getByRole('button', { name: '개발/기술' }))
    await user.click(screen.getByRole('checkbox', { name: '기술 리스크' }))
    await user.click(screen.getByRole('button', { name: '역할·관점 추가하기' }))

    await waitFor(() =>
      expect(onAddPerspective).toHaveBeenCalledWith(
        expect.objectContaining({
          focusTags: ['기술 리스크'],
          roleLabel: '개발/기술',
        }),
      ),
    )
    expect(screen.queryByRole('dialog', { name: '새 역할/관점 추가하기' })).not.toBeInTheDocument()
  })

  it('opens the Figma perspective actions menu from the more button', async () => {
    const user = userEvent.setup()
    const onOpenPerspectiveMenu = vi.fn()

    render(
      <AccountSettingsView
        email="honggildong@gmail.com"
        name="홍길동"
        onOpenPerspectiveMenu={onOpenPerspectiveMenu}
        perspectives={defaultAccountPerspectives}
      />,
    )

    await user.click(screen.getByRole('button', { name: '기획/운영 관점 더보기' }))

    expect(onOpenPerspectiveMenu).toHaveBeenCalledWith('planning-operations')
    expect(screen.getByRole('menu', { name: '기획/운영 역할·관점 메뉴' })).toHaveClass(
      'h-[99px]',
      'w-[196px]',
      'p-xs',
    )
    expect(screen.getByRole('menuitem', { name: '역할·관점 수정하기' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toBeInTheDocument()
  })

  it('shows the unavailable dialog when deleting the default perspective', async () => {
    const user = userEvent.setup()

    render(
      <AccountSettingsView
        email="honggildong@gmail.com"
        name="홍길동"
        perspectives={defaultAccountPerspectives}
      />,
    )

    await user.click(screen.getByRole('button', { name: '기획/운영 관점 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))

    const dialog = screen.getByRole('dialog', { name: '역할·관점 삭제 불가' })
    expect(dialog).toHaveClass('max-w-[440px]', 'gap-l', 'p-l')
    expect(dialog).toHaveTextContent('다른 역할·관점을 기본으로 설정한 뒤 삭제해 주세요.')

    await user.click(screen.getByRole('button', { name: '확인' }))
    expect(screen.queryByRole('dialog', { name: '역할·관점 삭제 불가' })).not.toBeInTheDocument()
  })

  it('supports default, edit, and delete actions for a non-default perspective', async () => {
    const user = userEvent.setup()
    const onDeletePerspective = vi.fn()
    const onSetDefaultPerspective = vi.fn()
    const onUpdatePerspective = vi.fn()

    render(
      <AccountSettingsView
        email="honggildong@gmail.com"
        name="홍길동"
        onDeletePerspective={onDeletePerspective}
        onSetDefaultPerspective={onSetDefaultPerspective}
        onUpdatePerspective={onUpdatePerspective}
        perspectives={defaultAccountPerspectives}
      />,
    )

    await user.click(screen.getByRole('button', { name: '데이터/리서치 관점 더보기' }))
    expect(screen.getByRole('menu', { name: '데이터/리서치 역할·관점 메뉴' })).toHaveClass(
      'h-[142px]',
      'w-[196px]',
      'p-xs',
    )
    await user.click(screen.getByRole('menuitem', { name: '기본으로 설정하기' }))
    expect(onSetDefaultPerspective).toHaveBeenCalledWith('data-research')

    await user.click(screen.getByRole('button', { name: '데이터/리서치 관점 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '역할·관점 수정하기' }))
    expect(screen.getByRole('dialog', { name: '역할/관점 수정하기' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '개발/기술' }))
    await user.click(screen.getByRole('checkbox', { name: '기술 리스크' }))
    await user.click(screen.getByRole('button', { name: '역할·관점 수정하기' }))

    await waitFor(() =>
      expect(onUpdatePerspective).toHaveBeenCalledWith(
        expect.objectContaining({
          focusTags: ['기능 범위', '기술 리스크'],
          icon: '/assets/images/role-dev.png',
          roleLabel: '개발/기술',
        }),
      ),
    )
    expect(await screen.findByRole('status', { name: '설정 저장 성공' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '데이터/리서치 관점 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))
    expect(onDeletePerspective).toHaveBeenCalledWith('data-research')
    expect(await screen.findByRole('status', { name: '역할·관점 삭제 성공' })).toHaveTextContent(
      '역할·관점 삭제가 이루어졌습니다.',
    )
  })
})
