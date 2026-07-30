import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PersonalSettingsPanel } from './PersonalSettingsPanel'

describe('PersonalSettingsPanel', () => {
  it('renders the Figma navigation and selects a section', async () => {
    const user = userEvent.setup()
    const onSelectSection = vi.fn()
    render(<PersonalSettingsPanel onSelectSection={onSelectSection} />)

    expect(screen.getByRole('navigation', { name: '개인 설정' })).toHaveClass(
      'h-full',
      'w-[179px]',
      'p-xs',
    )
    expect(screen.getByRole('button', { name: '계정 및 기본 설정' })).toHaveClass(
      'h-[42px]',
      'rounded-[10px]!',
      'bg-overlay-dark-08!',
    )

    await user.click(screen.getByRole('button', { name: '도움말' }))
    expect(onSelectSection).toHaveBeenCalledWith('help')
  })
})
