export type MeetingParticipant = {
  id: string
  name: string
  role: string
  avatarSrc?: string
  isCurrentUser?: boolean
  isHost?: boolean
  isMicrophoneOn?: boolean
}
