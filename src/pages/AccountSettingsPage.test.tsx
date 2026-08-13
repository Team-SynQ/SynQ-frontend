import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { defaultAccountPerspectives, type AccountPerspective } from '../features/account-settings'
import { AccountSettingsPage } from './AccountSettingsPage'

const user = {
  email: 'honggildong@gmail.com',
  name: '홍길동',
}

// 실제 API 대신 서버 성공을 흉내 내는 주입 구현으로 화면 흐름만 검증합니다.
let nextAddedPerspectiveId = 0

function renderPage() {
  return render(
    <MemoryRouter>
      <AccountSettingsPage
        addPerspective={(draft) =>
          Promise.resolve({ ...draft, id: `added-${(nextAddedPerspectiveId += 1)}` })
        }
        deletePerspective={() => {}}
        loadPerspectives={() => Promise.resolve(defaultAccountPerspectives)}
        setDefaultPerspective={() => {}}
        updatePerspective={(perspective) => Promise.resolve(perspective)}
        user={user}
      />
    </MemoryRouter>,
  )
}

describe('AccountSettingsPage', () => {
  it('composes the project sidebar and account content', () => {
    renderPage()

    expect(screen.getAllByText(user.email)).toHaveLength(2)
    expect(screen.queryByRole('navigation', { name: '개인 설정' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '계정 정보 및 보안' })).toBeInTheDocument()
  })

  it('updates the account card and sidebar after changing the name', async () => {
    const browserUser = userEvent.setup()
    renderPage()

    await browserUser.click(screen.getByRole('button', { name: '이름 변경' }))
    const input = screen.getByLabelText('이름')
    await browserUser.clear(input)
    await browserUser.type(input, '김씽큐')
    await browserUser.click(screen.getByRole('button', { name: '이름 변경하기' }))

    expect(await screen.findAllByText('김씽큐')).toHaveLength(2)
  })

  it('adds a perspective from the add dialog', async () => {
    const browserUser = userEvent.setup()
    renderPage()

    await browserUser.click(screen.getByRole('button', { name: '역할·관점 추가' }))
    await browserUser.click(screen.getByRole('button', { name: '마케팅/브랜딩' }))
    await browserUser.click(screen.getByRole('checkbox', { name: '고객 반응' }))
    await browserUser.click(screen.getByRole('button', { name: '역할·관점 추가하기' }))

    expect(await screen.findByText('마케팅/브랜딩')).toBeInTheDocument()
    expect(screen.getByText('고객 반응')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '새 역할/관점 추가하기' })).not.toBeInTheDocument()
  })

  it('moves the default badge and deletes a non-default perspective', async () => {
    const browserUser = userEvent.setup()
    renderPage()

    const dataPerspectiveRow = (await screen.findByText('데이터/리서치')).closest('li')
    const planningPerspectiveRow = (await screen.findByText('기획/운영')).closest('li')
    expect(dataPerspectiveRow).not.toBeNull()
    expect(planningPerspectiveRow).not.toBeNull()

    await browserUser.click(screen.getByRole('button', { name: '데이터/리서치 관점 더보기' }))
    await browserUser.click(screen.getByRole('menuitem', { name: '기본으로 설정하기' }))

    expect(await within(dataPerspectiveRow!).findByText('기본 관점')).toBeInTheDocument()
    expect(within(planningPerspectiveRow!).queryByText('기본 관점')).not.toBeInTheDocument()

    await browserUser.click(screen.getByRole('button', { name: '기획/운영 관점 더보기' }))
    await browserUser.click(screen.getByRole('menuitem', { name: '삭제하기' }))

    expect(await screen.findByRole('status', { name: '역할·관점 삭제 성공' })).toHaveTextContent(
      '역할·관점 삭제가 이루어졌습니다.',
    )
    expect(screen.queryByText('기획/운영')).not.toBeInTheDocument()
  })

  it('keeps a quickly added perspective when the initial load resolves late', async () => {
    const browserUser = userEvent.setup()
    let resolveLoad: (value: AccountPerspective[]) => void = () => {}
    render(
      <MemoryRouter>
        <AccountSettingsPage
          addPerspective={(draft) => Promise.resolve({ ...draft, id: 'added-late-load' })}
          loadPerspectives={() =>
            new Promise<AccountPerspective[]>((resolve) => {
              resolveLoad = resolve
            })
          }
          user={user}
        />
      </MemoryRouter>,
    )

    await browserUser.click(screen.getByRole('button', { name: '역할·관점 추가' }))
    await browserUser.click(screen.getByRole('button', { name: '마케팅/브랜딩' }))
    await browserUser.click(screen.getByRole('checkbox', { name: '고객 반응' }))
    await browserUser.click(screen.getByRole('button', { name: '역할·관점 추가하기' }))
    expect(await screen.findByText('마케팅/브랜딩')).toBeInTheDocument()

    resolveLoad(defaultAccountPerspectives)

    expect(await screen.findByText('기획/운영')).toBeInTheDocument()
    expect(screen.getByText('마케팅/브랜딩')).toBeInTheDocument()
  })

  it('updates a perspective after the edit dialog saves successfully', async () => {
    const browserUser = userEvent.setup()
    renderPage()

    await browserUser.click(
      await screen.findByRole('button', { name: '데이터/리서치 관점 더보기' }),
    )
    await browserUser.click(screen.getByRole('menuitem', { name: '역할·관점 수정하기' }))
    await browserUser.click(screen.getByRole('button', { name: '개발/기술' }))
    await browserUser.click(screen.getByRole('checkbox', { name: '기술 리스크' }))
    await browserUser.click(screen.getByRole('button', { name: '역할·관점 수정하기' }))

    expect(await screen.findByText('개발/기술')).toBeInTheDocument()
    expect(screen.getByText('기능 범위, 기술 리스크')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '역할/관점 수정하기' })).not.toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '설정 저장 성공' })).toBeInTheDocument()
  })
})
