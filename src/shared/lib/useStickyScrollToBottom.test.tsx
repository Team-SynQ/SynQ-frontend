import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useStickyScrollToBottom } from './useStickyScrollToBottom'

function ScrollingList({ items }: { items: string[] }) {
  const { scrollRef, onScroll } = useStickyScrollToBottom<HTMLDivElement>(`${items.length}`)

  return (
    <div data-testid="list" onScroll={onScroll} ref={scrollRef}>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  )
}

/** jsdom은 레이아웃을 계산하지 않아 스크롤 수치가 모두 0이다. 실제 크기를 흉내 낸다. */
function stubScrollMetrics(element: HTMLElement, scrollHeight: number, clientHeight: number) {
  const state = { scrollTop: 0 }

  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: scrollHeight })
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: clientHeight })
  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    get: () => state.scrollTop,
    set: (value: number) => {
      state.scrollTop = value
    },
  })

  return state
}

describe('useStickyScrollToBottom', () => {
  it('내용이 늘어나면 바닥으로 붙인다', () => {
    const { rerender } = render(<ScrollingList items={['첫 번째']} />)
    const list = screen.getByTestId('list')
    stubScrollMetrics(list, 1000, 300)

    rerender(<ScrollingList items={['첫 번째', '두 번째']} />)

    expect(list.scrollTop).toBe(1000)
  })

  it('사용자가 위쪽을 보고 있으면 따라가지 않는다', () => {
    const { rerender } = render(<ScrollingList items={['첫 번째']} />)
    const list = screen.getByTestId('list')
    const state = stubScrollMetrics(list, 1000, 300)

    state.scrollTop = 120
    fireEvent.scroll(list)

    rerender(<ScrollingList items={['첫 번째', '두 번째']} />)

    expect(list.scrollTop).toBe(120)
  })

  it('다시 바닥 근처로 내려오면 따라가기가 되살아난다', () => {
    const { rerender } = render(<ScrollingList items={['첫 번째']} />)
    const list = screen.getByTestId('list')
    const state = stubScrollMetrics(list, 1000, 300)

    state.scrollTop = 120
    fireEvent.scroll(list)
    rerender(<ScrollingList items={['첫 번째', '두 번째']} />)
    expect(list.scrollTop).toBe(120)

    // 바닥까지 700이므로 640이면 60만 남아 「맨 아래를 보고 있다」로 본다.
    state.scrollTop = 640
    fireEvent.scroll(list)
    rerender(<ScrollingList items={['첫 번째', '두 번째', '세 번째']} />)

    expect(list.scrollTop).toBe(1000)
  })

  it('신호가 그대로면 움직이지 않는다', () => {
    const { rerender } = render(<ScrollingList items={['첫 번째']} />)
    const list = screen.getByTestId('list')
    const state = stubScrollMetrics(list, 1000, 300)

    state.scrollTop = 40

    // 목록 길이가 같으면 다시 그려도 스크롤을 건드리지 않는다.
    rerender(<ScrollingList items={['바뀐 첫 번째']} />)

    expect(list.scrollTop).toBe(40)
  })
})
