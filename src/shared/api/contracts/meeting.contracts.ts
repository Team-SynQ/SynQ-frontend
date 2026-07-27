export type MeetingAvatarKey = 'you' | 'design' | 'pm' | 'server'

export type MeetingParticipantResponse = {
  id: string
  name: string
  role: string
  avatarKey: MeetingAvatarKey
  isCurrentUser: boolean
  isHost: boolean
  isMicrophoneOn: boolean
}

export type TranscriptSegmentResponse = {
  id: string
  sequenceIndex: number
  startedAtSeconds: number
  text: string
  isEdited: boolean
  editedAt: string | null
}

export type TranscriptHintResponse = {
  transcriptId: string
  notice: string | null
  meaning: string
  personalImpact: string
  teamQuestion: string
}

export type AiChatPinnedContext = {
  transcriptId: string
  text: string
}

export type MeetingAiChatMessageResponse = {
  id: string
  role: 'assistant' | 'user'
  content: string
  context: AiChatPinnedContext | null
}

export type MeetingAiChatSuggestionResponse = {
  id: string
  label: string
}

export type LiveMeetingResponse = {
  meetingId: string
  projectId: string
  projectTitle: string
  meetingTitle: string
  elapsedSeconds: number
  recordingState: 'recording' | 'paused'
  participants: MeetingParticipantResponse[]
  transcript: {
    status: 'waiting' | 'active'
    isSpeaking: boolean
    segments: TranscriptSegmentResponse[]
  }
  aiChat: {
    messages: MeetingAiChatMessageResponse[]
    suggestions: MeetingAiChatSuggestionResponse[]
  }
}

export type UpdateTranscriptRequest = {
  meetingId: string
  segmentId: string
  text: string
}

export type GetTranscriptHintRequest = {
  meetingId: string
  transcriptId: string
}

export type SendMeetingAiQuestionRequest = {
  meetingId: string
  question: string
  context: AiChatPinnedContext | null
}

export type MeetingProjectContext = {
  projectId: string
  projectTitle: string
}

export type CompletedMeetingSummary = {
  recordId: string
  meetingId: string
  projectId: string
  projectTitle: string
  meetingTitle: string
  durationSeconds: number
  completedAt: string
  host: {
    id: string
    name: string
    avatarKey: MeetingAvatarKey
  }
  overview: string
  keywords: string[]
  decisions: string[]
}

export type CompleteMeetingRequest = Omit<
  CompletedMeetingSummary,
  'recordId' | 'overview' | 'keywords' | 'decisions'
>

export type PersonalSummary = {
  roleBadge: string
  roleSummary: string
  impacts: string[]
  actionItems: string[]
  questions: string[]
}

export type MeetingDetailResponse = CompletedMeetingSummary & {
  roleTag: string
  perspectiveTag: string
  round: string
  personalSummary: PersonalSummary
}