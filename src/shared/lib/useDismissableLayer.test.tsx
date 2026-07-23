import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useDismissableLayer } from './useDismissableLayer'

function DismissableLayerFixture({ onDismiss }: { onDismiss: () => void }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const layerRef = useDismissableLayer<HTMLDivElement>({
    open: true,
    onDismiss,
    restoreFocusRef: triggerRef,
  })

  return (
    <>
      <button ref={triggerRef} type="button">열기</button>
      <div ref={layerRef}>레이어 내부</div>
      <button type="button">레이어 외부</button>
    </>
  )
}

describe('useDismissableLayer', () => {
  it('dismisses on an outside pointer down', () => {
    const onDismiss = vi.fn()
    render(<DismissableLayerFixture onDismiss={onDismiss} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: '레이어 외부' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not dismiss on an inside pointer down', () => {
    const onDismiss = vi.fn()
    render(<DismissableLayerFixture onDismiss={onDismiss} />)

    fireEvent.pointerDown(screen.getByText('레이어 내부'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses on Escape', () => {
    const onDismiss = vi.fn()
    render(<DismissableLayerFixture onDismiss={onDismiss} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
