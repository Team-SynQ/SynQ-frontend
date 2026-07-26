import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import errorIcon from '../../assets/icons/toast-error.svg'
import { Toast } from './Toast'

describe('Toast', () => {
  it('uses the 20px Figma toast corner radius', () => {
    render(<Toast title="연결 완료" />)

    expect(screen.getByRole('status')).toHaveClass('rounded-[20px]')
  })

  it('supports the 497px success toast and exact success asset', () => {
    render(<Toast size="wide" title="새 역할/관점 추가 완료" />)

    const status = screen.getByRole('status')
    expect(status.parentElement).toHaveClass('max-w-[497px]')
    expect(status.querySelector('img')).toHaveAttribute('width', '70')
    expect(status.querySelector('img')).toHaveAttribute('height', '70')
  })
  it('uses the exact 70px Figma error asset', () => {
    render(<Toast title="파일 업로드 실패" type="error" />)

    const icon = screen.getByRole('status').querySelector('img')
    expect(icon).toHaveAttribute('width', '70')
    expect(icon).toHaveAttribute('height', '70')
    expect(icon).toHaveAttribute('src', errorIcon)
  })

  it('hides an invisible toast from the accessibility tree', () => {
    render(<Toast title="저장 완료" visible={false} />)

    const hiddenStatus = screen.getByRole('status', { hidden: true })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(hiddenStatus).toHaveAttribute('aria-live', 'off')
    expect(hiddenStatus.parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(hiddenStatus.parentElement).toHaveClass(
      '-translate-y-xs',
      'opacity-0',
      'duration-300',
    )
  })
})
