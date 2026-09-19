/**
 * 디자인 스펙(typing_indicator_wave 로티)의 점 세 개를 -0.4s씩 당겨 걸어
 * 물결처럼 이어지게 한다. 음수 지연을 쓰는 이유는 마운트 첫 프레임부터
 * 이미 순환 중간 지점에서 시작해, 첫 1바퀴부터도 물결 모양이 나오게 하기 위함이다.
 *
 * 로티 캔버스(60×30)와 점 크기(지름 10, 간격 5)를 그대로 따른다.
 */
const TYPING_DOTS = [
  { id: 'typing-dot-1', delay: '0s' },
  { id: 'typing-dot-2', delay: '-0.4s' },
  { id: 'typing-dot-3', delay: '-0.8s' },
]

export function AiChatTypingIndicator() {
  return (
    <span
      aria-hidden="true"
      className="flex h-[30px] w-[60px] items-center justify-center gap-[5px]"
    >
      {TYPING_DOTS.map(({ id, delay }) => (
        <span
          className="size-[10px] shrink-0 animate-ai-typing-dot rounded-full bg-gray-600 motion-reduce:animate-none"
          key={id}
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  )
}
