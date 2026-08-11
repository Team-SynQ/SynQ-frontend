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
})
