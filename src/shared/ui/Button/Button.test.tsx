import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('uses the all-corner small radius token for Figma action buttons', () => {
    render(
      <>
        <Button size="small" variant="fillGray100">
          Cancel
        </Button>
        <Button size="small" variant="primaryFill">
          Save
        </Button>
      </>,
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    const saveButton = screen.getByRole('button', { name: 'Save' })

    expect(cancelButton).toHaveClass(
      'h-[32px]',
      'rounded-[var(--radius-s)]',
      'border-stroke-md',
      'border-line-default',
    )
    expect(saveButton).toHaveClass('h-[32px]', 'rounded-[var(--radius-s)]', 'bg-brand-primary')
    expect(cancelButton).not.toHaveClass('rounded-s')
    expect(saveButton).not.toHaveClass('rounded-s')
  })
})
