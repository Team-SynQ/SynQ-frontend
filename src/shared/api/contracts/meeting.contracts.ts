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
  /** 지금 일시정지 중인지. 늦게 입장해도 이 값으로 진행자와 맞춘다. */
  paused: boolean
  /** 일시정지 구간을 제외한 누적 활성 시간(초). 진행자 화면 타이머와 같은 값이다. */
  activeSeconds: number
}

/** 일시정지·재개 요청의 응답. WebSocket 알림과 같은 값을 담는다. */
export type MeetingPauseStateResponse = {
  meetingId: number
  status: string
  paused: boolean
  activeSeconds: number
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
  /** 진행 중 회의에만 의미가 있다. 종료된 회의는 참고용이다. */
  paused: boolean
  /** 일시정지 구간을 제외한 누적 활성 시간(초). 회의 화면 타이머와 같은 값이다. */
  activeSeconds: number
}

export type OngoingMeetingSummary = {
  meetingId: string
  meetingTitle: string
  /**
   * 일시정지를 제외한 누적 활성 시간(초). 회의 화면 타이머와 같은 값이다.
   * 회의를 연 시각부터의 벽시계 경과를 쓰면 일시정지를 반영할 수 없어 두 화면이 어긋난다.
   */
  activeSeconds: number
  paused: boolean
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
    /** 진행자가 등록한 프로필 이미지. 없으면 avatarKey 기본 이미지를 씁니다. */
    profileImageUrl?: string | null
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

export type AiSummaryJobResult = {
  jobId: string
  status: string
  failedPersonalSummaryCount: number
  modelName: string
  promptVersion: string
  errorMessage: string | null
  completedAt: string | null
}

export type MeetingDiscussionSection = {
  title: string
  details: string[]
}

export type OverallMeetingSummaryResult = {
  meetingId: number
  title: string
  version: number
  oneLineSummary: string
  keyTopics: string[]
  discussionSections: MeetingDiscussionSection[]
  decisions: string[]
  tentativeDirections: string[]
  confirmationItems: string[]
  generatedAt: string
}

export type PersonalMeetingSummaryResult = {
  meetingId: number
  userId: number
  version: number
  role: string
  personalSummary: string
  keyPoints: string[]
  myActionItems: string[]
  followUpQuestions: string[]
  generatedAt: string
}
