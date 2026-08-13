import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProjectCreateModal } from './ProjectCreateModal'

// 옵션은 사용자 프로필에서 온다. 화면 전용 기본 목록이 사라졌으므로 테스트가 직접 주입한다.
const perspectiveOptionsFixture = [
  {
    id: 'planning-operations',
    label: '기획/운영',
    description: '일정, 사용자 경험, 의사 결정',
    selectedDescription: '일정, 범위, 의사결정 영향 중심',
  },
  {
    id: 'data-research',
    label: '데이터/리서치',
    description: '고객 반응',
    selectedDescription: '고객 반응 중심',
  },
]

describe('ProjectCreateModal', () => {
  it('accepts project input and enables the next action', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()

    render(
      <ProjectCreateModal
        onClose={vi.fn()}
        onNext={onNext}
        open
        perspectiveOptions={perspectiveOptionsFixture}
      />,
    )

    const nameInput = screen.getByPlaceholderText('프로젝트 이름을 입력해 주세요')
    const overviewInput = screen.getByPlaceholderText('프로젝트 개요를 입력해 주세요')
    const nextButton = screen.getByRole('button', { name: '다음' })

    expect(nextButton).toBeDisabled()
    expect(screen.getByText('0/30')).toBeInTheDocument()
    expect(screen.getByText('0/500')).toBeInTheDocument()

    await user.type(nameInput, '서비스디자인')
    await user.type(overviewInput, '회의 맥락을 연결하는 프로젝트')

    expect(screen.getByText('6/30')).toBeInTheDocument()
    expect(screen.getByText('16/500')).toBeInTheDocument()
    expect(nextButton).toBeEnabled()

    await user.click(nextButton)

    expect(screen.getByRole('heading', { name: 'AI 참고 자료 업로드' })).toBeInTheDocument()
    expect(onNext).toHaveBeenCalledWith({
      name: '서비스디자인',
      perspectiveId: 'planning-operations',
      overview: '회의 맥락을 연결하는 프로젝트',
    })
  })

  it('returns to the first step without losing the project draft', async () => {
    const user = userEvent.setup()

    render(
      <ProjectCreateModal
        initialValues={{ name: 'SynQ 리뉴얼' }}
        onClose={vi.fn()}
        open
        perspectiveOptions={perspectiveOptionsFixture}
      />,
    )

    await user.click(screen.getByRole('button', { name: '다음' }))
    await user.click(screen.getByRole('button', { name: '이전' }))

    expect(screen.getByDisplayValue('SynQ 리뉴얼')).toBeInTheDocument()
  })

  it('opens the perspective list and selects an option', async () => {
    const user = userEvent.setup()

    render(
      <ProjectCreateModal onClose={vi.fn()} open perspectiveOptions={perspectiveOptionsFixture} />,
    )

    await user.click(screen.getByRole('button', { name: /기획\/운영/ }))

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: /데이터\/리서치/ }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /데이터\/리서치.*고객 반응 중심/ }),
    ).toBeInTheDocument()
  })

  it('adds a custom role and perspective from the plus action', async () => {
    const user = userEvent.setup()
    const onAddPerspective = vi.fn()

    render(
      <ProjectCreateModal
        onAddPerspective={onAddPerspective}
        onClose={vi.fn()}
        open
        perspectiveOptions={perspectiveOptionsFixture}
      />,
    )

    await user.click(screen.getByRole('button', { name: /기획\/운영/ }))
    await user.click(screen.getByRole('button', { name: '관점 추가' }))

    expect(screen.getByRole('heading', { name: '새 역할/관점 추가' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(8)

    await user.click(screen.getByRole('button', { name: '디자인/콘텐츠' }))
    await user.type(
      screen.getByPlaceholderText('세부역할이 있다면 입력해 주세요. ex) 제품 기획자'),
      '콘텐츠 디자이너',
    )
    await user.click(screen.getByRole('checkbox', { name: '사용자 경험' }))
    await user.click(screen.getByRole('checkbox', { name: '고객 반응' }))
    await user.click(screen.getByRole('button', { name: '새 역할/관점 추가' }))

    expect(onAddPerspective).toHaveBeenCalledWith({
      roleId: 'design',
      detailRole: '콘텐츠 디자이너',
      focusIds: ['ux', 'customer-feedback'],
    })
    expect(
      await screen.findByRole('status', { name: /새 역할\/관점 추가 완료/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('새 역할·관점 설정이 저장됐습니다.')).toBeInTheDocument()
    expect(screen.getByRole('status').parentElement).toHaveClass('max-w-[380px]', 'duration-300')
    expect(screen.getByRole('heading', { name: '프로젝트 생성' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /디자인\/콘텐츠.*사용자 경험, 고객 반응/,
      }),
    ).toBeInTheDocument()
  })

  it('requires a detail role only when 기타 is selected', async () => {
    const user = userEvent.setup()

    render(
      <ProjectCreateModal onClose={vi.fn()} open perspectiveOptions={perspectiveOptionsFixture} />,
    )

    await user.click(screen.getByRole('button', { name: /기획\/운영/ }))
    await user.click(screen.getByRole('button', { name: '관점 추가' }))
    await user.click(screen.getByRole('button', { name: '기타' }))

    const addButton = screen.getByRole('button', { name: '새 역할/관점 추가' })
    expect(addButton).toBeDisabled()
    expect(screen.getByLabelText('필수')).toBeInTheDocument()

    const detailRoleInput = screen.getByLabelText('세부 역할')
    expect(detailRoleInput).toHaveAttribute('aria-required', 'true')
    expect(detailRoleInput).toBeRequired()

    await user.type(
      screen.getByPlaceholderText('세부역할이 있다면 입력해 주세요. ex) 제품 기획자'),
      '퍼실리테이터',
    )

    expect(addButton).toBeEnabled()
  })

  it('limits perspective selection to three items', async () => {
    const user = userEvent.setup()

    render(
      <ProjectCreateModal onClose={vi.fn()} open perspectiveOptions={perspectiveOptionsFixture} />,
    )

    await user.click(screen.getByRole('button', { name: /기획\/운영/ }))
    await user.click(screen.getByRole('button', { name: '관점 추가' }))

    await user.click(screen.getByRole('checkbox', { name: '일정' }))
    await user.click(screen.getByRole('checkbox', { name: '기능 범위' }))
    await user.click(screen.getByRole('checkbox', { name: '의사 결정' }))

    expect(screen.getByRole('checkbox', { name: '사용자 경험' })).toBeDisabled()
  })

  it('keeps project input when returning from role and perspective creation', async () => {
    const user = userEvent.setup()

    render(
      <ProjectCreateModal onClose={vi.fn()} open perspectiveOptions={perspectiveOptionsFixture} />,
    )

    await user.type(screen.getByPlaceholderText('프로젝트 이름을 입력해 주세요'), 'SynQ 리뉴얼')
    await user.click(screen.getByRole('button', { name: /기획\/운영/ }))
    await user.click(screen.getByRole('button', { name: '관점 추가' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 생성으로 돌아가기' }))

    expect(screen.getByDisplayValue('SynQ 리뉴얼')).toBeInTheDocument()
  })

  it('closes from the close button and Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <ProjectCreateModal onClose={onClose} open perspectiveOptions={perspectiveOptionsFixture} />,
    )

    await user.click(screen.getByRole('button', { name: '프로젝트 생성 닫기' }))
    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
