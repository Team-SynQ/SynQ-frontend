import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProjectMaterialUploadError } from '../model/projectMaterialUpload.config'
import { ProjectMaterialUploadForm } from './ProjectMaterialUploadForm'

const defaultProps = {
  titleId: 'title',
  descriptionId: 'description',
  onBack: vi.fn(),
  onClose: vi.fn(),
}

describe('ProjectMaterialUploadForm', () => {
  it('renders the Figma reference-add variant and submits selected materials', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const file = new File(['content'], 'roadmap.pdf', { type: 'application/pdf' })

    render(
      <ProjectMaterialUploadForm
        mode="project-reference"
        onClose={vi.fn()}
        onCreate={onCreate}
        titleId="reference-upload-title"
      />,
    )

    expect(screen.getByRole('heading', { name: 'AI 참고 자료 업로드' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: '2 / 2 단계' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '이전' })).not.toBeInTheDocument()
    expect(screen.getByText('파일 당 최대 10MB')).toBeInTheDocument()

    await user.upload(screen.getByLabelText('AI 참고 자료 파일 선택'), file)
    await waitFor(() => expect(screen.getByRole('button', { name: '추가하기' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: '추가하기' }))

    expect(onCreate).toHaveBeenCalledWith({ files: [file], links: [] })
  })

  it('keeps the file and link tabs inside the segmented control background', () => {
    render(<ProjectMaterialUploadForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: '파일' })).toHaveClass('min-w-0!', 'flex-1')
    expect(screen.getByRole('button', { name: '링크' })).toHaveClass('min-w-0!', 'flex-1')
  })

  it('uses the Figma 10MB limit in the reference-add variant', async () => {
    const user = userEvent.setup()
    const file = new File(['content'], 'large.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 })

    render(
      <ProjectMaterialUploadForm
        mode="project-reference"
        onClose={vi.fn()}
        titleId="reference-upload-title"
      />,
    )
    await user.upload(screen.getByLabelText('AI 참고 자료 파일 선택'), file)

    expect(await screen.findByRole('status', { name: '파일 용량 초과' })).toHaveTextContent(
      '파일은 10MB 이하로 업로드해 주세요',
    )
  })

  it('accepts supported files from the file picker', async () => {
    const user = userEvent.setup()
    const onUploadFiles = vi.fn()

    render(<ProjectMaterialUploadForm {...defaultProps} onUploadFiles={onUploadFiles} />)

    const file = new File(['content'], 'brief.pdf', {
      type: 'application/pdf',
    })
    await user.upload(screen.getByLabelText('AI 참고 자료 파일 선택'), file)

    await waitFor(() => expect(onUploadFiles).toHaveBeenCalledWith([file]))
    expect(screen.getByText('brief.pdf')).toBeInTheDocument()
  })

  it('shows the unsupported format toast', async () => {
    render(<ProjectMaterialUploadForm {...defaultProps} />)

    fireEvent.change(screen.getByLabelText('AI 참고 자료 파일 선택'), {
      target: {
        files: [new File(['image'], 'preview.png', { type: 'image/png' })],
      },
    })

    expect(
      await screen.findByRole('status', { name: '지원하지 않는 파일 형식' }),
    ).toBeInTheDocument()
    expect(screen.getByText('PDF, DOCX, PPTX, TXT 파일만 업로드할 수 있어요')).toBeInTheDocument()
  })

  it('shows the file size toast when the configured limit is exceeded', async () => {
    const user = userEvent.setup()
    const file = new File(['content'], 'large.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 + 1 })

    render(<ProjectMaterialUploadForm {...defaultProps} />)
    await user.upload(screen.getByLabelText('AI 참고 자료 파일 선택'), file)

    expect(await screen.findByRole('status', { name: '파일 용량 초과' })).toBeInTheDocument()
    expect(screen.getByText('파일은 20MB 이하로 업로드해 주세요')).toBeInTheDocument()
  })

  it('limits a file batch to five items before calling the upload adapter', async () => {
    const onUploadFiles = vi.fn()
    render(<ProjectMaterialUploadForm {...defaultProps} onUploadFiles={onUploadFiles} />)

    const files = Array.from(
      { length: 6 },
      (_, index) => new File(['content'], `brief-${index}.pdf`, { type: 'application/pdf' }),
    )
    fireEvent.change(screen.getByLabelText('AI 참고 자료 파일 선택'), { target: { files } })

    expect(onUploadFiles).not.toHaveBeenCalled()
    expect(await screen.findByRole('status')).toBeInTheDocument()
  })
  it('maps upload adapter errors to the matching toast', async () => {
    const user = userEvent.setup()
    const onUploadFiles = vi
      .fn()
      .mockRejectedValue(new ProjectMaterialUploadError('too-many-files'))

    render(<ProjectMaterialUploadForm {...defaultProps} onUploadFiles={onUploadFiles} />)

    await user.upload(
      screen.getByLabelText('AI 참고 자료 파일 선택'),
      new File(['content'], 'one.pdf', { type: 'application/pdf' }),
    )

    expect(await screen.findByRole('status', { name: '동시 업로드 개수 초과' })).toBeInTheDocument()
  })

  it('falls back to the general failure toast for unknown upload errors', async () => {
    const user = userEvent.setup()
    const onUploadFiles = vi.fn().mockRejectedValue(new Error('network'))

    render(<ProjectMaterialUploadForm {...defaultProps} onUploadFiles={onUploadFiles} />)

    await user.upload(
      screen.getByLabelText('AI 참고 자료 파일 선택'),
      new File(['content'], 'one.pdf', { type: 'application/pdf' }),
    )

    expect(await screen.findByRole('status', { name: '파일 업로드 실패' })).toBeInTheDocument()
    expect(screen.getByText('파일을 업로드하지 못했습니다. 다시 시도해 주세요')).toBeInTheDocument()
  })

  it('shows the link failure toast for unsupported links', async () => {
    const user = userEvent.setup()

    render(<ProjectMaterialUploadForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: '링크' }))
    await user.type(screen.getByPlaceholderText('링크를 입력하세요'), 'ftp://example.com/reference')
    await user.click(screen.getByRole('button', { name: '링크 추가' }))

    expect(await screen.findByRole('status', { name: '링크 업로드 실패' })).toBeInTheDocument()
    expect(screen.getByText('올바른 링크를 입력해 주세요')).toBeInTheDocument()
  })
  it('shows upload progress and completion states from the upload promise', async () => {
    const user = userEvent.setup()
    let finishUpload: (() => void) | undefined
    const onUploadFiles = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishUpload = resolve
        }),
    )

    render(<ProjectMaterialUploadForm {...defaultProps} onUploadFiles={onUploadFiles} />)

    await user.upload(
      screen.getByLabelText('AI 참고 자료 파일 선택'),
      new File(['content'], 'answer-guide.docx'),
    )

    expect(screen.getByRole('img', { name: '업로드 중' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '생성하기' })).toBeDisabled()

    finishUpload?.()

    expect(await screen.findByRole('img', { name: '업로드 완료' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '생성하기' })).toBeEnabled()
  })

  it('keeps the modal open and shows a toast when project creation fails', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockRejectedValue(new Error('create failed'))

    render(<ProjectMaterialUploadForm {...defaultProps} onCreate={onCreate} />)

    await user.click(screen.getByRole('button', { name: '생성하기' }))

    expect(await screen.findByRole('status', { name: '프로젝트 생성 실패' })).toHaveTextContent(
      '프로젝트를 생성하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(screen.getByRole('heading', { name: 'AI 참고 자료 업로드' })).toBeInTheDocument()
  })
})
