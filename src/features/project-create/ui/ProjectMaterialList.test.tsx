import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProjectMaterialList } from './ProjectMaterialList'

describe('ProjectMaterialList', () => {
  it('preserves the Figma outer boxes and SVG leaf sizes', () => {
    render(
      <ProjectMaterialList
        items={[
          { id: 'loading', name: 'loading.pdf', status: 'uploading' },
          { id: 'complete', name: 'complete.pdf', status: 'complete' },
        ]}
        onRemove={vi.fn()}
      />,
    )

    const loadingIcon = screen.getByRole('img', { name: '업로드 중' }).querySelector('img')
    const completeIcon = screen.getByRole('img', { name: '업로드 완료' }).querySelector('img')
    const deleteIcon = screen
      .getByRole('button', { name: 'complete.pdf 삭제' })
      .querySelector('img')

    expect(loadingIcon).toHaveAttribute('width', '24')
    expect(loadingIcon).toHaveAttribute('height', '24')
    expect(completeIcon).toHaveAttribute('width', '15')
    expect(completeIcon).toHaveAttribute('height', '11')
    expect(deleteIcon).toHaveAttribute('width', '11')
    expect(deleteIcon).toHaveAttribute('height', '16')
  })

  it('keeps the existing remove interaction', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <ProjectMaterialList
        items={[{ id: 'material-1', name: 'brief.pdf', status: 'complete' }]}
        onRemove={onRemove}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'brief.pdf 삭제' }))

    expect(onRemove).toHaveBeenCalledWith('material-1')
  })
})
