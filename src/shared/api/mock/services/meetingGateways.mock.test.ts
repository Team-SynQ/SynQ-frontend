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

  // 실제 전사 id는 mock 힌트 목록에 없다. 힌트 API가 붙기 전까지 화면이 비지 않아야 한다.
  it('알 수 없는 전사 id에도 요청한 id로 대표 힌트를 돌려준다', async () => {
    const hint = await liveMeetingAiMockGateway.getTranscriptHint({
      meetingId: '1',
      transcriptId: '4821',
    })

    expect(hint.transcriptId).toBe('4821')
    expect(hint.meaning).toBeTruthy()
  })

  it('실패 시나리오에서는 먼저 실패하고 재시도에서 힌트를 준다', async () => {
    await expect(
      liveMeetingAiMockGateway.getTranscriptHint({ meetingId: '2', transcriptId: '4821' }),
    ).rejects.toMatchObject({ code: 'TRANSCRIPT_HINT_LOAD_FAILED' })

    await expect(
      liveMeetingAiMockGateway.getTranscriptHint({ meetingId: '2', transcriptId: '4821' }),
    ).resolves.toMatchObject({ transcriptId: '4821' })
  })
})
