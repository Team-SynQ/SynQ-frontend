export type MeetingHeaderViewModel = {
  meetingId: string
  projectTitle: string
  meetingTitle: string
  participantCount: number
  isHost: boolean
  liveStatus: 'live'
  elapsedSeconds: number
  recordingState: 'recording' | 'paused'
}

export type MeetingHeaderActions = {
  onOpenParticipants: () => void
  onToggleRecording: () => void
  onEndMeeting: () => void
  onOpenMoreMenu: () => void
}
