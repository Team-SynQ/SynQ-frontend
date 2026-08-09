import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MeetingRecordDeleteToast } from './MeetingRecordDeleteToast'

describe('MeetingRecordDeleteToast', () => {
  it('renders the deleted meeting title in the success copy', () => {
    render(<MeetingRecordDeleteToast meetingTitle="4차 대면 회의" result="success" />)

    expect(screen.getByText('회의 기록 삭제 완료')).toBeInTheDocument()
    expect(screen.getByText('‘4차 대면 회의’ 회의가 삭제되었습니다.')).toBeInTheDocument()
  })

  it('renders the Figma failure copy', () => {
    render(<MeetingRecordDeleteToast result="failure" />)

    expect(screen.getByText('회의 기록 삭제 실패')).toBeInTheDocument()
    expect(screen.getByText('오류가 발생했습니다. 다시 시도해 주세요.')).toBeInTheDocument()
  })

  it('uses the Figma 20px top-center offset', () => {
    render(<MeetingRecordDeleteToast result="failure" />)

    expect(screen.getByRole('status').parentElement).toHaveStyle({ top: '20px' })
  })
})
