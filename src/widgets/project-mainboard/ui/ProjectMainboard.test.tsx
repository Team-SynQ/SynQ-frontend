import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PROJECT_REFERENCE_MAX_MATERIALS, type ProjectSummary } from '../../../entities/project'
import { ProjectMainboard } from './ProjectMainboard'

const project: ProjectSummary = {
  apiProjectId: 1,
  id: 'project-1',
  name: '서비스 디자인',
  overview: '더블 다이아몬드 프로세스를 적용한 사이드프로젝트',
  perspectiveLabel: 'PM',
  perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
  materials: [
    {
      id: 'material-1',
      kind: 'file',
      name: 'answer-guide.docx',
      createdAt: '2026-05-01T00:00:00.000Z',
    },
  ],
}

function createProjectWithMaterialCount(materialCount: number): ProjectSummary {
  return {
    ...project,
    materials: Array.from({ length: materialCount }, (_, index) => ({
      id: `material-${index + 1}`,
      kind: 'file',
      name: `reference-${index + 1}.pdf`,
      createdAt: '2026-05-01T00:00:00.000Z',
    })),
  }
}

function LocationPathname() {
  return <output data-testid="location-pathname">{useLocation().pathname}</output>
}

describe('ProjectMainboard', () => {
  it('renders the empty state when no project exists', () => {
    render(<ProjectMainboard onCreateProject={vi.fn()} />)

    expect(screen.getByRole('button', { name: '프로젝트 생성하기' })).toBeInTheDocument()
  })

  it('renders the created project dashboard from project data', async () => {
    const user = userEvent.setup()
    const onAddMaterials = vi.fn()
    const onDeleteMaterial = vi.fn()
    const onRenameMaterial = vi.fn()

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <ProjectMainboard
          onAddMaterials={onAddMaterials}
          onDeleteMaterial={onDeleteMaterial}
          onRenameMaterial={onRenameMaterial}
          project={project}
        />
        <LocationPathname />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '서비스 디자인' })).toBeInTheDocument()
    expect(screen.getByText('answer-guide.docx')).toBeInTheDocument()

    const projectMoreButton = screen.getByRole('button', { name: '프로젝트 더보기' })
    const projectMoreIcon = projectMoreButton.querySelector('img')
    expect(projectMoreButton).toHaveAttribute('aria-expanded', 'false')
    expect(projectMoreButton).toHaveAttribute('aria-haspopup', 'dialog')
    expect(projectMoreIcon).toHaveAttribute('height', '28')
    expect(projectMoreIcon).toHaveAttribute('width', '28')

    await user.click(projectMoreButton)

    expect(projectMoreButton).toHaveAttribute('aria-expanded', 'true')
    const projectOptions = screen.getByRole('dialog', {
      name: '프로젝트 설정 및 멤버 관리',
    })
    const options = within(projectOptions)
    expect(projectOptions).toHaveClass('right-0', 'top-0', 'w-[340px]', 'gap-l', 'rounded-l', 'p-m')
    expect(options.getByRole('heading', { name: '멤버' })).toBeInTheDocument()
    expect(options.getAllByText('10')).toHaveLength(2)
    expect(options.getByText('윤금서/Design (you)')).toBeInTheDocument()
    expect(options.getByText('소유자')).toBeInTheDocument()
    expect(options.getAllByRole('listitem')).toHaveLength(10)
    expect(options.getAllByText('애쉬/딜러')).toHaveLength(4)
    expect(options.getByText('도로롱')).toBeInTheDocument()
    expect(options.getByRole('button', { name: '초대' })).toBeInTheDocument()
    expect(options.getByRole('button', { name: '멤버 관리' })).toBeInTheDocument()
    expect(options.getByRole('button', { name: '프로젝트 정보 수정하기' })).toBeInTheDocument()
    expect(options.getByRole('button', { name: '프로젝트 삭제하기' })).toBeInTheDocument()

    const membersIcon = options.getByTestId('project-members-icon')
    const inviteIcon = options.getByTestId('project-invite-icon')
    const customAvatar = options.getByTestId('project-member-avatar-member-current')
    const defaultAvatar = options.getByTestId('project-member-avatar-member-cassidy-1')
    expect(membersIcon).toHaveClass('size-[28px]')
    expect(membersIcon.querySelectorAll('img')).toHaveLength(2)
    expect(inviteIcon).toHaveClass('size-[24px]')
    expect(inviteIcon.querySelector('img')).toHaveAttribute('height', '16.2')
    expect(inviteIcon.querySelector('img')).toHaveAttribute('width', '15.2625')
    expect(customAvatar).toHaveAttribute('height', '24')
    expect(customAvatar).toHaveAttribute('width', '24')
    expect(defaultAvatar).toHaveClass('size-[24px]')
    expect(defaultAvatar.querySelectorAll('img')).toHaveLength(2)

    await user.click(options.getByRole('button', { name: '프로젝트 설정 및 멤버 관리 닫기' }))

    expect(
      screen.queryByRole('dialog', { name: '프로젝트 설정 및 멤버 관리' }),
    ).not.toBeInTheDocument()
    await waitFor(() => expect(projectMoreButton).toHaveFocus())

    const microphoneIcon = screen
      .getByRole('button', { name: '\uC0C8 \uD68C\uC758 \uC2DC\uC791' })
      .querySelector('img')
    expect(microphoneIcon).toHaveAttribute('height', '28')
    expect(microphoneIcon).toHaveAttribute('width', '28')

    const folderIcon = screen
      .getByRole('heading', { name: 'AI \uCC38\uACE0 \uC790\uB8CC' })
      .parentElement?.querySelector('img')
    expect(folderIcon).toHaveAttribute('height', '24')
    expect(folderIcon).toHaveAttribute('width', '24')

    const addMaterialButton = screen.getByRole('button', { name: 'AI 참고 자료 추가' })
    const plusIcon = addMaterialButton.querySelector('img')
    expect(addMaterialButton).toHaveClass('px-0')
    expect(addMaterialButton).not.toHaveClass('px-s')
    expect(plusIcon).toHaveAttribute('height', '24')
    expect(plusIcon).toHaveAttribute('width', '24')

    const materialMenuButton = screen.getByRole('button', {
      name: 'answer-guide.docx \uB354\uBCF4\uAE30',
    })
    const burgerIcon = materialMenuButton.querySelector('img')
    expect(materialMenuButton).toHaveClass('px-0')
    expect(materialMenuButton).not.toHaveClass('px-s')
    expect(burgerIcon).toHaveAttribute('height', '24')
    expect(burgerIcon).toHaveAttribute('width', '24')
    expect(burgerIcon?.parentElement).toHaveClass('flex', 'size-[24px]')

    const clipboardIcon = screen
      .getByRole('heading', { name: '\uCD5C\uC2E0 \uD68C\uC758 \uC694\uC57D' })
      .parentElement?.querySelector('img')
    expect(clipboardIcon).toHaveAttribute('height', '24')
    expect(clipboardIcon).toHaveAttribute('width', '24')

    const fileIcon = screen.getByText('answer-guide.docx').parentElement?.querySelector('img')
    expect(fileIcon).toHaveAttribute('height', '24')
    expect(fileIcon).toHaveAttribute('width', '24')

    await user.click(addMaterialButton)
    const uploadDialog = screen.getByRole('dialog', { name: 'AI 참고 자료 업로드' })
    expect(uploadDialog).toHaveClass('h-[680px]', 'max-w-[460px]!')

    const uploadedFile = new File(['content'], 'roadmap.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('AI 참고 자료 파일 선택'), uploadedFile)
    await waitFor(() => expect(screen.getByRole('button', { name: '추가하기' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: '추가하기' }))

    expect(onAddMaterials).toHaveBeenCalledWith({ files: [uploadedFile], links: [] })
    expect(screen.queryByRole('dialog', { name: 'AI 참고 자료 업로드' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx \uB354\uBCF4\uAE30' }))
    await user.click(
      screen.getByRole('menuitem', { name: '\uC81C\uBAA9 \uC218\uC815\uD558\uAE30' }),
    )

    expect(screen.getByRole('dialog', { name: '자료 제목 수정' })).toBeInTheDocument()

    const titleInput = screen.getByRole('textbox', { name: '자료 제목' })
    await user.clear(titleInput)
    await user.type(titleInput, 'revised-guide.docx')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    await waitFor(() => {
      expect(onRenameMaterial).toHaveBeenCalledWith('material-1', 'revised-guide.docx')
    })

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx \uB354\uBCF4\uAE30' }))
    await user.click(screen.getByRole('menuitem', { name: '\uC0AD\uC81C\uD558\uAE30' }))

    expect(
      screen.getByRole('dialog', {
        name: /‘answer-guide\.docx’\s+자료를 지우시겠습니까\?/,
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '지우기' }))

    await waitFor(() => {
      expect(onDeleteMaterial).toHaveBeenCalledWith('material-1')
    })

    await user.click(
      screen.getByRole('button', {
        name: '\uC0C8 \uD68C\uC758 \uC2DC\uC791',
      }),
    )

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/meetings/demo/tutorial')
    expect(screen.getByText('아직 회의 기록이 없습니다')).toBeInTheDocument()
  })

  it('settles reference dialogs when mutation callbacks reject', async () => {
    const user = userEvent.setup()
    const onDeleteMaterial = vi.fn(() => Promise.reject(new Error('delete failed')))
    const onRenameMaterial = vi.fn(() => Promise.reject(new Error('rename failed')))

    render(
      <MemoryRouter>
        <ProjectMainboard
          onDeleteMaterial={onDeleteMaterial}
          onRenameMaterial={onRenameMaterial}
          project={project}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))

    const titleInput = screen.getByRole('textbox', { name: '자료 제목' })
    await user.clear(titleInput)
    await user.type(titleInput, 'revised-guide.docx')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '자료 제목 수정' })).not.toBeInTheDocument()
    })
    expect(onRenameMaterial).toHaveBeenCalledWith('material-1', 'revised-guide.docx')

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: /‘answer-guide\.docx’\s+자료를 지우시겠습니까\?/,
        }),
      ).not.toBeInTheDocument()
    })
    expect(onDeleteMaterial).toHaveBeenCalledWith('material-1')
  })

  it('blocks opening the upload dialog and shows the limit toast at 10 materials', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProjectMainboard
          onAddMaterials={vi.fn()}
          project={createProjectWithMaterialCount(PROJECT_REFERENCE_MAX_MATERIALS)}
        />
      </MemoryRouter>,
    )

    const addMaterialButton = screen.getByRole('button', { name: 'AI 참고 자료 추가' })
    expect(addMaterialButton).toBeEnabled()

    await user.click(addMaterialButton)

    expect(screen.queryByRole('dialog', { name: 'AI 참고 자료 업로드' })).not.toBeInTheDocument()
    expect(
      await screen.findByRole('status', { name: '참고자료 최대 개수 초과' }),
    ).toHaveTextContent(
      `참고자료는 프로젝트당 최대 ${PROJECT_REFERENCE_MAX_MATERIALS}개까지 등록할 수 있어요.`,
    )
  })

  it('blocks a batch that would exceed 10 materials and keeps the upload dialog open', async () => {
    const user = userEvent.setup()
    const onAddMaterials = vi.fn()

    render(
      <MemoryRouter>
        <ProjectMainboard
          onAddMaterials={onAddMaterials}
          project={createProjectWithMaterialCount(PROJECT_REFERENCE_MAX_MATERIALS - 1)}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'AI 참고 자료 추가' }))

    const files = [
      new File(['first'], 'first.pdf', { type: 'application/pdf' }),
      new File(['second'], 'second.pdf', { type: 'application/pdf' }),
    ]
    await user.upload(screen.getByLabelText('AI 참고 자료 파일 선택'), files)
    await waitFor(() => expect(screen.getByRole('button', { name: '추가하기' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: '추가하기' }))

    expect(onAddMaterials).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'AI 참고 자료 업로드' })).toBeInTheDocument()
    expect(
      await screen.findByRole('status', { name: '참고자료 최대 개수 초과' }),
    ).toHaveTextContent(
      `참고자료는 프로젝트당 최대 ${PROJECT_REFERENCE_MAX_MATERIALS}개까지 등록할 수 있어요.`,
    )
  })

  it('copies the mock invite link and shows the Figma success toast', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(
      <MemoryRouter>
        <ProjectMainboard project={project} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(
      within(screen.getByRole('dialog', { name: '프로젝트 설정 및 멤버 관리' })).getByRole(
        'button',
        { name: '초대' },
      ),
    )

    expect(writeText).toHaveBeenCalledWith('https://synq.kr/invite/project-demo')
    expect(await screen.findByRole('status', { name: '초대 링크 복사 완료' })).toHaveTextContent(
      '링크를 복사 완료했습니다.',
    )
  })

  it.each([
    ['Clipboard API unavailable', undefined],
    [
      'clipboard permission rejected',
      { writeText: vi.fn().mockRejectedValue(new Error('permission denied')) },
    ],
  ])('shows an error toast when %s', async (_case, clipboard) => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboard,
    })

    render(
      <MemoryRouter>
        <ProjectMainboard project={project} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(
      within(screen.getByRole('dialog', { name: '프로젝트 설정 및 멤버 관리' })).getByRole(
        'button',
        { name: '초대' },
      ),
    )

    expect(await screen.findByRole('status', { name: '초대 링크 복사 실패' })).toHaveTextContent(
      '링크를 복사하지 못했습니다. 다시 시도해 주세요.',
    )
  })

  it('opens the Figma project settings modal and submits edited information', async () => {
    const user = userEvent.setup()
    const onUpdateProject = vi.fn()

    render(
      <MemoryRouter>
        <ProjectMainboard onUpdateProject={onUpdateProject} project={project} />
      </MemoryRouter>,
    )

    const projectMoreButton = screen.getByRole('button', { name: '프로젝트 더보기' })
    await user.click(projectMoreButton)
    await user.click(screen.getByRole('button', { name: '프로젝트 정보 수정하기' }))

    const settingsDialog = screen.getByRole('dialog', { name: '프로젝트 설정' })
    expect(settingsDialog).toHaveClass('h-[680px]', 'max-w-[460px]', 'gap-m', 'py-l')
    expect(settingsDialog).toHaveTextContent(
      '변경된 내용은 AI 힌트, AI Chat 추천 질문, 회의 후 개별 정리에 우선 반영됩니다.',
    )

    const nameInput = within(settingsDialog).getByRole('textbox', { name: '이름' })
    const overviewInput = within(settingsDialog).getByRole('textbox', { name: '프로젝트 개요' })
    await user.clear(nameInput)
    await user.type(nameInput, '수정된 서비스 디자인')
    await user.clear(overviewInput)
    await user.type(overviewInput, '수정된 프로젝트 개요')
    await user.click(within(settingsDialog).getByRole('button', { name: /PM/ }))
    expect(within(settingsDialog).getByRole('listbox')).toBeInTheDocument()
    await user.click(overviewInput)
    expect(within(settingsDialog).queryByRole('listbox')).not.toBeInTheDocument()
    await user.click(within(settingsDialog).getByRole('button', { name: /PM/ }))
    await user.click(within(settingsDialog).getByRole('button', { name: '관점 추가' }))

    const perspectiveDialog = screen.getByRole('dialog', { name: '새 역할/관점 추가' })
    await user.click(within(perspectiveDialog).getByRole('button', { name: '기획/운영' }))
    await user.click(within(perspectiveDialog).getByRole('checkbox', { name: '일정' }))
    await user.click(within(perspectiveDialog).getByRole('button', { name: '새 역할/관점 추가' }))

    await user.click(
      within(screen.getByRole('dialog', { name: '프로젝트 설정' })).getByRole('button', {
        name: '저장하기',
      }),
    )

    expect(onUpdateProject).toHaveBeenCalledWith({
      name: '수정된 서비스 디자인',
      overview: '수정된 프로젝트 개요',
      perspectiveLabel: '기획/운영',
      perspectiveDescription: '일정',
    })
    expect(screen.queryByRole('dialog', { name: '프로젝트 설정' })).not.toBeInTheDocument()
    expect(
      await screen.findByRole('status', { name: '프로젝트 설정 저장 완료' }),
    ).toHaveTextContent('프로젝트 설정이 저장 되었습니다.')
    await waitFor(() => expect(projectMoreButton).toHaveFocus())
  })

  it('keeps the settings modal open and shows the Figma toast when saving fails', async () => {
    const user = userEvent.setup()
    const onUpdateProject = vi.fn().mockRejectedValue(new Error('save failed'))

    render(
      <MemoryRouter>
        <ProjectMainboard onUpdateProject={onUpdateProject} project={project} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 정보 수정하기' }))
    await user.click(
      within(screen.getByRole('dialog', { name: '프로젝트 설정' })).getByRole('button', {
        name: '저장하기',
      }),
    )

    expect(screen.getByRole('dialog', { name: '프로젝트 설정' })).toBeInTheDocument()
    expect(
      await screen.findByRole('status', { name: '프로젝트 정보 저장 실패' }),
    ).toHaveTextContent('프로젝트 정보를 저장하지 못했습니다. 다시 시도해 주세요.')
  })
  it('shows only the Figma toast when project settings lookup fails', async () => {
    const user = userEvent.setup()
    const onLoadProject = vi.fn().mockRejectedValue(new Error('lookup failed'))

    render(
      <MemoryRouter>
        <ProjectMainboard onLoadProject={onLoadProject} project={project} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 정보 수정하기' }))

    expect(screen.queryByRole('dialog', { name: '프로젝트 설정' })).not.toBeInTheDocument()
    expect(
      await screen.findByRole('status', { name: '프로젝트 설정 조회 실패' }),
    ).toHaveTextContent('프로젝트 설정을 불러오지 못했습니다. 다시 시도해 주세요.')
  })
  it('renders multiple join requests and handles approval failure and member capacity', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProjectMainboard project={project} />
      </MemoryRouter>,
    )

    const projectMoreButton = screen.getByRole('button', { name: '프로젝트 더보기' })
    await user.click(projectMoreButton)
    await user.click(
      within(screen.getByRole('dialog', { name: '프로젝트 설정 및 멤버 관리' })).getByRole(
        'button',
        { name: '멤버 관리' },
      ),
    )

    const managementDialog = screen.getByRole('dialog', { name: '멤버 관리' })
    const management = within(managementDialog)
    expect(managementDialog).toHaveClass('h-[680px]', 'max-w-[460px]!', 'gap-m', 'py-l')
    expect(management.getAllByText('솜브라/딜러')).toHaveLength(3)
    expect(management.getByText('윈스턴/탱커')).toBeInTheDocument()
    expect(management.getAllByText('26.07.20 12:24')).toHaveLength(3)
    expect(management.getByText('26.07.20 18:24')).toBeInTheDocument()
    expect(management.getByText('4')).toBeInTheDocument()
    expect(management.getByText('9')).toBeInTheDocument()
    expect(
      management.getByTestId('project-join-request-join-request-sombra-approve-failure')
        .parentElement,
    ).toHaveClass('max-h-[172px]', 'overflow-y-auto')

    const failingApproval = within(
      management.getByTestId('project-join-request-join-request-sombra-approve-failure'),
    )
    await user.click(failingApproval.getByRole('button', { name: '승인' }))

    expect(await screen.findByRole('status', { name: '참여 요청 승인 실패' })).toHaveTextContent(
      '참여 요청을 승인하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(
      management.getByTestId('project-join-request-join-request-sombra-approve-failure'),
    ).toBeInTheDocument()
    expect(management.getByText('9')).toBeInTheDocument()

    const successfulApproval = within(
      management.getByTestId('project-join-request-join-request-winston'),
    )
    await user.click(successfulApproval.getByRole('button', { name: '승인' }))

    expect(
      management.queryByTestId('project-join-request-join-request-winston'),
    ).not.toBeInTheDocument()
    expect(management.getByText('윈스턴/탱커')).toBeInTheDocument()
    expect(management.getAllByText('10')).toHaveLength(2)
    expect(await screen.findByRole('status', { name: '멤버 승인 완료' })).toHaveTextContent(
      '참여 요청을 승인했습니다.',
    )

    const capacityApproval = within(
      management.getByTestId('project-join-request-join-request-sombra-capacity'),
    )
    await user.click(capacityApproval.getByRole('button', { name: '승인' }))

    expect(
      await screen.findByRole('status', { name: '프로젝트 최대 인원 도달' }),
    ).toHaveTextContent('프로젝트 최대 인원에 도달해 요청을 승인할 수 없습니다.')
    expect(
      management.getByTestId('project-join-request-join-request-sombra-capacity'),
    ).toBeInTheDocument()
    expect(management.getAllByText('10')).toHaveLength(2)

    await user.click(management.getByRole('button', { name: '멤버 관리 닫기' }))
    expect(screen.queryByRole('dialog', { name: '멤버 관리' })).not.toBeInTheDocument()
    await waitFor(() => expect(projectMoreButton).toHaveFocus())
  })

  it('keeps failed rejection requests and removes successfully rejected requests', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProjectMainboard project={project} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(
      within(screen.getByRole('dialog', { name: '프로젝트 설정 및 멤버 관리' })).getByRole(
        'button',
        { name: '멤버 관리' },
      ),
    )

    const management = within(screen.getByRole('dialog', { name: '멤버 관리' }))
    const successfulRejection = within(
      management.getByTestId('project-join-request-join-request-sombra-capacity'),
    )
    await user.click(successfulRejection.getByRole('button', { name: '거절' }))

    expect(management.getByText('9')).toBeInTheDocument()
    expect(
      management.queryByTestId('project-join-request-join-request-sombra-capacity'),
    ).not.toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '멤버 거절 완료' })).toHaveTextContent(
      '참여 요청을 거절했습니다.',
    )

    const failingRejection = within(
      management.getByTestId('project-join-request-join-request-sombra-reject-failure'),
    )
    await user.click(failingRejection.getByRole('button', { name: '거절' }))

    expect(await screen.findByRole('status', { name: '참여 요청 거절 실패' })).toHaveTextContent(
      '참여 요청을 거절하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(
      management.getByTestId('project-join-request-join-request-sombra-reject-failure'),
    ).toBeInTheDocument()
    expect(management.getByText('9')).toBeInTheDocument()
  })

  it('opens the reusable member menu and confirms exporting a member', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProjectMainboard project={project} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(
      within(screen.getByRole('dialog', { name: '프로젝트 설정 및 멤버 관리' })).getByRole(
        'button',
        { name: '멤버 관리' },
      ),
    )

    let management = within(screen.getByRole('dialog', { name: '멤버 관리' }))
    const memberRow = within(management.getByTestId('project-member-row-member-cassidy-1'))
    await user.click(memberRow.getByRole('button', { name: '캐서디 멤버 관리' }))

    const memberMenu = await screen.findByRole('menu', { name: '캐서디 멤버 메뉴' })
    expect(memberMenu).toHaveClass('h-[58px]', 'w-[164px]', 'rounded-[16px]')
    expect(memberMenu.querySelector('img')).toHaveAttribute('height', '16')
    expect(memberMenu.querySelector('img')).toHaveAttribute('width', '14')
    const exportMenuItem = within(memberMenu).getByRole('menuitem', { name: '멤버 내보내기' })
    await waitFor(() => expect(exportMenuItem).toHaveFocus())
    await user.click(exportMenuItem)

    expect(screen.queryByRole('dialog', { name: '멤버 관리' })).not.toBeInTheDocument()
    let exportDialog = screen.getByRole('dialog', {
      name: '‘캐서디’ 멤버를 내보내시겠습니까?',
    })
    expect(exportDialog).toHaveClass('max-w-[440px]!', 'gap-l')
    expect(exportDialog).toHaveTextContent('나간 이후에도 초대장을 통해 다시 돌아올 수 있습니다.')

    await user.click(within(exportDialog).getByRole('button', { name: '취소' }))
    management = within(await screen.findByRole('dialog', { name: '멤버 관리' }))
    expect(management.getByTestId('project-member-row-member-cassidy-1')).toBeInTheDocument()

    await user.click(
      within(management.getByTestId('project-member-row-member-cassidy-1')).getByRole('button', {
        name: '캐서디 멤버 관리',
      }),
    )
    await user.click(
      within(await screen.findByRole('menu', { name: '캐서디 멤버 메뉴' })).getByRole('menuitem', {
        name: '멤버 내보내기',
      }),
    )

    exportDialog = screen.getByRole('dialog', {
      name: '‘캐서디’ 멤버를 내보내시겠습니까?',
    })
    await user.click(within(exportDialog).getByRole('button', { name: '내보내기' }))

    management = within(await screen.findByRole('dialog', { name: '멤버 관리' }))
    expect(management.queryByTestId('project-member-row-member-cassidy-1')).not.toBeInTheDocument()
    expect(management.getByText('8')).toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '멤버 삭제 성공' })).toHaveTextContent(
      '멤버를 성공적으로 내보냈습니다.',
    )
  })

  it('keeps the member and shows the Figma error toast when export fails', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProjectMainboard project={project} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(
      within(screen.getByRole('dialog', { name: '프로젝트 설정 및 멤버 관리' })).getByRole(
        'button',
        { name: '멤버 관리' },
      ),
    )

    let management = within(screen.getByRole('dialog', { name: '멤버 관리' }))
    const failingMemberRow = within(management.getByTestId('project-member-row-member-ashe-1'))
    await user.click(failingMemberRow.getByRole('button', { name: '애쉬 멤버 관리' }))
    await user.click(
      within(await screen.findByRole('menu', { name: '애쉬 멤버 메뉴' })).getByRole('menuitem', {
        name: '멤버 내보내기',
      }),
    )

    const exportDialog = screen.getByRole('dialog', {
      name: '‘애쉬’ 멤버를 내보내시겠습니까?',
    })
    await user.click(within(exportDialog).getByRole('button', { name: '내보내기' }))

    management = within(await screen.findByRole('dialog', { name: '멤버 관리' }))
    expect(management.getByTestId('project-member-row-member-ashe-1')).toBeInTheDocument()
    expect(management.getByText('9')).toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '멤버 삭제 실패' })).toHaveTextContent(
      '멤버를 삭제하지 못했습니다. 다시 시도해 주세요.',
    )
  })
})
