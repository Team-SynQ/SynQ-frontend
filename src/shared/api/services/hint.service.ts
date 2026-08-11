import { requestApiResult } from '../apiRequest'
import { axiosInstance } from '../axiosInstance'
import type { ApiResponse } from '../contracts/api.contracts'
import type { HintDto, ListHintRecordsResult } from '../contracts/hint.contracts'

export const hintService = {
  /** 전사 하나에 대한 3-hint를 생성한다. 사용자가 전사를 선택할 때 호출한다. */
  createSegmentHint: (meetingId: number, segmentId: number): Promise<HintDto> =>
    requestApiResult(
      axiosInstance.post<ApiResponse<HintDto>>(
        `/meetings/${meetingId}/segments/${segmentId}/hints`,
      ),
      'SynQ 힌트를 불러오지 못했습니다.',
    ),

  /** 이미 생성된 내 힌트 기록. 회의 입장 시 캐시를 채워 같은 전사를 다시 생성하지 않게 한다. */
  listHintRecords: (meetingId: number): Promise<ListHintRecordsResult> =>
    requestApiResult(
      axiosInstance.get<ApiResponse<ListHintRecordsResult>>(`/meetings/${meetingId}/hints`),
      'SynQ 힌트 기록을 불러오지 못했습니다.',
    ),
}
