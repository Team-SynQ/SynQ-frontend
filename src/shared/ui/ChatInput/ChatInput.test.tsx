import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatInput } from './ChatInput'

describe('ChatInput', () => {
  it('forwards its ref to the question input so callers can move focus', () => {
    const inputRef = createRef<HTMLInputElement>()

    render(<ChatInput aria-label="질문" ref={inputRef} />)
    inputRef.current?.focus()

    expect(screen.getByRole('textbox', { name: '질문' })).toHaveFocus()
  })
})
