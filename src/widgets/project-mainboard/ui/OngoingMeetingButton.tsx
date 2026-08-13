import { useEffect, useState } from 'react'

import { formatElapsedTime } from '../../../entities/meeting'
import chevronRightIcon from '../../../shared/assets/icons/chevron-right-inverse.svg'

type OngoingMeetingButtonProps = {
  /**
   * 서버가 알려 준 누적 활성 시간(초). 회의 화면 타이머와 같은 값이다.
   * 이 값이 바뀌면 호출부가 다시 마운트해 기준점을 새로 잡는다.
   */
  activeSeconds: number
  /** 일시정지 중이면 시간이 흐르지 않는다. */
  paused: boolean
  onJoin: () => void
}

/**
 * 진행 중인 회의가 있을 때 「새 회의 시작」 자리를 대신한다.
 *
 * 공용 `Button`을 쓰지 않는다. 시안이 별도 색을 쓰는데 `cn`이 tailwind-merge가 아니라
 * 배경색 override가 보장되지 않는다.
 */
export function OngoingMeetingButton({ activeSeconds, paused, onJoin }: OngoingMeetingButtonProps) {
  // 서버 값을 받은 시점을 기준으로 삼고, 그 뒤 흐른 시간만 더한다.
  // 목록 조회는 15초 주기라 매 초를 서버에 물을 수 없다.
  const [baselineAt] = useState(() => Date.now())
  const [now, setNow] = useState(baselineAt)

  useEffect(() => {
    if (paused) return

    const timerId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timerId)
  }, [paused])

  const elapsedSeconds = paused
    ? activeSeconds
    : activeSeconds + Math.max(0, Math.floor((now - baselineAt) / 1000))

  // 한 시간을 넘기면 경과 시간이 HH:MM:SS로 길어진다. 시안 너비는 최소값으로 두고 넘치면 늘어나게 한다.
  return (
    <button
      aria-label="진행 중인 회의 참가하기"
      className="inline-flex h-[52px] min-w-[178px] shrink-0 items-center justify-center gap-xs whitespace-nowrap rounded-m bg-primary-700 px-s text-fg-inverse typo-title-02 transition-colors"
      onClick={onJoin}
      type="button"
    >
      <span>회의 중</span>
      <time>{formatElapsedTime(elapsedSeconds)}</time>
      <img alt="" aria-hidden="true" className="size-[28px]" src={chevronRightIcon} />
    </button>
  )
}
