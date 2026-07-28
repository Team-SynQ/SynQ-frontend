import type { MeetingDetailResponse } from '../../contracts/meeting.contracts'

export const MOCK_MEETING_DETAIL: MeetingDetailResponse = {
  recordId: 'record-1',
  meetingId: 'meeting-1',
  projectId: 'proj-1',
  projectTitle: '회의 보조 AI, 씽큐',
  meetingTitle: '회의 기록',
  durationSeconds: 2700,
  completedAt: '2026-05-11T10:00:00Z',
  host: {
    id: 'user-1',
    name: '박서은',
    avatarKey: 'pm',
  },
  overview: '온보딩 개선 및 QA 계획, 출시 일정 논의',
  keywords: ['온보딩', 'QA', '베타 출시', '일정 조정'],
  decisions: [
    '온보딩 개선을 이번 분기 최우선 과제로 확정',
    '4월 말 베타, 5월 초 정식 출시 일정 유지',
  ],
  roleTag: 'PM',
  perspectiveTag: '일정, 범위, 의사결정 영향 중심',
  round: '4차 대면 회의',
  personalSummary: {
    roleBadge: 'PM',
    roleSummary:
      '이번 회의에서는 온보딩 개선을 이번 분기의 핵심 과제로 확정하고, 개발 일정과 리소스 배분, QA 계획, 베타 출시 범위를 중심으로 논의했습니다. 프로젝트는 예정된 일정 내 출시를 목표로 하지만 QA 기간과 기능 범위에 대한 추가 조율이 필요하며, PM은 우선순위와 일정 관리를 중심으로 후속 의사결정을 진행해야 합니다.',
    impacts: [
      '온보딩 개선을 이번 분기 최우선 과제로 확정했습니다.',
      '4월 말 베타, 5월 초 정식 출시 일정을 유지하기로 했습니다.',
      'QA 리소스 부족 가능성이 있어 기능 범위를 일부 조정하는 방안을 검토하기로 했습니다.',
      '디자인 완료 일정과 개발 착수 일정을 다음 스프린트 계획에 반영해야 합니다.',
      '결제 모듈 개발 일정과 일부 인력이 겹쳐 일정 충돌 가능성이 확인되었습니다.',
    ],
    actionItems: [
      '온보딩 개선 기능 우선순위 최종 확정',
      '베타 버전 포함 기능(Scope) 확정',
      'QA 인력 확보 여부 확인',
      '개발 일정과 QA 일정 재조정',
    ],
    questions: [
      '온보딩 개선의 완료 기준은 무엇으로 정의하나요?',
      'QA 기간은 최소 얼마나 확보할 수 있나요?',
      '베타 버전에서 제외 가능한 기능은 무엇인가요?',
      '결제 모듈 개발 일정과 온보딩 일정 충돌은 어떻게 조정할 계획인가요?',
      '출시 일정 변경 여부는 언제 최종 결정하나요?',
    ],
  },
}
