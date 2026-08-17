/**
 * 막대마다 기준 높이와 시작 지연을 다르게 둔다.
 * 지연은 물결처럼 보이게 하고, 기준 높이는 움직임 최소화 설정에서 정지 파형으로 남는다.
 */
const WAVEFORM_BARS = [
  { id: 'bar-1', baseHeight: 10, delay: '0ms' },
  { id: 'bar-2', baseHeight: 18, delay: '150ms' },
  { id: 'bar-3', baseHeight: 14, delay: '300ms' },
  { id: 'bar-4', baseHeight: 10, delay: '450ms' },
]

export function SpeakingIndicator() {
  return (
    <div className="flex w-full items-center rounded-m p-s">
      <div aria-hidden="true" className="flex size-[36px] items-center justify-center gap-[3px]">
        {WAVEFORM_BARS.map((bar) => (
          <span
            className="w-[4px] animate-speaking-waveform rounded-full bg-gray-600 motion-reduce:animate-none"
            key={bar.id}
            style={{ animationDelay: bar.delay, height: `${bar.baseHeight}px` }}
          />
        ))}
      </div>
      <span className="sr-only">발화 인식 중</span>
    </div>
  )
}
