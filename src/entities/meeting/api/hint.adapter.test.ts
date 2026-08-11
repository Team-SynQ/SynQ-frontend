import { describe, expect, it } from 'vitest'

import { toTranscriptHint, toTranscriptHintRecord } from './hint.adapter'

describe('힌트 어댑터', () => {
  it('생성 응답의 myImpact를 화면의 personalImpact로 옮긴다', () => {
    expect(
      toTranscriptHint('12', {
        meaning: '온보딩 개선이 우선순위라는 뜻입니다.',
        myImpact: '일정에 영향이 있습니다.',
        teamQuestion: '완료 기준은 무엇인가요?',
      }),
    ).toEqual({
      transcriptId: '12',
      meaning: '온보딩 개선이 우선순위라는 뜻입니다.',
      personalImpact: '일정에 영향이 있습니다.',
      teamQuestion: '완료 기준은 무엇인가요?',
    })
  })

  // 기록 응답에만 있는 source·importance·triggerReason은 화면에서 쓰지 않는다.
  it('기록 응답의 segmentId를 문자열 transcriptId로 맞추고 메타데이터는 버린다', () => {
    expect(
      toTranscriptHintRecord({
        segmentId: 34,
        meaning: '의미',
        myImpact: '영향',
        teamQuestion: '질문',
        source: 'AUTO',
        importance: 3,
        triggerReason: '결정이 언급됨',
        generatedAt: '2026-08-11T05:00:00Z',
      }),
    ).toEqual({
      transcriptId: '34',
      meaning: '의미',
      personalImpact: '영향',
      teamQuestion: '질문',
    })
  })
})
