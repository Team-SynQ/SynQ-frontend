import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

import { AI_CHAT_MIN_WIDTH } from '../model/aiChatPanelWidth.storage'

const KEYBOARD_STEP = 24

export type AiChatResizeHandleProps = {
  width: number
  maxWidth: number
  onResize: (width: number) => void
  onResizeEnd: () => void
}

/**
 * 전사와 AI Chat 사이의 구분선. 드래그와 좌우 화살표로 AI Chat 폭을 조절한다.
 *
 * 오른쪽이 AI Chat이므로 왼쪽으로 끌면 넓어진다. 포인터를 캡처해 커서가 구분선을
 * 벗어나도 드래그가 끊기지 않게 한다.
 */
export function AiChatResizeHandle({
  width,
  maxWidth,
  onResize,
  onResizeEnd,
}: AiChatResizeHandleProps) {
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { startX: event.clientX, startWidth: width }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    onResize(drag.startWidth - (event.clientX - drag.startX))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    onResizeEnd()
  }

  return (
    <div
      aria-label="AI Chat 영역 크기 조절"
      aria-orientation="vertical"
      // 컨테이너를 아직 못 쟀거나 창이 좁으면 상한이 하한보다 작아진다. 뒤집힌 범위를 노출하지 않는다.
      aria-valuemax={Math.max(maxWidth, AI_CHAT_MIN_WIDTH)}
      aria-valuemin={AI_CHAT_MIN_WIDTH}
      aria-valuenow={width}
      className="group relative z-10 -mr-[3px] w-[6px] cursor-col-resize touch-none focus-visible:outline-none"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        onResize(width + (event.key === 'ArrowLeft' ? KEYBOARD_STEP : -KEYBOARD_STEP))
        onResizeEnd()
      }}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="separator"
      tabIndex={0}
    >
      <div className="mx-auto h-full w-px bg-line-default transition-colors group-hover:bg-gray-400 group-focus-visible:bg-gray-400" />
    </div>
  )
}
