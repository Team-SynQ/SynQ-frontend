import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AiChatMessageList } from './AiChatMessageList'

const messages = [
  { id: 'assistant-welcome', role: 'assistant' as const, content: '회의가 시작되었습니다.' },
]

describe('AiChatMessageList 로딩 상태', () => {
  it('대화가 비어 있고 불러오는 중이면 준비 중임을 알린다', () => {
    render(<AiChatMessageList isLoading messages={[]} variant="docked" />)

    expect(screen.getByRole('status')).toHaveTextContent('AI Chat을 준비하고 있습니다')
  })

  // 재진입 시 기존 대화 위에 로딩 문구가 겹치면 읽기 어렵다.
  it('기존 대화가 있으면 로딩 문구로 가리지 않는다', () => {
    render(<AiChatMessageList isLoading messages={messages} variant="docked" />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('회의가 시작되었습니다.')).toBeInTheDocument()
  })

  it('답변을 기다리는 동안 생성 중임을 알린다', () => {
    render(<AiChatMessageList isAwaitingAnswer messages={messages} variant="docked" />)

    expect(screen.getByRole('status')).toHaveTextContent('답변을 생성하고 있습니다')
  })

  it('불러오기에 실패하면 사유와 재시도를 보여준다', async () => {
    const user = userEvent.setup()
    const onRetryLoad = vi.fn()
    render(
      <AiChatMessageList
        loadError="AI Chat을 불러오지 못했습니다."
        messages={[]}
        onRetryLoad={onRetryLoad}
        variant="docked"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('AI Chat을 불러오지 못했습니다.')
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(onRetryLoad).toHaveBeenCalledOnce()
  })

  it('불러오는 중에는 실패 안내를 함께 띄우지 않는다', () => {
    render(<AiChatMessageList isLoading loadError="실패" messages={[]} variant="docked" />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // 대화가 길면 새 말풍선이 보이는 영역 아래에 생겨 직접 내려야 보인다.
  it('새 말풍선이 붙으면 대화창이 바닥으로 따라간다', () => {
    const { rerender } = render(<AiChatMessageList messages={messages} variant="docked" />)
    const list = screen.getByRole('log')

    // jsdom은 레이아웃을 계산하지 않아 스크롤 수치가 모두 0이다. 실제 크기를 흉내 낸다.
    const state = { scrollTop: 0 }
    Object.defineProperty(list, 'scrollHeight', { configurable: true, value: 1000 })
    Object.defineProperty(list, 'clientHeight', { configurable: true, value: 300 })
    Object.defineProperty(list, 'scrollTop', {
      configurable: true,
      get: () => state.scrollTop,
      set: (value: number) => {
        state.scrollTop = value
      },
    })

    rerender(
      <AiChatMessageList
        messages={[...messages, { id: 'user-1', role: 'user', content: '일정은 언제인가요?' }]}
        variant="docked"
      />,
    )

    expect(list.scrollTop).toBe(1000)
  })

  // 전송 직후에는 답변 대기 안내만 붙는다. 그것도 목록 높이를 바꾼다.
  it('답변 대기 안내가 붙어도 바닥으로 따라간다', () => {
    const { rerender } = render(<AiChatMessageList messages={messages} variant="docked" />)
    const list = screen.getByRole('log')

    const state = { scrollTop: 0 }
    Object.defineProperty(list, 'scrollHeight', { configurable: true, value: 1000 })
    Object.defineProperty(list, 'clientHeight', { configurable: true, value: 300 })
    Object.defineProperty(list, 'scrollTop', {
      configurable: true,
      get: () => state.scrollTop,
      set: (value: number) => {
        state.scrollTop = value
      },
    })

    rerender(<AiChatMessageList isAwaitingAnswer messages={messages} variant="docked" />)

    expect(list.scrollTop).toBe(1000)
  })
})
