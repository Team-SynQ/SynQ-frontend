import type {
  AiChatPinnedContext,
  CompleteMeetingRequest,
  CompletedMeetingSummary,
  LiveMeetingSnapshotResponse,
  MeetingAiChatMessageResponse,
  MeetingAiChatSuggestionResponse,
  MeetingParticipantResponse,
  MeetingProjectContext,
  OngoingMeetingSummary,
  TranscriptHintResponse,
  TranscriptSegmentResponse,
} from '../../../shared/api/contracts/meeting.contracts'

export type MeetingHeaderViewModel = {
  meetingId: string
  projectTitle: string
  meetingTitle: string
  participantCount: number
  isHost: boolean
  elapsedSeconds: number
  recordingState: 'recording' | 'paused'
  recordingControlDisabled: boolean
}

export type MeetingHeaderActions = {
  onOpenParticipants: () => void
  onToggleRecording: () => void
  onEndMeeting: () => void
  onOpenMoreMenu: () => void
}

export type LiveMeeting = LiveMeetingSnapshotResponse
export type LiveMeetingParticipant = MeetingParticipantResponse
export type LiveMeetingTranscriptSegment = TranscriptSegmentResponse
export type LiveMeetingTranscriptHint = TranscriptHintResponse
export type LiveMeetingAiChatMessage = MeetingAiChatMessageResponse
export type LiveMeetingAiChatSuggestion = MeetingAiChatSuggestionResponse
export type LiveMeetingAiPinnedContext = AiChatPinnedContext
export type CompletedMeeting = CompletedMeetingSummary
export type OngoingMeeting = OngoingMeetingSummary
export type CompleteMeeting = CompleteMeetingRequest
export type LiveMeetingProjectContext = MeetingProjectContext
