/** SynQ 힌트(3-hint) 서버 DTO. Swagger의 HintResponse · HintRecordListResponse 기준이다. */

/** 힌트 생성 응답. 전사 하나에 대한 3-hint 본문만 준다. */
export type HintDto = {
  meaning: string
  myImpact: string
  teamQuestion: string
}

/** 힌트가 자동 생성됐는지, 사용자가 요청했는지. */
export type HintSource = 'MANUAL' | 'AUTO'

/** 기록 조회 응답의 항목. 생성 응답과 달리 어느 전사의 힌트인지와 생성 맥락이 붙는다. */
export type HintRecordDto = HintDto & {
  segmentId: number
  source: HintSource
  importance: number
  triggerReason: string
  generatedAt: string
}

export type ListHintRecordsResult = {
  meetingId: number
  hints: HintRecordDto[]
}
