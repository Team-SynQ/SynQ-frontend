import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  ProjectReferenceDeleteDialog,
  ProjectReferenceEditDialog,
  ProjectReferenceMenu,
} from './ProjectReferenceMenu'

describe('ProjectReferenceMenu', () => {
  it('matches the Figma action menu geometry and requests title editing', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onEditTitle = vi.fn()

    render(
      <ProjectReferenceMenu
        id="reference-menu"
        materialName="answer-guide.docx"
        onClose={onClose}
        onDelete={vi.fn()}
        onEditTitle={onEditTitle}
        open
      />,
    )

    const menu = screen.getByRole('menu', { name: 'answer-guide.docx 자료 메뉴' })
    expect(menu).toHaveClass(
      'h-[100px]',
      'w-[165px]',
      'rounded-[16px]',
      'p-[7px]',
      'shadow-[0_4px_8px_rgb(0_0_0/0.08)]',
    )

    const editAction = screen.getByRole('menuitem', { name: '제목 수정하기' })
    const editIcon = editAction.querySelector('img')
    expect(editAction).toHaveClass('h-[42px]', 'px-s', 'typo-body-01')
    expect(editIcon).toHaveAttribute('height', '24')
    expect(editIcon).toHaveAttribute('width', '24')

    await user.click(editAction)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onEditTitle).toHaveBeenCalledTimes(1)
  })

  it('uses the existing trash glyph and requests deletion', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onDelete = vi.fn()

    render(
      <ProjectReferenceMenu
        id="reference-menu"
        materialName="answer-guide.docx"
        onClose={onClose}
        onDelete={onDelete}
        onEditTitle={vi.fn()}
        open
      />,
    )

    const deleteAction = screen.getByRole('menuitem', { name: '삭제하기' })
    const trashIcon = deleteAction.querySelector('img')
    expect(trashIcon).toHaveAttribute('height', '16')
    expect(trashIcon).toHaveAttribute('width', '14')

    await user.click(deleteAction)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('matches the Figma edit dialog and submits a changed title', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ProjectReferenceEditDialog
        currentName="answer-guide.docx"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        open
      />,
    )

    const dialog = screen.getByRole('dialog', { name: '자료 제목 수정' })
    expect(dialog).toHaveClass('max-w-[380px]!', 'px-m!', 'py-l!')

    const input = screen.getByRole('textbox', { name: '자료 제목' })
    expect(input).toHaveValue('answer-guide.docx')
    expect(screen.getByRole('button', { name: '제목 변경하기' })).toBeDisabled()

    await user.clear(input)
    await user.type(input, 'revised-guide.docx')
    await user.click(screen.getByRole('button', { name: '제목 변경하기' }))

    expect(onConfirm).toHaveBeenCalledWith('revised-guide.docx')
  })

  it('matches the Figma delete dialog and requests confirmation', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ProjectReferenceDeleteDialog
        materialName="answer-guide.docx"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        open
      />,
    )

    const dialog = screen.getByRole('dialog', {
      name: /‘answer-guide\.docx’\s+자료를 지우시겠습니까\?/,
    })
    expect(dialog).toHaveClass('max-w-[380px]!')

    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
