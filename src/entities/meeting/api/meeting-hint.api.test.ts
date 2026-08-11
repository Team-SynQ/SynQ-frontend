import { beforeEach, describe, expect, it, vi } from 'vitest'

import { hintService } from '../../../shared/api/services/hint.service'
import { meetingHintApi } from './meeting-hint.api'

describe('meetingHintApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('생성 응답을 화면 타입으로 돌려준다', async () => {
    vi.spyOn(hintService, 'createSegmentHint').mockResolvedValue({
      meaning: '의미',
      myImpact: '영향',
      teamQuestion: '질문',
    })

    await expect(meetingHintApi.createSegmentHint(7, '12')).resolves.toEqual({
      transcriptId: '12',
      meaning: '의미',
      personalImpact: '영향',
      teamQuestion: '질문',
    })
    expect(hintService.createSegmentHint).toHaveBeenCalledWith(7, 12)
  })

  // 중간 인식 문장의 id는 'interim'이다. Number()가 NaN이 되어 URL에 실리면 안 된다.
  it('숫자가 아닌 전사 id는 요청을 보내지 않고 끊는다', async () => {
    const createSegmentHint = vi.spyOn(hintService, 'createSegmentHint')

    await expect(meetingHintApi.createSegmentHint(7, 'interim')).rejects.toThrow(
      '아직 저장되지 않은 전사입니다.',
    )
    expect(createSegmentHint).not.toHaveBeenCalled()
  })

  it('힌트 배열이 없는 응답도 빈 목록으로 다룬다', async () => {
    vi.spyOn(hintService, 'listHintRecords').mockResolvedValue({
      meetingId: 7,
    } as Awaited<ReturnType<typeof hintService.listHintRecords>>)

    await expect(meetingHintApi.listHintRecords(7)).resolves.toEqual([])
  })
})
