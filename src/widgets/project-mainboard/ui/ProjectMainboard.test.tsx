import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PROJECT_REFERENCE_MAX_MATERIALS, type ProjectSummary } from '../../../entities/project'
import { ProjectMainboard } from './ProjectMainboard'

const project: ProjectSummary = {
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
})
