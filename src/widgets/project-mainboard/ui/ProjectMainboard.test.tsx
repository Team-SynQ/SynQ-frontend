import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ProjectSummary } from '../../../entities/project'
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

describe('ProjectMainboard', () => {
  it('renders the empty state when no project exists', () => {
    render(<ProjectMainboard onCreateProject={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: '프로젝트 생성하기' }),
    ).toBeInTheDocument()
  })

  it('renders the created project dashboard from project data', () => {
    render(<ProjectMainboard project={project} />)

    expect(
      screen.getByRole('heading', { name: '서비스 디자인' }),
    ).toBeInTheDocument()
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

    const trashIcon = screen
      .getByRole('button', { name: 'answer-guide.docx \uC0AD\uC81C' })
      .querySelector('img')
    expect(trashIcon).toHaveAttribute('height', '16')
    expect(trashIcon).toHaveAttribute('width', '14')

    const clipboardIcon = screen
      .getByRole('heading', { name: '\uCD5C\uC2E0 \uD68C\uC758 \uC694\uC57D' })
      .parentElement?.querySelector('img')
    expect(clipboardIcon).toHaveAttribute('height', '24')
    expect(clipboardIcon).toHaveAttribute('width', '24')

    const fileIcon = screen
      .getByText('answer-guide.docx')
      .parentElement?.querySelector('img')
    expect(fileIcon).toHaveAttribute('height', '24')
    expect(fileIcon).toHaveAttribute('width', '24')
    expect(screen.getByText('아직 회의 기록이 없습니다')).toBeInTheDocument()
  })
})
