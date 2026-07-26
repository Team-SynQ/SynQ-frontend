import type { LiveMeetingResponse, TranscriptHintResponse } from '../../contracts/meeting.contracts'

export const liveMeetingFixture = {
  meetingId: 'demo',
  projectTitle: '서비스디자인',
  meetingTitle: '2차 대면회의',
  elapsedSeconds: 373,
  recordingState: 'recording',
  participants: [
    {
      id: 'you',
      name: '윤금서',
      role: 'Design',
      avatarKey: 'you',
      isCurrentUser: true,
      isHost: true,
      isMicrophoneOn: true,
    },
    {
      id: 'design',
      name: '이동희',
      role: 'Design',
      avatarKey: 'design',
      isCurrentUser: false,
      isHost: false,
      isMicrophoneOn: false,
    },
    {
      id: 'pm',
      name: '이소미',
      role: 'PM',
      avatarKey: 'pm',
      isCurrentUser: false,
      isHost: false,
      isMicrophoneOn: false,
    },
    {
      id: 'server',
      name: '김도진',
      role: 'Server',
      avatarKey: 'server',
      isCurrentUser: false,
      isHost: false,
      isMicrophoneOn: false,
    },
  ],
  transcript: {
    status: 'active',
    isSpeaking: true,
    segments: [
      {
        id: 'segment-1',
        sequenceIndex: 1,
        startedAtSeconds: 284,
        text: '네, 지난주 유저 인터뷰 결과를 토대로 봤을 때, 제품 측면에서는 온보딩 플로우 개선이 가장 큰 임팩트를 줄 수 있을 것 같습니다. 사용자들이 앱에 처음 들어왔을 때 핵심 기능을 파악하기 전에 헤매는 구간이 너무 길어요.',
        isEdited: false,
        editedAt: null,
      },
    ],
  },
  aiChat: {
    messages: [
      {
        id: 'assistant-welcome',
        role: 'assistant',
        content:
          '회의가 시작되었습니다. 프로젝트 자료와 지난 회의 맥락을 바탕으로 언제든 답변해 드립니다.',
        context: null,
      },
    ],
    suggestions: [
      {
        id: 'previous-scope',
        label: '지난 회의에서는 이 범위 어디까지 정했어?',
      },
      {
        id: 'my-role',
        label: '오늘 내가 맡은 부분은?',
      },
    ],
  },
} as const satisfies LiveMeetingResponse

export const liveMeetingHintFixture = {
  'segment-1': {
    transcriptId: 'segment-1',
    notice: null,
    meaning: '온보딩 개선이 이번 분기 핵심 우선순위라는 뜻입니다.',
    personalImpact: '일정과 리소스 배분에 영향이 있을 수 있습니다.',
    teamQuestion: '온보딩 개선의 완료 기준은 무엇인가요?',
  },
} as const satisfies Record<string, TranscriptHintResponse>

export const liveMeetingAiAnswerFixture =
  '선택한 전사와 프로젝트 맥락을 기준으로 보면, 온보딩 개선의 우선순위와 완료 기준을 먼저 합의하는 것이 좋습니다.'
