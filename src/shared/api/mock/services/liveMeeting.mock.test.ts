import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resetLiveMeetingMockDb } from '../db/liveMeeting.mockDb'
import { liveMeetingAiMockGateway, liveMeetingMockService } from './liveMeeting.mock'

describe('liveMeetingMockService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetLiveMeetingMockDb()
  })

  it('loads a cloned meeting scenario with transcripts sorted by time and sequence', async () => {
    const first = await liveMeetingMockService.joinMeeting('demo')
    first.transcript.segments[0]!.text = 'mutated outside'

    const second = await liveMeetingMockService.joinMeeting('demo')

    expect(second.transcript.segments.map((segment) => segment.id)).toEqual(['segment-1'])
    expect(second.transcript.segments[0]!.text).toContain('지난주 유저 인터뷰 결과')
  })

  it('commits a successful transcript edit to the mock database', async () => {
    const edited = await liveMeetingMockService.updateTranscript({
      meetingId: 'demo',
      segmentId: 'segment-1',
      text: '수정된 전사 문장',
    })

    expect(edited).toMatchObject({
      text: '수정된 전사 문장',
      isEdited: true,
    })
    expect(edited.editedAt).toEqual(expect.any(String))
    await expect(liveMeetingMockService.listTranscripts('demo')).resolves.toEqual([
      expect.objectContaining({
        text: '수정된 전사 문장',
        isEdited: true,
      }),
    ])
  })

  it('keeps committed text when an edit scenario fails', async () => {
    await expect(
      liveMeetingMockService.updateTranscript({
        meetingId: 'demo-edit-error',
        segmentId: 'segment-1',
        text: '실패한 전사 문장',
      }),
    ).rejects.toMatchObject({
      code: 'TRANSCRIPT_UPDATE_FAILED',
    })

    await expect(liveMeetingMockService.listTranscripts('demo-edit-error')).resolves.toEqual([
      expect.objectContaining({
        text: expect.stringContaining('지난주 유저 인터뷰 결과'),
        isEdited: false,
      }),
    ])
  })

  it('fails the first hint request and succeeds when retried', async () => {
    await expect(
      liveMeetingAiMockGateway.getTranscriptHint({
        meetingId: 'demo-hint-error',
        transcriptId: 'segment-1',
      }),
    ).rejects.toMatchObject({
      code: 'TRANSCRIPT_HINT_LOAD_FAILED',
    })

    await expect(
      liveMeetingAiMockGateway.getTranscriptHint({
        meetingId: 'demo-hint-error',
        transcriptId: 'segment-1',
      }),
    ).resolves.toMatchObject({
      transcriptId: 'segment-1',
      meaning: expect.any(String),
      personalImpact: expect.any(String),
      teamQuestion: expect.any(String),
    })
  })

  it('returns an AI response with the supplied transcript snapshot', async () => {
    const response = await liveMeetingAiMockGateway.sendMeetingAiQuestion({
      meetingId: 'demo',
      question: '이 내용이 왜 중요해?',
      context: {
        transcriptId: 'segment-1',
        text: '질문 시점 문장',
      },
    })

    expect(response).toMatchObject({
      role: 'assistant',
      context: {
        transcriptId: 'segment-1',
        text: '질문 시점 문장',
      },
    })

    const rejoinedMeeting = await liveMeetingMockService.joinMeeting('demo')
    expect(rejoinedMeeting.aiChat.messages.slice(-2)).toEqual([
      expect.objectContaining({
        role: 'user',
        context: response.context,
      }),
      expect.objectContaining({
        role: 'assistant',
        context: response.context,
      }),
    ])
  })

  it('creates unique message IDs for questions handled in the same millisecond', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)

    await liveMeetingAiMockGateway.sendMeetingAiQuestion({
      meetingId: 'demo',
      question: '첫 번째 질문',
      context: null,
    })
    await liveMeetingAiMockGateway.sendMeetingAiQuestion({
      meetingId: 'demo',
      question: '두 번째 질문',
      context: null,
    })

    const meeting = await liveMeetingMockService.joinMeeting('demo')
    const generatedIds = meeting.aiChat.messages.slice(-4).map((message) => message.id)
    expect(new Set(generatedIds).size).toBe(4)
  })

  it('stores completed meetings newest first with unique record IDs', async () => {
    const first = await liveMeetingMockService.completeMeeting({
      meetingId: 'demo',
      projectId: 'project-1',
      projectTitle: '서비스 디자인',
      meetingTitle: '첫 번째 회의',
      durationSeconds: 3723,
      completedAt: '2026-07-27T01:00:00.000Z',
      host: {
        id: 'you',
        name: '오금동',
        avatarKey: 'you',
      },
    })
    const second = await liveMeetingMockService.completeMeeting({
      meetingId: 'demo',
      projectId: 'project-1',
      projectTitle: '서비스 디자인',
      meetingTitle: '두 번째 회의',
      durationSeconds: 3800,
      completedAt: '2026-07-27T02:00:00.000Z',
      host: {
        id: 'you',
        name: '오금동',
        avatarKey: 'you',
      },
    })

    expect(first.recordId).not.toBe(second.recordId)
    await expect(liveMeetingMockService.listCompletedMeetings('project-1')).resolves.toEqual([
      expect.objectContaining({ meetingTitle: '두 번째 회의' }),
      expect.objectContaining({ meetingTitle: '첫 번째 회의' }),
    ])
  })

  it('isolates completed meetings by project', async () => {
    const baseRequest = {
      meetingId: 'demo',
      projectTitle: '서비스 디자인',
      meetingTitle: '프로젝트 회의',
      durationSeconds: 600,
      completedAt: '2026-07-27T03:00:00.000Z',
      host: {
        id: 'you',
        name: '오금동',
        avatarKey: 'you' as const,
      },
    }

    await liveMeetingMockService.completeMeeting({
      ...baseRequest,
      projectId: 'project-1',
    })
    await liveMeetingMockService.completeMeeting({
      ...baseRequest,
      projectId: 'project-2',
    })

    await expect(liveMeetingMockService.listCompletedMeetings('project-1')).resolves.toEqual([
      expect.objectContaining({ projectId: 'project-1' }),
    ])
    await expect(liveMeetingMockService.listCompletedMeetings('project-2')).resolves.toEqual([
      expect.objectContaining({ projectId: 'project-2' }),
    ])
  })

  it('fails completion for the save error scenario', async () => {
    await expect(
      liveMeetingMockService.completeMeeting({
        meetingId: 'demo-save-error',
        projectId: 'project-1',
        projectTitle: '서비스 디자인',
        meetingTitle: '저장 실패 회의',
        durationSeconds: 600,
        completedAt: '2026-07-27T03:00:00.000Z',
        host: {
          id: 'you',
          name: '오금동',
          avatarKey: 'you',
        },
      }),
    ).rejects.toMatchObject({
      code: 'MEETING_COMPLETE_FAILED',
    })
  })
})
