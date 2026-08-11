export type MeetingAvatarKey = 'you' | 'design' | 'pm' | 'server'

export type MeetingCreateRequest = {
  consentAgreed: boolean
}

export type MeetingCreateResponse = {
  meetingId: number
  title: string
  status: string
  startedAt: string
  wsUrl: string
}

export type MeetingJoinResponse = {
  meetingId: number
  title: string
  status: string
  role: string
  joinedAt: string
  /** 회의 시작 시각. 전사 세그먼트의 startMs가 이 시각 기준이다. */
  startedAt: string
  wsUrl: string
}

export type MeetingEndResponse = {
  meetingId: number
  status: string
  endedAt: string
}

export type MeetingListItemResponse = {
  meetingId: number
  title: string
  status: string
  createdAt: string
  /** 회의가 아직 진행 중이면 null이다. */
  durationSeconds: number | null
  host: {
    userId: number
    name: string
    profileImageUrl: string | null
  }
  /** 요약이 아직 생성되지 않았으면 null이다. */
  keyTopics: string[] | null
}

export type MeetingTitleUpdateResponse = {
  meetingId: number
  title: string
  userModified: boolean
}

export type MeetingParticipantResponse = {
  id: string
  name: string
  /** 서버가 주는 프로필 이미지. 없으면 화면이 이름 첫 글자로 대체한다. */
  profileImageUrl: string | null
  isCurrentUser: boolean
  isHost: boolean
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
  transcript: {
    status: 'waiting' | 'active'
    isSpeaking: boolean
    segments: TranscriptSegmentResponse[]
  }
}

export type LiveMeetingSnapshotResponse = Omit<
  LiveMeetingResponse,
  'elapsedSeconds' | 'recordingState'
>

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

export type FinalizeMeetingRecordRequest = {
  meetingId: string
  projectId: string
  projectTitle: string
  meetingTitle: string
  activeDurationSeconds: number
  endedAt: string
  host: CompletedMeetingSummary['host']
}

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
