import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { ProjectSummary } from '../entities/project'
import type { ProjectCreateDraft } from '../features/project-create'
import { ProjectMainboardPage } from './ProjectMainboardPage'

describe('ProjectMainboardPage', () => {
  it('keeps the empty dashboard until a project is created', async () => {
    render(<ProjectMainboardPage />)

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
    const onSubmitProject = vi.fn(() => new Promise<ProjectSummary>((resolve) => {
      finishCreation = resolve
    }))

    render(<ProjectMainboardPage onSubmitProject={onSubmitProject} />)

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
    await user.click(
      screen.getByRole('button', { name: '\uB2E4\uC74C' }),
    )
    await user.click(
      screen.getByRole('button', { name: '\uC0DD\uC131\uD558\uAE30' }),
    )

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
        perspectiveDescription: '\uC77C\uC815, \uBC94\uC704, \uC758\uC0AC\uACB0\uC815 \uC601\uD5A5 \uC911\uC2EC',
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

    const successToast = screen.getByRole('status', {
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
        perspectiveDescription: '\uC77C\uC815, \uBC94\uC704, \uC758\uC0AC\uACB0\uC815 \uC601\uD5A5 \uC911\uC2EC',
        materials: [],
      }
    })

    render(<ProjectMainboardPage onSubmitProject={onSubmitProject} />)

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
      await user.click(
        screen.getByRole('button', { name: '\uB2E4\uC74C' }),
      )
      await user.click(
        screen.getByRole('button', { name: '\uC0DD\uC131\uD558\uAE30' }),
      )
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
    expect(
      secondProjectButton.compareDocumentPosition(firstProjectButton),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
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
})
