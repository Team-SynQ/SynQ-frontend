import type { LiveMeetingProjectContext } from '../../../entities/meeting'

const meetingProjectContextStorageKey = (meetingId: string) => `synq:meeting-project:${meetingId}`

function isLiveMeetingProjectContext(value: unknown): value is LiveMeetingProjectContext {
  if (typeof value !== 'object' || value === null) return false
  if (!('projectId' in value) || !('projectTitle' in value)) return false

  return (
    typeof value.projectId === 'string' &&
    value.projectId.length > 0 &&
    typeof value.projectTitle === 'string'
  )
}

export function readMeetingProjectContext(meetingId: string): LiveMeetingProjectContext | null {
  try {
    const stored = window.sessionStorage.getItem(meetingProjectContextStorageKey(meetingId))
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return isLiveMeetingProjectContext(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeMeetingProjectContext(
  meetingId: string,
  value: LiveMeetingProjectContext,
): void {
  try {
    window.sessionStorage.setItem(meetingProjectContextStorageKey(meetingId), JSON.stringify(value))
  } catch {
    // 저장을 못 해도 이번 방문은 라우터 state로 정상 동작한다. 새로고침에서만 복원이 빠진다.
  }
}

export function clearMeetingProjectContext(meetingId: string): void {
  try {
    window.sessionStorage.removeItem(meetingProjectContextStorageKey(meetingId))
  } catch {
    // 종료된 회의가 저장소 때문에 실패하면 안 된다.
  }
}
