import { formatElapsedTime } from './formatElapsedTime'

/**
 * 전사 세그먼트에 표시할 시각을 만든다.
 *
 * 세그먼트의 startedAtSeconds는 회의 시작 기준 경과 시간이고, 헤더 타이머는 누적 활성 시간이라
 * 서로 다른 값이다. 두 값을 나란히 두면 어긋난 것처럼 보이므로 전사에는 벽시계 시각을 쓴다.
 *
 * 회의 시작 시각을 모르면(구버전 응답 등) 기존처럼 경과 시간으로 되돌린다.
 */
export function formatTranscriptTime(
  startedAtSeconds: number,
  meetingStartedAt?: string | null,
): string {
  if (!meetingStartedAt) return formatElapsedTime(startedAtSeconds)

  const startedAt = new Date(meetingStartedAt)
  if (Number.isNaN(startedAt.getTime())) return formatElapsedTime(startedAtSeconds)

  const safeSeconds = Number.isFinite(startedAtSeconds) ? Math.max(0, startedAtSeconds) : 0
  const spokenAt = new Date(startedAt.getTime() + safeSeconds * 1000)

  return `${String(spokenAt.getHours()).padStart(2, '0')}:${String(spokenAt.getMinutes()).padStart(2, '0')}`
}
