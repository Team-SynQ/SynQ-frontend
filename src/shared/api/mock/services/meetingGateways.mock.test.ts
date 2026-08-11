import { beforeEach, describe, expect, it } from 'vitest'

import { resetLiveMeetingMockDb } from '../db/liveMeeting.mockDb'
import { liveMeetingAiMockGateway, liveMeetingSnapshotMockGateway } from './liveMeeting.mock'

describe('live meeting Mock gateways', () => {
  beforeEach(() => {
    resetLiveMeetingMockDb()
  })

  it('returns screen data separately from lifecycle state', async () => {
    const snapshot = await liveMeetingSnapshotMockGateway.getSnapshot('1')

    expect(snapshot).toHaveProperty('participants')
    expect(snapshot).toHaveProperty('aiChat')
    expect(snapshot).not.toHaveProperty('elapsedSeconds')
    expect(snapshot).not.toHaveProperty('recordingState')
  })

  it('회의를 찾을 수 없으면 스냅샷은 404를 던진다', async () => {
    await expect(liveMeetingSnapshotMockGateway.getSnapshot('없는-회의')).rejects.toMatchObject({
      status: 404,
      code: 'MEETING_NOT_FOUND',
    })
  })

  it('AI 질문에 답변을 돌려주고 대화에 남긴다', async () => {
    const answer = await liveMeetingAiMockGateway.sendMeetingAiQuestion({
      meetingId: '1',
      question: '이번 결정의 기준은 무엇인가요?',
      context: null,
    })

    expect(answer.role).toBe('assistant')
    expect(answer.content).toBeTruthy()
  })

  it('빈 질문은 거절한다', async () => {
    await expect(
      liveMeetingAiMockGateway.sendMeetingAiQuestion({
        meetingId: '1',
        question: '   ',
        context: null,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_AI_QUESTION' })
  })
})
