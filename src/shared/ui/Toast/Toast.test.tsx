import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Toast } from './Toast'

describe('Toast', () => {
  it('uses the 20px Figma toast corner radius', () => {
    render(<Toast title="연결 완료" />)

    expect(screen.getByRole('status')).toHaveClass('rounded-[20px]')
  })
})
