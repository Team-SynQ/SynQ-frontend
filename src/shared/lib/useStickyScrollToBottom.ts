import { useLayoutEffect, useRef } from 'react'

/**
 * 이 거리 안쪽이면 「맨 아래를 보고 있다」로 본다.
 * 여백·반올림 때문에 바닥에 붙여도 정확히 0이 되지 않는다.
 */
const BOTTOM_PROXIMITY_PX = 80

/**
 * 내용이 늘어나면 스크롤을 바닥에 붙인다. 전사 목록과 AI Chat 대화창처럼
 * 아래로 계속 쌓이는 목록에 쓴다.
 *
 * 사용자가 위쪽을 읽는 중이면 따라가지 않는다. 읽던 자리가 끌려 내려가면 더 불편하다.
 *
 * `growthSignal`이 바뀔 때만 움직이므로, 호출부는 「목록이 길어졌다」고 볼 값만 넣어야 한다.
 * 항목 펼침이나 수정처럼 사용자가 그 자리를 보고 있는 변화는 넣지 않는다.
 */
export function useStickyScrollToBottom<T extends HTMLElement>(growthSignal: string) {
  const scrollRef = useRef<T>(null)
  const isPinnedToBottomRef = useRef(true)

  // 렌더 중에는 ref를 읽지 않는다. 위치 판단은 스크롤 이벤트에서만 한다.
  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    isPinnedToBottomRef.current = distanceFromBottom <= BOTTOM_PROXIMITY_PX
  }

  // 그리기 전에 맞춘다. useEffect로 미루면 새 내용이 잠깐 보인 뒤 스크롤이 튀어 매번 깜빡인다.
  useLayoutEffect(() => {
    const container = scrollRef.current
    if (!container || !isPinnedToBottomRef.current) return

    container.scrollTop = container.scrollHeight
  }, [growthSignal])

  return { scrollRef, onScroll: handleScroll }
}
