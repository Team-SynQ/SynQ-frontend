import type {
  ListTranscriptSegmentsResult,
  UpdateTranscriptSegmentResult,
} from '../contracts/transcript.contracts'
import { API_BASE_URL, createAuthHeaders, readApiResult } from '../lib/apiClient'

export const transcriptService = {
  /**
   * afterSequenceIndex를 주면 그보다 큰 sequenceIndex만 돌려준다.
   * 처음 로드는 파라미터 없이, 재연결 후 놓친 구간 보충은 마지막으로 받은 값을 넣어 호출한다.
   */
  listSegments: async (
    meetingId: number,
    afterSequenceIndex?: number | null,
  ): Promise<ListTranscriptSegmentsResult> => {
    const query =
      afterSequenceIndex === undefined || afterSequenceIndex === null
        ? ''
        : `?afterSequenceIndex=${afterSequenceIndex}`
    const response = await fetch(
      `${API_BASE_URL}/meetings/${meetingId}/transcript-segments${query}`,
      {
        method: 'GET',
        headers: createAuthHeaders(),
      },
    )
    return readApiResult<ListTranscriptSegmentsResult>(
      response,
      '전사 세그먼트를 불러오지 못했습니다.',
    )
  },

  updateSegment: async (
    meetingId: number,
    segmentId: number,
    content: string,
  ): Promise<UpdateTranscriptSegmentResult> => {
    const response = await fetch(
      `${API_BASE_URL}/meetings/${meetingId}/transcript-segments/${segmentId}`,
      {
        method: 'PATCH',
        headers: createAuthHeaders(),
        body: JSON.stringify({ content }),
      },
    )
    return readApiResult<UpdateTranscriptSegmentResult>(
      response,
      '전사 내용을 수정하지 못했습니다.',
    )
  },
}
