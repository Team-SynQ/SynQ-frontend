import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../apiError'
import { hintService } from './hint.service'

const axiosMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('../axiosInstance', () => ({
  axiosInstance: axiosMocks,
}))

function mockEnvelope(result: unknown) {
  return {
    status: 200,
    data: { isSuccess: true, code: 'COMMON200', message: 'success', result },
  }
}

describe('hintService', () => {
  beforeEach(() => {
    axiosMocks.get.mockReset()
    axiosMocks.post.mockReset()
  })

  it('전사 세그먼트 경로로 힌트를 생성한다', async () => {
    const hint = { meaning: '의미', myImpact: '영향', teamQuestion: '질문' }
    axiosMocks.post.mockResolvedValue(mockEnvelope(hint))

    await expect(hintService.createSegmentHint(7, 12)).resolves.toEqual(hint)
    expect(axiosMocks.post).toHaveBeenCalledWith('/meetings/7/segments/12/hints')
  })

  it('내 힌트 기록을 조회한다', async () => {
    const result = { meetingId: 7, hints: [] }
    axiosMocks.get.mockResolvedValue(mockEnvelope(result))

    await expect(hintService.listHintRecords(7)).resolves.toEqual(result)
    expect(axiosMocks.get).toHaveBeenCalledWith('/meetings/7/hints')
  })

  it('서버가 사유를 주지 않으면 힌트 문구로 바꿔 던진다', async () => {
    axiosMocks.post.mockRejectedValue(
      new ApiError(500, 'UNKNOWN_ERROR', '요청을 처리하지 못했습니다.'),
    )

    await expect(hintService.createSegmentHint(7, 12)).rejects.toThrow(
      'SynQ 힌트를 불러오지 못했습니다.',
    )
  })
})
