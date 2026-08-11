import { useEffect, useState } from 'react'

import { formatElapsedTime } from '../../../entities/meeting'
import chevronRightIcon from '../../../shared/assets/icons/chevron-right.svg'

type OngoingMeetingButtonProps = {
  /** 회의 시작 시각. 목록 응답의 생성 시각을 쓴다. */
  startedAt: string
  onJoin: () => void
}

function elapsedSecondsSince(startedAt: string, now: number) {
  const startedAtMs = new Date(startedAt).getTime()
  if (Number.isNaN(startedAtMs)) return 0

  return Math.max(0, Math.floor((now - startedAtMs) / 1000))
}

/**
 * 진행 중인 회의가 있을 때 「새 회의 시작」 자리를 대신한다.
 *
 * 공용 `Button`을 쓰지 않는다. 시안이 별도 색을 쓰는데 `cn`이 tailwind-merge가 아니라
 * 배경색 override가 보장되지 않는다.
 */
export function OngoingMeetingButton({ startedAt, onJoin }: OngoingMeetingButtonProps) {
  // 경과 시간을 state로 두면 startedAt이 바뀌었을 때 다음 틱까지 옛 값이 남는다.
  // 흐르는 것은 현재 시각이고 경과 시간은 그로부터 계산한다.
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timerId)
  }, [])

  return (
    <button
      aria-label="진행 중인 회의 참가하기"
      className="inline-flex h-[52px] w-[178px] shrink-0 items-center justify-center gap-xs whitespace-nowrap rounded-m bg-primary-700 px-s text-fg-inverse typo-title-02 transition-colors"
      onClick={onJoin}
      type="button"
    >
      <span>회의 중</span>
      <time>{formatElapsedTime(elapsedSecondsSince(startedAt, now))}</time>
      <img alt="" aria-hidden="true" className="size-[28px]" src={chevronRightIcon} />
    </button>
  )
}
