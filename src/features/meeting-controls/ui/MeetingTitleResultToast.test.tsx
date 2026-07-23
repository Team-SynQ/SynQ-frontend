import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MeetingTitleResultToast } from './MeetingTitleResultToast'

describe('MeetingTitleResultToast', () => {
  it('renders the changed title in the success copy', () => {
    render(<MeetingTitleResultToast nextTitle="2차 대면회의" result="success" />)

    expect(screen.getByText('회의 기록 제목 변경 성공')).toBeInTheDocument()
    expect(screen.getByText("'2차 대면회의' 으로 제목이 변경됐습니다.")).toBeInTheDocument()
  })

  it('renders the failure copy', () => {
    render(<MeetingTitleResultToast result="failure" />)

    expect(screen.getByText('회의 기록 제목 변경 실패')).toBeInTheDocument()
    expect(screen.getByText('오류가 발생했습니다. 다시 시도해 주세요.')).toBeInTheDocument()
  })

  it('forwards a custom class name to the toast positioner', () => {
    render(
      <MeetingTitleResultToast
        className="meeting-title-result"
        result="failure"
      />,
    )

    expect(screen.getByRole('status').parentElement).toHaveClass('meeting-title-result')
  })
})
