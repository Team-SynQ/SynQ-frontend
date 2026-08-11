import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../apiError'
import { transcriptService } from './transcript.service'

const axiosMocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
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

const listResult = {
  meetingId: 7,
  segments: [
    {
      segmentId: 1,
      sequenceIndex: 0,
      startMs: 1000,
      endMs: 2000,
      content: '안녕하세요',
      speakerLabel: null,
      isModified: false,
    },
  ],
}

describe('transcriptService', () => {
  beforeEach(() => {
    axiosMocks.get.mockReset()
    axiosMocks.patch.mockReset()
  })

  it('세그먼트 목록을 조회하고 봉투에서 result만 꺼낸다', async () => {
    axiosMocks.get.mockResolvedValue(mockEnvelope(listResult))

    const result = await transcriptService.listSegments(7)

    expect(result).toEqual(listResult)
    expect(axiosMocks.get).toHaveBeenCalledWith('/meetings/7/transcript-segments', {
      params: undefined,
    })
  })

  it('afterSequenceIndex를 주면 증분 조회 파라미터를 붙인다', async () => {
    axiosMocks.get.mockResolvedValue(mockEnvelope(listResult))

    await transcriptService.listSegments(7, 12)

    expect(axiosMocks.get).toHaveBeenCalledWith('/meetings/7/transcript-segments', {
      params: { afterSequenceIndex: 12 },
    })
  })

  it('afterSequenceIndex가 0이어도 파라미터를 붙인다', async () => {
    axiosMocks.get.mockResolvedValue(mockEnvelope(listResult))

    await transcriptService.listSegments(7, 0)

    expect(axiosMocks.get).toHaveBeenCalledWith('/meetings/7/transcript-segments', {
      params: { afterSequenceIndex: 0 },
    })
  })

  it('세그먼트를 PATCH로 수정한다', async () => {
    const updated = {
      segmentId: 3,
      meetingId: 7,
      content: '수정된 텍스트',
      isModified: true,
      updatedAt: '2026-08-10T05:00:00Z',
    }
    axiosMocks.patch.mockResolvedValue(mockEnvelope(updated))

    const result = await transcriptService.updateSegment(7, 3, '수정된 텍스트')

    expect(result).toEqual(updated)
    expect(axiosMocks.patch).toHaveBeenCalledWith('/meetings/7/transcript-segments/3', {
      content: '수정된 텍스트',
    })
  })

  it('서버가 준 실패 사유는 그대로 올라온다', async () => {
    axiosMocks.get.mockRejectedValue(new ApiError(500, 'COMMON500', '서버 오류입니다.'))

    await expect(transcriptService.listSegments(7)).rejects.toThrow('서버 오류입니다.')
  })

  it('네트워크 오류 문구는 도메인 문구로 덮지 않는다', async () => {
    axiosMocks.get.mockRejectedValue(
      new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.'),
    )

    await expect(transcriptService.listSegments(7)).rejects.toThrow(
      '네트워크 연결을 확인해 주세요.',
    )
  })

  it('서버가 사유를 주지 않은 HTTP 실패는 도메인 문구로 바꿔 던진다', async () => {
    axiosMocks.get.mockRejectedValue(
      new ApiError(500, 'UNKNOWN_ERROR', '요청을 처리하지 못했습니다.'),
    )

    await expect(transcriptService.listSegments(7)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: '전사 세그먼트를 불러오지 못했습니다.',
    })
  })

  it('isSuccess가 false면 서버 메시지로 ApiError를 던진다', async () => {
    axiosMocks.get.mockResolvedValue({
      status: 200,
      data: {
        isSuccess: false,
        code: 'MEETING4041',
        message: '회의를 찾을 수 없습니다.',
        result: null,
      },
    })

    await expect(transcriptService.listSegments(7)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'MEETING4041',
      message: '회의를 찾을 수 없습니다.',
    })
  })

  it('서버가 메시지를 주지 않으면 호출부의 실패 문구를 쓴다', async () => {
    axiosMocks.get.mockResolvedValue({
      status: 200,
      data: { isSuccess: false, code: '', message: '', result: null },
    })

    await expect(transcriptService.listSegments(7)).rejects.toThrow(
      '전사 세그먼트를 불러오지 못했습니다.',
    )
  })
})
