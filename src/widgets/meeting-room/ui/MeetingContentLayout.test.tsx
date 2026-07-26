import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { AiChatContentProps, AiChatDisplayMode } from '../../../features/meeting-ai-chat'
import type { TranscriptPanelProps } from '../../../features/live-transcription'
import { MeetingContentLayout } from './MeetingContentLayout'

const aiChat: AiChatContentProps = {
  actions: {
    onDraftChange: vi.fn(),
    onSelectSuggestion: vi.fn(),
    onSend: vi.fn(),
  },
  model: {
    draft: '',
    isSending: false,
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '회의가 시작되었습니다.',
      },
    ],
    suggestions: [],
  },
}

const transcript: TranscriptPanelProps = {
  actions: {
    onRefresh: vi.fn(),
    onSelectSegment: vi.fn(),
  },
  state: {
    kind: 'waiting',
  },
}

function LayoutHarness({ initialMode }: { initialMode: AiChatDisplayMode }) {
  const [mode, setMode] = useState(initialMode)

  return (
    <MeetingContentLayout
      aiChat={aiChat}
      aiChatDisplay={{
        mode,
        onModeChange: setMode,
      }}
      transcript={transcript}
    />
  )
}

describe('MeetingContentLayout', () => {
  it('moves between docked and floating while preserving the panel control', async () => {
    const user = userEvent.setup()
    const { container } = render(<LayoutHarness initialMode="docked" />)

    const root = container.querySelector('[data-ai-chat-mode]')
    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')
    expect(root).toHaveClass('grid-cols-[minmax(524px,1fr)_500px]')

    const minimize = screen.getByRole('button', { name: 'AI Chat 창 축소' })
    minimize.focus()
    await user.click(minimize)

    expect(root).toHaveAttribute('data-ai-chat-mode', 'floating')
    expect(root).toHaveClass('grid-cols-[minmax(0,1fr)]')

    const maximize = screen.getByRole('button', { name: 'AI Chat 창 확장' })
    expect(maximize).toHaveFocus()
    expect(screen.getByRole('complementary', { name: 'AI Chat' })).toHaveClass(
      'overflow-hidden',
      'rounded-m',
    )
    expect(screen.getByRole('complementary', { name: 'AI Chat' }).parentElement).toHaveClass(
      'absolute',
      'bottom-m',
      'right-m',
      'z-20',
      'h-[min(618px,calc(100%_-_48px))]',
      'w-[400px]',
      'shadow-ai-chat-floating',
    )

    await user.click(maximize)

    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')
    expect(screen.getByRole('button', { name: 'AI Chat 창 축소' })).toHaveFocus()
  })

  it('returns from launcher to docked when docked was the entry mode', async () => {
    const user = userEvent.setup()
    const { container } = render(<LayoutHarness initialMode="docked" />)
    const root = container.querySelector('[data-ai-chat-mode]')

    await user.click(screen.getByRole('button', { name: 'AI Chat 런처로 축소' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'launcher')
    const launcher = screen.getByRole('button', { name: 'AI Chat 열기' })
    expect(launcher).toHaveFocus()

    await user.click(launcher)

    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')
    expect(screen.getByRole('button', { name: 'AI Chat 런처로 축소' })).toHaveFocus()
  })

  it('returns from launcher to floating when floating was the entry mode', async () => {
    const user = userEvent.setup()
    const { container } = render(<LayoutHarness initialMode="floating" />)
    const root = container.querySelector('[data-ai-chat-mode]')

    await user.click(screen.getByRole('button', { name: 'AI Chat 런처로 축소' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'launcher')
    const launcher = screen.getByRole('button', { name: 'AI Chat 열기' })
    expect(launcher).toHaveFocus()

    await user.click(launcher)

    expect(root).toHaveAttribute('data-ai-chat-mode', 'floating')
    expect(screen.getByRole('button', { name: 'AI Chat 런처로 축소' })).toHaveFocus()
  })

  it('renders launcher without panel content and returns focus to floating', async () => {
    const user = userEvent.setup()
    const { container } = render(<LayoutHarness initialMode="launcher" />)

    const root = container.querySelector('[data-ai-chat-mode]')
    expect(root).toHaveAttribute('data-ai-chat-mode', 'launcher')
    expect(screen.queryByRole('complementary', { name: 'AI Chat' })).not.toBeInTheDocument()

    const launcher = screen.getByRole('button', { name: 'AI Chat 열기' })
    await user.click(launcher)

    expect(root).toHaveAttribute('data-ai-chat-mode', 'floating')
    expect(screen.getByRole('button', { name: 'AI Chat 런처로 축소' })).toHaveFocus()
  })

  it('focuses the launcher when an external control requests launcher mode', () => {
    const onModeChange = vi.fn()
    const { rerender } = render(
      <MeetingContentLayout
        aiChat={aiChat}
        aiChatDisplay={{
          mode: 'floating',
          onModeChange,
        }}
        transcript={transcript}
      />,
    )

    rerender(
      <MeetingContentLayout
        aiChat={aiChat}
        aiChatDisplay={{
          mode: 'launcher',
          onModeChange,
        }}
        transcript={transcript}
      />,
    )

    expect(screen.getByRole('button', { name: 'AI Chat 열기' })).toHaveFocus()
  })
})
