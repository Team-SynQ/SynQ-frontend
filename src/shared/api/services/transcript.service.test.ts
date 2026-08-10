import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { transcriptService } from './transcript.service'

function mockJsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  } as Response
}

const listBody = {
  isSuccess: true,
  code: 'COMMON200',
  message: 'success',
  result: {
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
  },
}

describe('transcriptService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('세그먼트 목록을 조회하고 봉투에서 result만 꺼낸다', async () => {
    localStorage.setItem('accessToken', 'test-token')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(listBody))

    const result = await transcriptService.listSegments(7)

    expect(result).toEqual(listBody.result)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(String(url)).toContain('/meetings/7/transcript-segments')
    expect(init?.method).toBe('GET')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer test-token')
  })

  it('afterSequenceIndex를 주면 증분 조회 쿼리를 붙인다', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(listBody))

    await transcriptService.listSegments(7, 12)

    expect(String(fetchSpy.mock.calls[0][0])).toContain(
      '/meetings/7/transcript-segments?afterSequenceIndex=12',
    )
  })

  it('afterSequenceIndex가 0이어도 쿼리를 붙인다', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(listBody))

    await transcriptService.listSegments(7, 0)

    expect(String(fetchSpy.mock.calls[0][0])).toContain('afterSequenceIndex=0')
  })

  it('afterSequenceIndex가 없으면 전체를 조회한다', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(listBody))

    await transcriptService.listSegments(7)

    expect(String(fetchSpy.mock.calls[0][0])).not.toContain('afterSequenceIndex')
  })

  it('토큰이 없으면 Authorization 헤더를 붙이지 않는다', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(listBody))

    await transcriptService.listSegments(7)

    const [, init] = fetchSpy.mock.calls[0]
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('세그먼트를 PATCH로 수정한다', async () => {
    const updated = {
      isSuccess: true,
      code: 'COMMON200',
      message: 'success',
      result: {
        segmentId: 3,
        meetingId: 7,
        content: '수정된 텍스트',
        isModified: true,
        updatedAt: '2026-08-10T05:00:00Z',
      },
    }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse(updated))

    const result = await transcriptService.updateSegment(7, 3, '수정된 텍스트')

    expect(result).toEqual(updated.result)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(String(url)).toContain('/meetings/7/transcript-segments/3')
    expect(init?.method).toBe('PATCH')
    expect(init?.body).toBe(JSON.stringify({ content: '수정된 텍스트' }))
  })

  it('HTTP 실패면 예외를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse({}, false))

    await expect(transcriptService.listSegments(7)).rejects.toThrow(
      '전사 세그먼트를 불러오지 못했습니다.',
    )
  })

  it('isSuccess가 false면 서버 메시지로 예외를 던진다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse({
        isSuccess: false,
        code: 'MEETING4041',
        message: '회의를 찾을 수 없습니다.',
        result: null,
      }),
    )

    await expect(transcriptService.listSegments(7)).rejects.toThrow('회의를 찾을 수 없습니다.')
  })
})
