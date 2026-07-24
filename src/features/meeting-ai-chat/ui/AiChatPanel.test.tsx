import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { AiChatActions, AiChatViewModel } from '../model/aiChat.types'
import { AiChatPanel } from './AiChatPanel'

const model: AiChatViewModel = {
  draft: '작성 중인 질문',
  isSending: false,
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
    onSelectSuggestion: vi.fn(),
    onSend: vi.fn(),
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
      'max-w-[400px]',
      'border-surface-muted',
    )
    expect(screen.getByRole('button', { name: '지난 회의 범위는?' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue(
      '작성 중인 질문',
    )

    await user.click(
      screen.getByRole('button', { name: 'AI Chat 런처로 축소' }),
    )

    expect(onCollapse).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 축소' }))

    expect(onMinimize).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('button', { name: 'AI Chat 창 확장' }),
    ).not.toBeInTheDocument()
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
      'max-w-[300px]',
      'border-line-default',
    )

    await user.click(
      screen.getByRole('button', { name: 'AI Chat 런처로 축소' }),
    )

    expect(onCollapse).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 확장' }))

    expect(onMaximize).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('button', { name: 'AI Chat 창 축소' }),
    ).not.toBeInTheDocument()
  })
})
