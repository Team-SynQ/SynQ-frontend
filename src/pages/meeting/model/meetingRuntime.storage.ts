export type PersistedMeetingRuntime = {
  activeSeconds: number
  recordingState: 'recording' | 'paused'
}

const meetingRuntimeStorageKey = (meetingId: string) => `synq:meeting-runtime:${meetingId}`

function isPersistedMeetingRuntime(value: unknown): value is PersistedMeetingRuntime {
  if (typeof value !== 'object' || value === null) return false
  if (!('activeSeconds' in value) || !('recordingState' in value)) return false

  return (
    typeof value.activeSeconds === 'number' &&
    Number.isInteger(value.activeSeconds) &&
    value.activeSeconds >= 0 &&
    (value.recordingState === 'recording' || value.recordingState === 'paused')
  )
}

export function readMeetingRuntime(meetingId: string): PersistedMeetingRuntime | null {
  try {
    const stored = window.sessionStorage.getItem(meetingRuntimeStorageKey(meetingId))
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return isPersistedMeetingRuntime(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeMeetingRuntime(meetingId: string, value: PersistedMeetingRuntime): void {
  window.sessionStorage.setItem(meetingRuntimeStorageKey(meetingId), JSON.stringify(value))
}

export function clearMeetingRuntime(meetingId: string): void {
  window.sessionStorage.removeItem(meetingRuntimeStorageKey(meetingId))
}
