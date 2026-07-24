import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MeetingConnectionToast } from './MeetingConnectionToast'

describe('MeetingConnectionToast', () => {
  it('renders the unstable connection copy as assertive', () => {
    render(<MeetingConnectionToast status="unstable" />)

    expect(screen.getByText('연결 상태 불안정')).toBeInTheDocument()
    expect(screen.getByText('연결 상태가 불안정합니다. 다시 시도해주세요.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders the restored connection copy as polite', () => {
    render(<MeetingConnectionToast status="restored" />)

    expect(screen.getByText('연결 완료')).toBeInTheDocument()
    expect(screen.getByText('정상적으로 연결되었습니다.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})
