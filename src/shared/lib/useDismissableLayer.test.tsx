import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useDismissableLayer } from './useDismissableLayer'

function DismissableLayerFixture({ onDismiss }: { onDismiss: () => void }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const layerRef = useDismissableLayer<HTMLDivElement>({
    open: true,
    onDismiss,
    triggerRef,
  })

  return (
    <>
      <button ref={triggerRef} type="button">
        트리거
      </button>
      <div ref={layerRef}>레이어 내부</div>
      <button type="button">레이어 외부</button>
    </>
  )
}

describe('useDismissableLayer', () => {
  it('dismisses on an outside pointer down', async () => {
    const onDismiss = vi.fn()
    render(<DismissableLayerFixture onDismiss={onDismiss} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: '레이어 외부' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '트리거' })).toHaveFocus()
    })
  })

  it('does not dismiss on an inside pointer down', () => {
    const onDismiss = vi.fn()
    render(<DismissableLayerFixture onDismiss={onDismiss} />)

    fireEvent.pointerDown(screen.getByText('레이어 내부'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does not dismiss when the trigger is pressed', () => {
    const onDismiss = vi.fn()
    render(<DismissableLayerFixture onDismiss={onDismiss} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: '트리거' }))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses on Escape', async () => {
    const onDismiss = vi.fn()
    render(<DismissableLayerFixture onDismiss={onDismiss} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onDismiss).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '트리거' })).toHaveFocus()
    })
  })
})
