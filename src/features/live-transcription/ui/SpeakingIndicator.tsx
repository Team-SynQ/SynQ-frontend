/**
 * 디자인 스펙(listening_indicator 로티)의 4단계 파형을 막대마다 -0.25s씩 당겨 걸어
 * 옆으로 흐르는 물결처럼 보이게 한다. 음수 지연을 쓰는 이유는 마운트 첫 프레임부터
 * 이미 순환 중간 지점에서 시작해, 첫 1바퀴부터도 자연스러운 물결 모양이 나오게 하기 위함이다.
 * baseHeight는 각 지연만큼 진행된 지점의 높이 값으로, 움직임 최소화 설정에서 정지 파형으로 남는다.
 */
const WAVEFORM_BARS = [
  { id: 'bar-1', baseHeight: 15, delay: '0s' },
  { id: 'bar-2', baseHeight: 24, delay: '-0.25s' },
  { id: 'bar-3', baseHeight: 15, delay: '-0.5s' },
  { id: 'bar-4', baseHeight: 6, delay: '-0.75s' },
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
