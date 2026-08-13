import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PROJECT_REFERENCE_MAX_MATERIALS,
  projectApi,
  type ProjectSummary,
} from '../../../entities/project'
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

const OWNER_USER_ID = 12
const EXPORT_FAILURE_MEMBER_ID = 3

const memberResponses = [
  { memberId: 1, userId: OWNER_USER_ID, nickname: '윤금서', role: 'Design', isMe: true },
  { memberId: 2, userId: 21, nickname: '캐서디', role: '딜러', isMe: false },
  { memberId: EXPORT_FAILURE_MEMBER_ID, userId: 22, nickname: '애쉬', role: '딜러', isMe: false },
  { memberId: 4, userId: 23, nickname: '캐서디', role: '딜러', isMe: false },
  { memberId: 5, userId: 24, nickname: '캐서디', role: '딜러', isMe: false },
  { memberId: 6, userId: 25, nickname: '애쉬', role: '딜러', isMe: false },
  { memberId: 7, userId: 26, nickname: '캐서디', role: '딜러', isMe: false },
  { memberId: 8, userId: 27, nickname: '애쉬', role: '딜러', isMe: false },
  { memberId: 9, userId: 28, nickname: '애쉬', role: '딜러', isMe: false },
].map((member) => ({ ...member, joinedAt: '2026-05-01T00:00:00.000Z' }))

const SOMBRA_REQUEST_ID = 11
const WINSTON_REQUEST_ID = 12

beforeEach(() => {
  vi.spyOn(projectApi, 'getProjectMembers').mockResolvedValue({
    projectId: 1,
    ownerId: OWNER_USER_ID,
    title: '서비스 디자인',
    currentMemberCount: memberResponses.length,
    maxMemberCount: 10,
    members: memberResponses,
  })
  vi.spyOn(projectApi, 'createProjectInvitation').mockResolvedValue({
    inviteUrl: 'https://synq.kr/invite/project-demo',
    expiresAt: '2026-12-31T00:00:00.000Z',
  })
  vi.spyOn(projectApi, 'deleteProjectMember').mockImplementation(async (_projectId, memberId) => {
    if (memberId === EXPORT_FAILURE_MEMBER_ID) throw new Error('export failed')
  })
  vi.spyOn(projectApi, 'getProjectJoinRequests').mockResolvedValue({
    pendingCount: 2,
    requests: [
      { requestId: SOMBRA_REQUEST_ID, userId: 31, name: '솜브라', requestedAt: '26.07.20 12:24' },
      { requestId: WINSTON_REQUEST_ID, userId: 32, name: '윈스턴', requestedAt: '26.07.20 18:24' },
    ],
  })
  // 솜브라 요청은 승인·거절이 모두 실패하는 요청입니다.
  vi.spyOn(projectApi, 'approveProjectJoinRequest').mockImplementation(async (_p, requestId) => {
    if (requestId === SOMBRA_REQUEST_ID) throw new Error('approve failed')
    return {
      requestId,
      memberId: 99,
      userId: 32,
      status: 'APPROVED',
      joinedAt: '2026-08-13T00:00:00.000Z',
    }
  })
  vi.spyOn(projectApi, 'rejectProjectJoinRequest').mockImplementation(async (_p, requestId) => {
    if (requestId === SOMBRA_REQUEST_ID) throw new Error('reject failed')
    return { requestId, status: 'REJECTED' }
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

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
    expect(await options.findByText('윤금서/Design (you)')).toBeInTheDocument()
    expect(options.getByText('9')).toBeInTheDocument()
    expect(options.getByText('10')).toBeInTheDocument()
    expect(options.getByText('소유자')).toBeInTheDocument()
    expect(options.getAllByRole('listitem')).toHaveLength(9)
    expect(options.getAllByText('애쉬/딜러')).toHaveLength(4)
    expect(options.getByRole('button', { name: '초대' })).toBeInTheDocument()
    expect(options.getByRole('button', { name: '멤버 관리' })).toBeInTheDocument()
    expect(options.getByRole('button', { name: '프로젝트 정보 수정하기' })).toBeInTheDocument()
    expect(options.getByRole('button', { name: '프로젝트 삭제하기' })).toBeInTheDocument()

    const membersIcon = options.getByTestId('project-members-icon')
    const inviteIcon = options.getByTestId('project-invite-icon')
    const memberAvatar = options.getByTestId('project-member-avatar-1')
    expect(membersIcon).toHaveClass('size-[28px]')
    expect(membersIcon.querySelectorAll('img')).toHaveLength(2)
    expect(inviteIcon).toHaveClass('size-[24px]')
    expect(inviteIcon.querySelector('img')).toHaveAttribute('height', '16.2')
    expect(inviteIcon.querySelector('img')).toHaveAttribute('width', '15.2625')
    expect(memberAvatar).toHaveClass('size-[24px]')
    expect(memberAvatar.querySelectorAll('img')).toHaveLength(2)

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

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/meetings/demo/start')
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
    // 서버 목록 응답에는 요청자의 역할이 없어 이름과 요청 시각만 보여 줍니다.
    expect(management.getByText('솜브라')).toBeInTheDocument()
    expect(management.getByText('윈스턴')).toBeInTheDocument()
    expect(management.getByText('26.07.20 12:24')).toBeInTheDocument()
    expect(management.getByText('26.07.20 18:24')).toBeInTheDocument()
    expect(management.getByText('9')).toBeInTheDocument()

    const approval = within(management.getByTestId(`project-join-request-${WINSTON_REQUEST_ID}`))
    await user.click(approval.getByRole('button', { name: '승인' }))

    await waitFor(() =>
      expect(projectApi.approveProjectJoinRequest).toHaveBeenCalledWith(1, WINSTON_REQUEST_ID),
    )
    expect(
      management.queryByTestId(`project-join-request-${WINSTON_REQUEST_ID}`),
    ).not.toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '멤버 승인 완료' })).toHaveTextContent(
      '참여 요청을 승인했습니다.',
    )
    // 승인된 사람이 반영되도록 멤버 목록을 다시 읽습니다.
    await waitFor(() => expect(projectApi.getProjectMembers).toHaveBeenCalledTimes(2))

    await user.click(management.getByRole('button', { name: '멤버 관리 닫기' }))
    expect(screen.queryByRole('dialog', { name: '멤버 관리' })).not.toBeInTheDocument()
    await waitFor(() => expect(projectMoreButton).toHaveFocus())
  })

  it('승인·거절에 실패하면 요청이 목록에 남는다', async () => {
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
    const failing = within(management.getByTestId(`project-join-request-${SOMBRA_REQUEST_ID}`))

    await user.click(failing.getByRole('button', { name: '승인' }))
    expect(await screen.findByRole('status', { name: '참여 요청 승인 실패' })).toHaveTextContent(
      '참여 요청을 승인하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(management.getByTestId(`project-join-request-${SOMBRA_REQUEST_ID}`)).toBeInTheDocument()

    await user.click(failing.getByRole('button', { name: '거절' }))
    expect(await screen.findByRole('status', { name: '참여 요청 거절 실패' })).toHaveTextContent(
      '참여 요청을 거절하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(management.getByTestId(`project-join-request-${SOMBRA_REQUEST_ID}`)).toBeInTheDocument()
  })

  it('정원이 찼으면 승인 요청을 보내지 않고 안내한다', async () => {
    vi.spyOn(projectApi, 'getProjectMembers').mockResolvedValue({
      projectId: 1,
      ownerId: OWNER_USER_ID,
      title: '서비스 디자인',
      currentMemberCount: 10,
      maxMemberCount: 10,
      members: [
        ...memberResponses,
        {
          memberId: 10,
          userId: 29,
          nickname: '트레이서',
          role: '딜러',
          isMe: false,
          joinedAt: '2026-05-01T00:00:00.000Z',
        },
      ],
    })
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
    const approval = within(management.getByTestId(`project-join-request-${WINSTON_REQUEST_ID}`))
    await user.click(approval.getByRole('button', { name: '승인' }))

    expect(
      await screen.findByRole('status', { name: '프로젝트 최대 인원 도달' }),
    ).toHaveTextContent('프로젝트 최대 인원에 도달해 요청을 승인할 수 없습니다.')
    expect(projectApi.approveProjectJoinRequest).not.toHaveBeenCalled()
    expect(management.getByTestId(`project-join-request-${WINSTON_REQUEST_ID}`)).toBeInTheDocument()
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
    const memberRow = within(management.getByTestId('project-member-row-2'))
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
    expect(management.getByTestId('project-member-row-2')).toBeInTheDocument()

    await user.click(
      within(management.getByTestId('project-member-row-2')).getByRole('button', {
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
    expect(management.queryByTestId('project-member-row-2')).not.toBeInTheDocument()
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
    const failingMemberRow = within(management.getByTestId('project-member-row-3'))
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
    expect(management.getByTestId('project-member-row-3')).toBeInTheDocument()
    expect(management.getByText('9')).toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '멤버 삭제 실패' })).toHaveTextContent(
      '멤버를 삭제하지 못했습니다. 다시 시도해 주세요.',
    )
  })
})
