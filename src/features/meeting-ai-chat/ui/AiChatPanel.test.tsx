import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { AiChatActions, AiChatViewModel } from '../model/aiChat.types'
import { AiChatPanel } from './AiChatPanel'

const model: AiChatViewModel = {
  draft: '작성 중인 질문',
  isSending: false,
  isLoading: false,
  isAwaitingAnswer: false,
  loadError: null,
  sendError: null,
  pinnedContext: null,
  messages: [
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: '회의가 시작되었습니다.',
    },
  ],
  suggestions: [
    {
      id: 'previous-scope',
      label: '지난 회의 범위는?',
    },
  ],
}

function createActions(): AiChatActions {
  return {
    onDraftChange: vi.fn(),
    onClearContext: vi.fn(),
    onSelectSuggestion: vi.fn(),
    onSend: vi.fn(),
    onRetryLoad: vi.fn(),
  }
}

describe('AiChatPanel', () => {
  it('renders docked content and requests floating mode', async () => {
    const user = userEvent.setup()
    const onCollapse = vi.fn()
    const onMinimize = vi.fn()

    render(
      <AiChatPanel
        actions={createActions()}
        model={model}
        onCollapse={onCollapse}
        onMinimize={onMinimize}
        variant="docked"
      />,
    )

    expect(screen.getByRole('complementary', { name: 'AI Chat' })).toBeInTheDocument()
    expect(screen.getByText('회의가 시작되었습니다.').closest('article')).toHaveClass(
      'max-w-[min(720px,85%)]',
      'border-surface-muted',
    )
    expect(screen.getByRole('button', { name: '지난 회의 범위는?' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('작성 중인 질문')

    await user.click(screen.getByRole('button', { name: 'AI Chat 런처로 축소' }))

    expect(onCollapse).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 축소' }))

    expect(onMinimize).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'AI Chat 창 확장' })).not.toBeInTheDocument()
  })

  it('renders floating content and requests docked mode', async () => {
    const user = userEvent.setup()
    const onCollapse = vi.fn()
    const onMaximize = vi.fn()

    render(
      <AiChatPanel
        actions={createActions()}
        model={model}
        onCollapse={onCollapse}
        onMaximize={onMaximize}
        variant="floating"
      />,
    )

    const panel = screen.getByRole('complementary', { name: 'AI Chat' })
    expect(panel).toHaveClass('overflow-hidden', 'rounded-m')
    expect(screen.getByText('회의가 시작되었습니다.').closest('article')).toHaveClass(
      'max-w-[min(300px,85%)]',
      'border-line-default',
    )

    await user.click(screen.getByRole('button', { name: 'AI Chat 런처로 축소' }))

    expect(onCollapse).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 확장' }))

    expect(onMaximize).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'AI Chat 창 축소' })).not.toBeInTheDocument()
  })

  it('renders and clears a pinned transcript above the message list', async () => {
    const user = userEvent.setup()
    const actions = createActions()

    render(
      <AiChatPanel
        actions={actions}
        model={{
          ...model,
          pinnedContext: {
            transcriptId: 'segment-1',
            text: '선택한 전사 문장',
          },
        }}
        onCollapse={vi.fn()}
        onMinimize={vi.fn()}
        variant="docked"
      />,
    )

    const context = screen.getByRole('region', { name: 'AI 질문 전사 컨텍스트' })
    const messageLog = screen.getByRole('log', { name: 'AI Chat 메시지' })
    expect(context).toHaveTextContent('선택한 전사 문장')
    expect(context.compareDocumentPosition(messageLog)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    await user.click(screen.getByRole('button', { name: '전사 컨텍스트 제거' }))

    expect(actions.onClearContext).toHaveBeenCalledTimes(1)
  })

  it('announces a controlled AI send error', () => {
    render(
      <AiChatPanel
        actions={createActions()}
        model={{
          ...model,
          sendError: 'AI 답변을 불러오지 못했습니다. 다시 시도해 주세요.',
        }}
        onCollapse={vi.fn()}
        onMinimize={vi.fn()}
        variant="docked"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'AI 답변을 불러오지 못했습니다. 다시 시도해 주세요.',
    )
  })
})
