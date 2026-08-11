import { beforeEach, describe, expect, it } from 'vitest'

import { resetLiveMeetingMockDb } from '../db/liveMeeting.mockDb'
import { liveMeetingSnapshotMockGateway } from './liveMeeting.mock'

describe('live meeting 스냅샷 Mock', () => {
  beforeEach(() => {
    resetLiveMeetingMockDb()
  })

  // 전사·힌트·AI Chat은 실제 API로 옮겼다. 이 mock에는 참여자 목록만 의미가 있다.
  it('회의 메타데이터만 주고 진행 상태는 담지 않는다', async () => {
    const snapshot = await liveMeetingSnapshotMockGateway.getSnapshot('1')

    expect(snapshot.projectTitle).toBeTruthy()
    expect(snapshot).not.toHaveProperty('aiChat')
    expect(snapshot).not.toHaveProperty('elapsedSeconds')
    expect(snapshot).not.toHaveProperty('recordingState')
  })

  it('회의를 찾을 수 없으면 404를 던진다', async () => {
    await expect(liveMeetingSnapshotMockGateway.getSnapshot('없는-회의')).rejects.toMatchObject({
      status: 404,
      code: 'MEETING_NOT_FOUND',
    })
  })
})
