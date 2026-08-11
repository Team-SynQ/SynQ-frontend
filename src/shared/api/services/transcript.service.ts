import { axiosInstance } from '../axiosInstance'
import type { ApiResponse } from '../contracts/api.contracts'
import type {
  ListTranscriptSegmentsResult,
  UpdateTranscriptSegmentResult,
} from '../contracts/transcript.contracts'
import { unwrapApiResult } from '../unwrapApiResult'

export const transcriptService = {
  /**
   * afterSequenceIndex를 주면 그보다 큰 sequenceIndex만 돌려준다.
   * 처음 로드는 파라미터 없이, 재연결 후 놓친 구간 보충은 마지막으로 받은 값을 넣어 호출한다.
   */
  listSegments: async (
    meetingId: number,
    afterSequenceIndex?: number | null,
  ): Promise<ListTranscriptSegmentsResult> => {
    const response = await axiosInstance.get<ApiResponse<ListTranscriptSegmentsResult>>(
      `/meetings/${meetingId}/transcript-segments`,
      {
        // 0도 유효한 값이라 null·undefined일 때만 파라미터를 뺀다.
        params:
          afterSequenceIndex === undefined || afterSequenceIndex === null
            ? undefined
            : { afterSequenceIndex },
      },
    )
    return unwrapApiResult(response, '전사 세그먼트를 불러오지 못했습니다.')
  },

  updateSegment: async (
    meetingId: number,
    segmentId: number,
    content: string,
  ): Promise<UpdateTranscriptSegmentResult> => {
    const response = await axiosInstance.patch<ApiResponse<UpdateTranscriptSegmentResult>>(
      `/meetings/${meetingId}/transcript-segments/${segmentId}`,
      { content },
    )
    return unwrapApiResult(response, '전사 내용을 수정하지 못했습니다.')
  },
}
