import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../apiError'
import { meetingService } from './meeting.service'

const axiosMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
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

describe('meetingService', () => {
  beforeEach(() => {
    axiosMocks.get.mockReset()
    axiosMocks.post.mockReset()
    axiosMocks.patch.mockReset()
    axiosMocks.delete.mockReset()
  })

  it('회의 입장 응답의 봉투를 벗긴다', async () => {
    const joinResult = {
      meetingId: 7,
      title: '스프린트 회의',
      status: 'IN_PROGRESS',
      role: 'HOST',
      joinedAt: '2026-08-11T05:00:00Z',
      startedAt: '2026-08-11T04:50:00Z',
      wsUrl: 'wss://api.example.com/ws/meetings/7/stt',
    }
    axiosMocks.post.mockResolvedValue(mockEnvelope(joinResult))

    await expect(meetingService.joinMeeting(7)).resolves.toEqual(joinResult)
    expect(axiosMocks.post).toHaveBeenCalledWith('/meetings/7/join')
  })

  it('삭제는 본문이 없어도 성공으로 다룬다', async () => {
    axiosMocks.delete.mockResolvedValue({ status: 204, data: '' })

    await expect(meetingService.deleteMeeting(7)).resolves.toBeUndefined()
    expect(axiosMocks.delete).toHaveBeenCalledWith('/meetings/7')
  })

  // 인터셉터 기본 문구가 그대로 나가면 어떤 동작이 실패했는지 화면에서 알 수 없다.
  it('서버가 사유를 주지 않으면 동작별 문구로 바꿔 던진다', async () => {
    axiosMocks.post.mockRejectedValue(
      new ApiError(500, 'UNKNOWN_ERROR', '요청을 처리하지 못했습니다.'),
    )
    axiosMocks.delete.mockRejectedValue(
      new ApiError(500, 'UNKNOWN_ERROR', '요청을 처리하지 못했습니다.'),
    )

    await expect(meetingService.joinMeeting(7)).rejects.toThrow('회의에 입장하지 못했습니다.')
    await expect(meetingService.deleteMeeting(7)).rejects.toThrow('회의를 삭제하지 못했습니다.')
  })

  it('서버가 준 실패 사유는 그대로 올라온다', async () => {
    axiosMocks.post.mockRejectedValue(new ApiError(409, 'MEETING4091', '이미 종료된 회의입니다.'))

    await expect(meetingService.endMeeting(7)).rejects.toThrow('이미 종료된 회의입니다.')
  })
})
