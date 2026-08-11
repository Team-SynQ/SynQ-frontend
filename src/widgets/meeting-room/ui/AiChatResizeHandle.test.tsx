import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AiChatResizeHandle } from './AiChatResizeHandle'

function renderHandle(overrides: Partial<Parameters<typeof AiChatResizeHandle>[0]> = {}) {
  const onResize = vi.fn()
  const onResizeEnd = vi.fn()
  render(
    <AiChatResizeHandle
      maxWidth={900}
      onResize={onResize}
      onResizeEnd={onResizeEnd}
      width={500}
      {...overrides}
    />,
  )
  const handle = screen.getByRole('separator', { name: 'AI Chat 영역 크기 조절' })
  // jsdom에는 포인터 캡처가 없다. 드래그 경로만 확인하면 되므로 비워 둔다.
  handle.setPointerCapture = vi.fn()
  handle.releasePointerCapture = vi.fn()
  return { handle, onResize, onResizeEnd }
}

describe('AiChatResizeHandle', () => {
  it('현재 폭과 조절 범위를 알린다', () => {
    const { handle } = renderHandle()

    expect(handle).toHaveAttribute('aria-valuenow', '500')
    expect(handle).toHaveAttribute('aria-valuemin', '360')
    expect(handle).toHaveAttribute('aria-valuemax', '900')
  })

  // 오른쪽이 AI Chat이므로 왼쪽으로 끌면 넓어진다.
  it('왼쪽으로 끌면 AI Chat이 넓어진다', () => {
    const { handle, onResize } = renderHandle()

    fireEvent.pointerDown(handle, { clientX: 800, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientX: 700, pointerId: 1 })

    expect(onResize).toHaveBeenCalledWith(600)
  })

  it('누르지 않은 채 움직이면 아무 일도 없다', () => {
    const { handle, onResize } = renderHandle()

    fireEvent.pointerMove(handle, { clientX: 700, pointerId: 1 })

    expect(onResize).not.toHaveBeenCalled()
  })

  it('드래그를 마치면 저장을 알린다', () => {
    const { handle, onResizeEnd } = renderHandle()

    fireEvent.pointerDown(handle, { clientX: 800, pointerId: 1 })
    fireEvent.pointerUp(handle, { clientX: 700, pointerId: 1 })

    expect(onResizeEnd).toHaveBeenCalledOnce()
  })

  it('좌우 화살표로도 조절한다', async () => {
    const user = userEvent.setup()
    const { handle, onResize, onResizeEnd } = renderHandle()

    handle.focus()
    await user.keyboard('{ArrowLeft}')
    expect(onResize).toHaveBeenLastCalledWith(524)

    await user.keyboard('{ArrowRight}')
    expect(onResize).toHaveBeenLastCalledWith(476)
    expect(onResizeEnd).toHaveBeenCalledTimes(2)
  })
})
