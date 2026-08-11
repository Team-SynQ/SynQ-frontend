import type { LiveMeetingResponse } from '../../contracts/meeting.contracts'

export const liveMeetingFixture = {
  meetingId: 'demo',
  projectId: '1',
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
} as const satisfies LiveMeetingResponse

export const completedMeetingSummaryFixture = {
  overview: '온보딩 개선 우선순위와 완료 기준을 중심으로 논의',
  keywords: ['온보딩 플로우', '일정 재조율', '역할 분담'],
  decisions: [
    '온보딩 개선을 이번 분기 우선순위로 확정',
    '완료 기준과 담당 범위를 다음 회의 전 정리',
    'QA는 기능 안정화 이후 진행',
  ],
} as const
