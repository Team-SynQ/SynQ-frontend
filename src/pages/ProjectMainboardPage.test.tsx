import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import type { ProjectSummary } from '../entities/project'
import type { ProjectCreateDraft } from '../features/project-create'
import { ProjectMainboardPage } from './ProjectMainboardPage'

function renderProjectMainboardPage(props: ComponentProps<typeof ProjectMainboardPage> = {}) {
  return render(
    <MemoryRouter>
      <ProjectMainboardPage {...props} />
    </MemoryRouter>,
  )
}

describe('ProjectMainboardPage', () => {
  it('keeps the empty dashboard until a project is created', async () => {
    renderProjectMainboardPage()

    expect(
      screen.getByRole('button', {
        name: '\uD504\uB85C\uC81D\uD2B8 \uC0DD\uC131\uD558\uAE30',
      }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: '\uD68C\uC758 \uBCF4\uC870 AI, \uC52C\uD050',
        }),
      ).not.toBeInTheDocument()
    })
  })

  it('shows the project only after creation completes', async () => {
    const user = userEvent.setup()
    let finishCreation: ((project: ProjectSummary) => void) | undefined
    const onSubmitProject = vi.fn(
      () =>
        new Promise<ProjectSummary>((resolve) => {
          finishCreation = resolve
        }),
    )

    renderProjectMainboardPage({ onSubmitProject })

    await user.click(
      screen.getByRole('button', {
        name: '\uD504\uB85C\uC81D\uD2B8 \uCD94\uAC00',
      }),
    )
    await user.type(
      screen.getByPlaceholderText(
        '\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
      ),
      '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
    )
    await user.click(screen.getByRole('button', { name: '\uB2E4\uC74C' }))
    await user.click(screen.getByRole('button', { name: '\uC0DD\uC131\uD558\uAE30' }))

    expect(onSubmitProject).toHaveBeenCalledTimes(1)

    const creatingButton = screen.getByRole('button', {
      name: '\uD504\uB85C\uC81D\uD2B8 \uC0DD\uC131 \uC911...',
    })
    expect(creatingButton).toHaveAttribute('aria-busy', 'true')
    expect(creatingButton).toBeDisabled()
    expect(
      screen.queryByRole('heading', {
        name: '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
      }),
    ).not.toBeInTheDocument()

    await act(async () => {
      finishCreation?.({
        id: 'project-created',
        name: '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
        overview: '',
        perspectiveLabel: 'PM',
        perspectiveDescription:
          '\uC77C\uC815, \uBC94\uC704, \uC758\uC0AC\uACB0\uC815 \uC601\uD5A5 \uC911\uC2EC',
        materials: [],
      })
    })

    expect(
      await screen.findByRole('heading', {
        name: '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toHaveAttribute('aria-current', 'page')

    const successToast = await screen.findByRole('status', {
      name: '\uD504\uB85C\uC81D\uD2B8 \uC0DD\uC131 \uC644\uB8CC',
    })
    expect(successToast).toHaveTextContent(
      '\u2018\uC2E0\uADDC \uD504\uB85C\uC81D\uD2B8\u2019 \uD504\uB85C\uC81D\uD2B8\uAC00 \uCD94\uAC00\uB410\uC2B5\uB2C8\uB2E4.',
    )
    expect(successToast).toHaveClass('min-h-[118px]')
  })

  it('reopens creation from the sidebar and accumulates created projects', async () => {
    const user = userEvent.setup()
    let createdProjectCount = 0
    const onSubmitProject = vi.fn((draft: ProjectCreateDraft) => {
      createdProjectCount += 1

      return {
        id: `project-created-${createdProjectCount}`,
        name: draft.name,
        overview: draft.overview,
        perspectiveLabel: 'PM',
        perspectiveDescription:
          '\uC77C\uC815, \uBC94\uC704, \uC758\uC0AC\uACB0\uC815 \uC601\uD5A5 \uC911\uC2EC',
        materials: [],
      }
    })

    renderProjectMainboardPage({ onSubmitProject })

    const createProject = async (name: string) => {
      await user.click(
        screen.getByRole('button', {
          name: '\uD504\uB85C\uC81D\uD2B8 \uCD94\uAC00',
        }),
      )
      await user.type(
        screen.getByPlaceholderText(
          '\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        ),
        name,
      )
      await user.click(screen.getByRole('button', { name: '\uB2E4\uC74C' }))
      await user.click(screen.getByRole('button', { name: '\uC0DD\uC131\uD558\uAE30' }))
      await screen.findByRole('heading', { name })
    }

    await createProject('\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8')
    await createProject('\uB450 \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8')

    const firstProjectButton = screen.getByRole('button', {
      name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
    })
    const secondProjectButton = screen.getByRole('button', {
      name: '\uB450 \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
    })

    expect(onSubmitProject).toHaveBeenCalledTimes(2)
    expect(secondProjectButton.compareDocumentPosition(firstProjectButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(
      screen.getByRole('button', {
        name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '\uB450 \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toHaveAttribute('aria-current', 'page')

    await user.click(
      screen.getByRole('button', {
        name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '\uCCAB \uBC88\uC9F8 \uD504\uB85C\uC81D\uD2B8',
      }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('keeps a newly created project above a delayed initial response', async () => {
    const user = userEvent.setup()
    let finishInitialLoad: ((projects: ProjectSummary[]) => void) | undefined
    const loadProjects = vi.fn(
      () =>
        new Promise<ProjectSummary[]>((resolve) => {
          finishInitialLoad = resolve
        }),
    )
    const onSubmitProject = vi.fn((draft: ProjectCreateDraft) => ({
      id: 'latest-project',
      name: draft.name,
      overview: draft.overview,
      perspectiveLabel: 'PM',
      perspectiveDescription: 'schedule and scope',
      materials: [],
    }))

    renderProjectMainboardPage({ loadProjects, onSubmitProject })

    await user.click(
      screen.getByRole('button', {
        name: '\uD504\uB85C\uC81D\uD2B8 \uCD94\uAC00',
      }),
    )
    await user.type(
      screen.getByPlaceholderText(
        '\uD504\uB85C\uC81D\uD2B8 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
      ),
      'latest project',
    )
    await user.click(screen.getByRole('button', { name: '\uB2E4\uC74C' }))
    await user.click(screen.getByRole('button', { name: '\uC0DD\uC131\uD558\uAE30' }))
    await screen.findByRole('heading', { name: 'latest project' })

    await act(async () => {
      finishInitialLoad?.([
        {
          id: 'fetched-project',
          name: 'fetched project',
          overview: '',
          perspectiveLabel: 'PM',
          perspectiveDescription: 'schedule and scope',
          materials: [],
        },
      ])
    })

    const latestProjectButton = screen.getByRole('button', {
      name: 'latest project',
    })
    const fetchedProjectButton = await screen.findByRole('button', {
      name: 'fetched project',
    })

    expect(latestProjectButton.compareDocumentPosition(fetchedProjectButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(latestProjectButton).toHaveAttribute('aria-current', 'page')
  })

  it('renames and deletes a project reference from its action menu', async () => {
    const user = userEvent.setup()
    const loadProjects = vi.fn(() =>
      Promise.resolve<ProjectSummary[]>([
        {
          id: 'project-1',
          name: '서비스 디자인',
          overview: '',
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
        },
      ]),
    )

    renderProjectMainboardPage({ loadProjects })
    await screen.findByText('answer-guide.docx')

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))

    expect(screen.getByRole('dialog', { name: '자료 제목 수정' })).toBeInTheDocument()

    const titleInput = screen.getByRole('textbox', { name: '자료 제목' })
    await user.clear(titleInput)
    await user.type(titleInput, 'revised-guide.docx')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(await screen.findByRole('status', { name: '자료 제목 수정 완료' })).toHaveTextContent(
      '자료 제목이 수정되었습니다.',
    )
    expect(screen.getByText('revised-guide.docx')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'revised-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))

    expect(
      screen.getByRole('dialog', {
        name: /‘revised-guide\.docx’\s+자료를 지우시겠습니까\?/,
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(await screen.findByRole('status', { name: '자료 삭제 완료' })).toHaveTextContent(
      '“revised-guide.docx” 자료가 삭제되었습니다.',
    )
    expect(screen.queryByText('revised-guide.docx')).not.toBeInTheDocument()
    expect(screen.getByText('등록된 AI 참고 자료가 없습니다')).toBeInTheDocument()
  })

  it('adds a reference to the active project from the Figma upload modal', async () => {
    const user = userEvent.setup()
    const loadProjects = vi.fn(() =>
      Promise.resolve<ProjectSummary[]>([
        {
          id: 'project-1',
          name: '서비스 디자인',
          overview: '',
          perspectiveLabel: 'PM',
          perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
          materials: [],
        },
      ]),
    )
    const addedMaterial = {
      id: 'material-added',
      kind: 'file' as const,
      name: 'roadmap.pdf',
      createdAt: '2026-07-26T00:00:00.000Z',
    }
    const addProjectReferences = vi.fn(() => Promise.resolve([addedMaterial]))
    const file = new File(['content'], 'roadmap.pdf', { type: 'application/pdf' })

    renderProjectMainboardPage({ addProjectReferences, loadProjects })
    await screen.findByRole('heading', { name: '서비스 디자인' })

    await user.click(screen.getByRole('button', { name: 'AI 참고 자료 추가' }))
    expect(screen.getByRole('dialog', { name: 'AI 참고 자료 업로드' })).toBeInTheDocument()
    await user.upload(screen.getByLabelText('AI 참고 자료 파일 선택'), file)
    await waitFor(() => expect(screen.getByRole('button', { name: '추가하기' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: '추가하기' }))

    expect(addProjectReferences).toHaveBeenCalledWith('project-1', {
      files: [file],
      links: [],
    })
    expect(await screen.findByRole('status', { name: '자료 추가 완료' })).toHaveTextContent(
      'AI 참고 자료가 추가되었습니다.',
    )
    expect(await screen.findByText('roadmap.pdf')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'AI 참고 자료 업로드' })).not.toBeInTheDocument()
  })

  it('keeps project reference data and shows the Figma error toasts when mutations fail', async () => {
    const user = userEvent.setup()
    const loadProjects = vi.fn(() =>
      Promise.resolve<ProjectSummary[]>([
        {
          id: 'project-1',
          name: '서비스 디자인',
          overview: '',
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
        },
      ]),
    )
    const renameProjectReference = vi.fn(() => Promise.reject(new Error('rename failed')))
    const deleteProjectReference = vi.fn(() => Promise.reject(new Error('delete failed')))

    renderProjectMainboardPage({
      deleteProjectReference,
      loadProjects,
      renameProjectReference,
    })
    await screen.findByText('answer-guide.docx')

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '제목 수정하기' }))
    const titleInput = screen.getByRole('textbox', { name: '자료 제목' })
    await user.clear(titleInput)
    await user.type(titleInput, 'revised-guide.docx')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(await screen.findByRole('status', { name: '자료 제목 수정 실패' })).toHaveTextContent(
      '자료 제목을 수정하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(screen.getByText('answer-guide.docx')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'answer-guide.docx 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(await screen.findByRole('status', { name: '자료 삭제 실패' })).toHaveTextContent(
      '참고자료를 삭제하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(screen.getByText('answer-guide.docx')).toBeInTheDocument()
  })

  it('deletes a project through the Figma confirmation dialog and shows the success toast', async () => {
    const user = userEvent.setup()
    const project: ProjectSummary = {
      id: 'project-delete',
      name: '서비스 디자인',
      overview: '',
      perspectiveLabel: 'PM',
      perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
      materials: [],
    }
    renderProjectMainboardPage({ loadProjects: vi.fn().mockResolvedValue([project]) })

    await screen.findByRole('heading', { name: project.name })
    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 삭제하기' }))

    const dialog = screen.getByRole('dialog', { name: '프로젝트 삭제' })
    expect(dialog).toHaveClass('h-[680px]', 'max-w-[460px]', 'gap-m', 'py-l')
    expect(within(dialog).getByTestId('project-delete-illustration')).toHaveAttribute(
      'height',
      '127',
    )
    const deleteButton = within(dialog).getByRole('button', { name: '삭제하기' })
    expect(deleteButton).toBeDisabled()
    await user.click(within(dialog).getByRole('checkbox', { name: '주의 사항을 확인했습니다.' }))
    await user.click(deleteButton)

    expect(await screen.findByRole('status', { name: '프로젝트 삭제 성공' })).toHaveTextContent(
      '‘서비스 디자인’ 프로젝트를 삭제했습니다.',
    )
    expect(screen.getByRole('button', { name: '프로젝트 생성하기' })).toBeInTheDocument()
  })

  it('keeps the delete dialog open and shows the Figma error toast when deletion fails', async () => {
    const user = userEvent.setup()
    const project: ProjectSummary = {
      id: 'project-delete-failure',
      name: '서비스 디자인',
      overview: '',
      perspectiveLabel: 'PM',
      perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
      materials: [],
    }
    renderProjectMainboardPage({
      deleteProject: vi.fn().mockRejectedValue(new Error('delete failed')),
      loadProjects: vi.fn().mockResolvedValue([project]),
    })

    await screen.findByRole('heading', { name: project.name })
    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 삭제하기' }))
    const dialog = screen.getByRole('dialog', { name: '프로젝트 삭제' })
    await user.click(within(dialog).getByRole('checkbox', { name: '주의 사항을 확인했습니다.' }))
    await user.click(within(dialog).getByRole('button', { name: '삭제하기' }))

    expect(screen.getByRole('dialog', { name: '프로젝트 삭제' })).toBeInTheDocument()
    expect(await screen.findByRole('status', { name: '프로젝트 삭제 실패' })).toHaveTextContent(
      '프로젝트를 삭제하지 못했습니다. 다시 시도해 주세요.',
    )
  })
  it('updates the active project and sidebar from the project settings modal', async () => {
    const user = userEvent.setup()
    const project: ProjectSummary = {
      id: 'project-edit',
      name: '회의 보조 AI, 씽큐',
      overview: '기존 프로젝트 개요',
      perspectiveLabel: 'PM',
      perspectiveDescription: '일정, 범위, 의사결정 영향 중심',
      materials: [],
    }

    renderProjectMainboardPage({ loadProjects: vi.fn().mockResolvedValue([project]) })

    await screen.findByRole('heading', { name: project.name })
    await user.click(screen.getByRole('button', { name: '프로젝트 더보기' }))
    await user.click(screen.getByRole('button', { name: '프로젝트 정보 수정하기' }))

    const dialog = screen.getByRole('dialog', { name: '프로젝트 설정' })
    const nameInput = within(dialog).getByRole('textbox', { name: '이름' })
    await user.clear(nameInput)
    await user.type(nameInput, '수정된 씽큐 프로젝트')
    await user.click(within(dialog).getByRole('button', { name: '저장하기' }))

    expect(await screen.findByRole('heading', { name: '수정된 씽큐 프로젝트' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '수정된 씽큐 프로젝트' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
  it('shows an error toast when the initial project list fails', async () => {
    const loadProjects = vi.fn(() => Promise.reject(new Error('network error')))

    renderProjectMainboardPage({ loadProjects })

    const errorToast = await screen.findByRole('status', {
      name: '\uD504\uB85C\uC81D\uD2B8 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
    })

    expect(errorToast).toHaveTextContent(
      '\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
    )
  })
})
