import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import plusIcon from '../../../shared/assets/icons/plus.svg'
import { ProjectSidebar } from './ProjectSidebar'

describe('ProjectSidebar', () => {
  it('collapses and expands with the sidebar toggle', async () => {
    const user = userEvent.setup()
    const onToggleSidebar = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <ProjectSidebar onToggleSidebar={onToggleSidebar} />
      </MemoryRouter>,
    )

    const panel = container.querySelector('aside')
    const collapseButton = screen.getByRole('button', {
      name: '사이드바 접기',
    })

    expect(panel).toHaveClass('w-[220px]')
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true')

    await user.click(collapseButton)

    const expandButton = screen.getByRole('button', {
      name: '사이드바 펼치기',
    })
    expect(panel).toHaveClass('w-[72px]')
    expect(expandButton).toHaveAttribute('aria-expanded', 'false')

    // 접힘 상태에서는 심볼 로고가 기본이고, 호버 중에만 펼치기 아이콘으로 바뀝니다.
    const collapsedLogo = screen.getByRole('img', { name: 'SynQ' })
    expect(expandButton).toContainElement(collapsedLogo)
    expect(collapsedLogo).toHaveClass('group-hover:hidden')

    await user.click(expandButton)

    expect(panel).toHaveClass('w-[220px]')
    expect(onToggleSidebar).toHaveBeenCalledTimes(2)
  })

  it('moves to the projects home when the logo is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/settings/help']}>
        <Routes>
          <Route element={<ProjectSidebar />} path="/settings/help" />
          <Route element={<h1>프로젝트 홈</h1>} path="/projects" />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '홈으로 이동' }))

    expect(screen.getByRole('heading', { name: '프로젝트 홈' })).toBeInTheDocument()
  })

  it('renders the active project with the shared menu item', () => {
    render(
      <MemoryRouter>
        <ProjectSidebar
          activeProjectId="project-1"
          projects={[{ id: 'project-1', name: '서비스 디자인' }]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '서비스 디자인' })).toHaveClass(
      'bg-surface-muted',
      'text-fg-primary',
    )
  })

  it('opens project creation from the Figma-sized add button', async () => {
    const user = userEvent.setup()
    const onAddProject = vi.fn()

    render(
      <MemoryRouter>
        <ProjectSidebar onAddProject={onAddProject} />
      </MemoryRouter>,
    )

    const addButton = screen.getByRole('button', {
      name: '\uD504\uB85C\uC81D\uD2B8 \uCD94\uAC00',
    })
    const addIcon = addButton.firstElementChild as HTMLElement

    expect(addButton).toHaveClass('h-[32px]', 'bg-transparent')
    expect(addButton).not.toHaveClass('bg-surface-muted!', 'border-line-default')
    expect(addIcon.parentElement).toBe(addButton)
    expect(addIcon.tagName).toBe('SPAN')
    expect(addIcon).toHaveClass('block', 'size-[24px]', 'bg-current')
    expect(addIcon.style.maskImage).toBe(`url("${plusIcon}")`)
    expect(addIcon.style.webkitMaskImage).toBe(`url("${plusIcon}")`)

    await user.click(addButton)

    expect(onAddProject).toHaveBeenCalledTimes(1)
  })
})
