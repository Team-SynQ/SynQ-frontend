import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { MeetingStartPage } from './MeetingStartPage'

function Destination() {
  const location = useLocation()
  const state = location.state as { projectTitle?: string } | null

  return (
    <p>
      도착 {location.pathname} {state?.projectTitle ?? '상태 없음'}
    </p>
  )
}

function renderStartPage() {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/meetings/7/start', state: { projectTitle: '서비스 디자인' } }]}
    >
      <Routes>
        <Route element={<MeetingStartPage />} path="/meetings/:meetingId/start" />
        <Route element={<Destination />} path="/meetings/:meetingId/tutorial" />
        <Route element={<Destination />} path="/meetings/:meetingId/live" />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('MeetingStartPage', () => {
  it('튜토리얼을 아직 숨기지 않았으면 튜토리얼로 보낸다', () => {
    renderStartPage()

    expect(screen.getByText(/도착 \/meetings\/7\/tutorial/)).toBeInTheDocument()
  })

  it('「다시 보지 않기」를 저장했으면 회의 화면으로 바로 보낸다', () => {
    window.localStorage.setItem('synq:meeting-tutorial:hidden', 'true')

    renderStartPage()

    expect(screen.getByText(/도착 \/meetings\/7\/live/)).toBeInTheDocument()
  })

  it('어느 쪽으로 가든 프로젝트 정보를 함께 넘긴다', () => {
    renderStartPage()

    expect(screen.getByText(/서비스 디자인/)).toBeInTheDocument()
  })
})
