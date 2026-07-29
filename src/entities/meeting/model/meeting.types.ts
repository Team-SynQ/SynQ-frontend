import type {
  AiChatPinnedContext,
  CompleteMeetingRequest,
  CompletedMeetingSummary,
  LiveMeetingResponse,
  MeetingAiChatMessageResponse,
  MeetingAiChatSuggestionResponse,
  MeetingParticipantResponse,
  MeetingProjectContext,
  TranscriptHintResponse,
  TranscriptSegmentResponse,
} from '../../../shared/api/contracts/meeting.contracts'

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

export type LiveMeeting = LiveMeetingResponse
export type LiveMeetingParticipant = MeetingParticipantResponse
export type LiveMeetingTranscriptSegment = TranscriptSegmentResponse
export type LiveMeetingTranscriptHint = TranscriptHintResponse
export type LiveMeetingAiChatMessage = MeetingAiChatMessageResponse
export type LiveMeetingAiChatSuggestion = MeetingAiChatSuggestionResponse
export type LiveMeetingAiPinnedContext = AiChatPinnedContext
export type CompletedMeeting = CompletedMeetingSummary
export type CompleteMeeting = CompleteMeetingRequest
export type LiveMeetingProjectContext = MeetingProjectContext
