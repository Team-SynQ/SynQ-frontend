export type MeetingHeaderViewModel = {
  meetingId: string
  projectTitle: string
  meetingTitle: string
  participantCount: number
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
