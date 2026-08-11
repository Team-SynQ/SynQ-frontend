import { describe, expect, it } from 'vitest'

import { mergeTranscriptSegments } from './mergeTranscriptSegments'
import type { TranscriptSegment } from './transcript.types'

function createSegment(overrides: Partial<TranscriptSegment> = {}): TranscriptSegment {
  return {
    id: '1',
    sequenceIndex: 0,
    startedAtSeconds: 1,
    text: '기본 문장',
    isEdited: false,
    editedAt: null,
    ...overrides,
  }
}

describe('mergeTranscriptSegments', () => {
  it('같은 id를 두 번 만들지 않는다', () => {
    const merged = mergeTranscriptSegments({
      current: [createSegment({ id: '1' })],
      incoming: [createSegment({ id: '1', text: '갱신된 문장' })],
    })

    expect(merged).toHaveLength(1)
    expect(merged[0].text).toBe('갱신된 문장')
  })

  it('새로 들어온 세그먼트를 추가한다', () => {
    const merged = mergeTranscriptSegments({
      current: [createSegment({ id: '1', startedAtSeconds: 1 })],
      incoming: [
        createSegment({ id: '1', startedAtSeconds: 1 }),
        createSegment({ id: '2', startedAtSeconds: 5 }),
      ],
    })

    expect(merged.map((segment) => segment.id)).toEqual(['1', '2'])
  })

  it('서버 목록에 아직 없는 기존 세그먼트를 지우지 않는다', () => {
    const merged = mergeTranscriptSegments({
      current: [
        createSegment({ id: '1', startedAtSeconds: 1 }),
        createSegment({ id: '2', startedAtSeconds: 5 }),
      ],
      incoming: [createSegment({ id: '1', startedAtSeconds: 1 })],
    })

    expect(merged.map((segment) => segment.id)).toEqual(['1', '2'])
  })

  it('편집 중인 세그먼트는 서버 값으로 덮어쓰지 않는다', () => {
    const merged = mergeTranscriptSegments({
      current: [createSegment({ id: '1', text: '사용자가 보고 있는 값' })],
      incoming: [createSegment({ id: '1', text: '서버 값' })],
      protectedSegmentId: '1',
    })

    expect(merged[0].text).toBe('사용자가 보고 있는 값')
  })

  it('편집 중이지만 아직 화면에 없는 세그먼트는 그대로 반영한다', () => {
    const merged = mergeTranscriptSegments({
      current: [],
      incoming: [createSegment({ id: '9', text: '서버 값' })],
      protectedSegmentId: '9',
    })

    expect(merged[0].text).toBe('서버 값')
  })

  it('startedAtSeconds 오름차순, 같으면 sequenceIndex 순으로 정렬한다', () => {
    const merged = mergeTranscriptSegments({
      current: [],
      incoming: [
        createSegment({ id: '3', startedAtSeconds: 9, sequenceIndex: 0 }),
        createSegment({ id: '2', startedAtSeconds: 1, sequenceIndex: 4 }),
        createSegment({ id: '1', startedAtSeconds: 1, sequenceIndex: 1 }),
      ],
    })

    expect(merged.map((segment) => segment.id)).toEqual(['1', '2', '3'])
  })
})
