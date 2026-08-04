import type { MeetingDetailResponse, MeetingAvatarKey } from '../../contracts/meeting.contracts'
import { liveMeetingMockDb } from '../db/liveMeeting.mockDb'
import { MockApiError, waitForMockApi } from '../lib/mockApi'

const mockMeetingDetailTemplate: MeetingDetailResponse = {
  recordId: 'record-1',
  meetingId: 'meeting-1',
  projectId: 'proj-1',
  projectTitle: '회의 보조 AI, 씽큐',
  meetingTitle: '신규 온보딩 개선 및 출시 일정 논의',
  host: {
    id: 'm-1',
    name: '윤금서',
    avatarKey: 'default' as MeetingAvatarKey,
  },
  roleTag: 'PM',
  perspectiveTag: '일정, 범위, 의사결정 영향 중심',
  round: '4차 대면 회의',
  completedAt: '2026-05-11T14:00:00Z',
  durationSeconds: 2700,

  overview:
    '온보딩 개선을 이번 분기 핵심 과제로 확정하고, 출시 일정과 QA 리소스 확보 방안을 중심으로 논의했습니다.',
  keywords: [
    'MVP 기능 설계',
    '일정 재조율',
    '역할 재배분',
    'QA 리소스 확보',
    '온보딩 개선',
    '사용자 이탈률',
  ],
  decisions: [
    '온보딩 개선을 이번 분기 최우선 개발 과제로 진행한다.',
    '4월 말 베타, 5월 초 정식 출시를 목표 일정으로 유지한다.',
    '핵심 사용자 경험 개선 기능부터 우선 개발한다.',
    '다음 스프린트 계획에 온보딩 개선 일정을 반영한다.',
  ],

  personalSummary: {
    roleBadge: 'PM',
    roleSummary:
      '신규 사용자 이탈률 개선을 위한 온보딩 개편 우선순위를 설정하고, 4월 말 베타 및 5월 초 정식 출시 일정을 확정해야 합니다. QA 기간 확보를 위한 기능 범위 조정이 필요합니다.',
    impacts: [
      '온보딩 개편에 따른 프로젝트 전체 일정 및 스프린트 계획 재조정 필요',
      'QA 인력 및 리소스 추가 확보 필요성 검토',
    ],
    actionItems: [
      'QA 추가 인력 확보 가능 여부 확인',
      '디자인 완료 일정에 맞춘 개발 착수 일정 확정',
    ],
    questions: [
      'QA 기간을 최소 2주 확보하기 위해 축소할 수 있는 기능 범위는 무엇인가요?',
      '결제 모듈 개발과 온보딩 개편의 우선순위를 어떻게 설정할 것인가요?',
    ],
  },
}

const fallbackTitleOverrides = new Map<string, string>()

export async function fetchMeetingDetail(meetingRecordId: string): Promise<MeetingDetailResponse> {
  await waitForMockApi()
  if (liveMeetingMockDb.isCompletedMeetingDeleted(meetingRecordId)) {
    throw new MockApiError(404, 'MEETING_RECORD_NOT_FOUND', '회의 기록을 찾을 수 없습니다.')
  }

  const completedMeeting = liveMeetingMockDb.getCompletedMeeting(meetingRecordId)
  if (completedMeeting) {
    return {
      ...structuredClone(mockMeetingDetailTemplate),
      ...completedMeeting,
    }
  }

  return {
    ...structuredClone(mockMeetingDetailTemplate),
    recordId: meetingRecordId,
    meetingTitle:
      fallbackTitleOverrides.get(meetingRecordId) ?? mockMeetingDetailTemplate.meetingTitle,
  }
}

export async function updateMeetingTitle(
  meetingRecordId: string,
  newTitle: string,
): Promise<boolean> {
  await waitForMockApi()
  if (liveMeetingMockDb.isCompletedMeetingDeleted(meetingRecordId)) {
    throw new MockApiError(404, 'MEETING_RECORD_NOT_FOUND', '회의 기록을 찾을 수 없습니다.')
  }

  const normalizedTitle = newTitle.trim()
  if (!normalizedTitle || normalizedTitle.length > 50) {
    throw new MockApiError(400, 'INVALID_MEETING_TITLE', '회의 제목을 확인해 주세요.')
  }

  const updated = liveMeetingMockDb.updateCompletedMeetingTitle(meetingRecordId, normalizedTitle)
  if (!updated) {
    fallbackTitleOverrides.set(meetingRecordId, normalizedTitle)
  }
  return true
}
