export type MeetingMicrophonePermissionResult = 'granted' | 'denied' | 'unsupported'

export async function requestMeetingMicrophonePermission(): Promise<MeetingMicrophonePermissionResult> {
  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported'

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    return 'denied'
  }

  stream.getTracks().forEach((track) => track.stop())
  return 'granted'
}
