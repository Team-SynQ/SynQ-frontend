import { describe, expect, it } from 'vitest'

import type { TranscriptSegmentDto } from '../../../shared/api/contracts/transcript.contracts'
import { toTranscriptSegment, toTranscriptSegments } from './transcript.adapter'

function createDto(overrides: Partial<TranscriptSegmentDto> = {}): TranscriptSegmentDto {
  return {
    segmentId: 12,
    sequenceIndex: 3,
    startMs: 62300,
    endMs: 65100,
    content: '이번 스프린트 일정 어떻게 할까요?',
    speakerLabel: null,
    isModified: false,
    ...overrides,
  }
}

describe('toTranscriptSegment', () => {
  it('서버 DTO를 화면 세그먼트로 변환한다', () => {
    expect(toTranscriptSegment(createDto())).toEqual({
      id: '12',
      sequenceIndex: 3,
      startedAtSeconds: 62.3,
      text: '이번 스프린트 일정 어떻게 할까요?',
      isEdited: false,
      editedAt: null,
    })
  })

  it('숫자 segmentId를 문자열 id로 바꾼다', () => {
    expect(toTranscriptSegment(createDto({ segmentId: 1004 })).id).toBe('1004')
  })

  it('isModified를 isEdited로 옮긴다', () => {
    expect(toTranscriptSegment(createDto({ isModified: true })).isEdited).toBe(true)
  })

  it('화자 라벨이 있어도 화면 세그먼트에는 포함하지 않는다', () => {
    const segment = toTranscriptSegment(createDto({ speakerLabel: 'SPEAKER_1' }))

    expect(segment).not.toHaveProperty('speakerLabel')
  })

  it('목록 응답에는 수정 시각이 없으므로 editedAt은 null이다', () => {
    expect(toTranscriptSegment(createDto({ isModified: true })).editedAt).toBeNull()
  })
})

describe('toTranscriptSegments', () => {
  it('startMs 오름차순으로 정렬한다', () => {
    const segments = toTranscriptSegments([
      createDto({ segmentId: 2, startMs: 5000 }),
      createDto({ segmentId: 1, startMs: 1000 }),
      createDto({ segmentId: 3, startMs: 9000 }),
    ])

    expect(segments.map((segment) => segment.id)).toEqual(['1', '2', '3'])
  })

  it('startMs가 같으면 sequenceIndex로 순서를 정한다', () => {
    const segments = toTranscriptSegments([
      createDto({ segmentId: 2, startMs: 1000, sequenceIndex: 5 }),
      createDto({ segmentId: 1, startMs: 1000, sequenceIndex: 2 }),
    ])

    expect(segments.map((segment) => segment.id)).toEqual(['1', '2'])
  })

  it('입력 배열을 변형하지 않는다', () => {
    const dtos = [
      createDto({ segmentId: 2, startMs: 5000 }),
      createDto({ segmentId: 1, startMs: 1000 }),
    ]

    toTranscriptSegments(dtos)

    expect(dtos.map((dto) => dto.segmentId)).toEqual([2, 1])
  })
})
