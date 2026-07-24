import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AiChatLauncher } from './AiChatLauncher'

describe('AiChatLauncher', () => {
  it('opens AI Chat from the 100px launcher control', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()

    render(<AiChatLauncher onOpen={onOpen} />)

    const launcher = screen.getByRole('button', { name: 'AI Chat 열기' })
    const surface = screen.getByTestId('ai-chat-launcher-surface')

    expect(launcher).toHaveClass('size-[100px]')
    expect(surface).toHaveClass(
      'size-[80px]',
      'bg-gray-800',
      'shadow-ai-chat-launcher',
    )
    expect(screen.getByTestId('ai-chat-launcher-symbol')).toHaveAttribute(
      'aria-hidden',
      'true',
    )

    await user.click(launcher)

    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})
