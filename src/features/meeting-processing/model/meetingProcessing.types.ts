export const MEETING_SUMMARY_PROCESSING_MS = 2_000
export const MEETING_HISTORY_PROCESSING_MS = 2_000

export type MeetingProcessingPhase =
  'idle' | 'summaryProcessing' | 'historyProcessing' | 'completionVisible' | 'settled'

export type MeetingHistoryPresentation = {
  recordId: string
  status: 'processing' | 'completed' | 'failed'
}

export type ProjectNavigationState = {
  activeProjectId?: string
  openCreateProject?: boolean
  processingMeetingRecordId?: string
  /** 초대 참여 후 역할·관점 설정을 마치고 돌아온 경우 저장 성공 토스트를 띄웁니다. */
  roleProfileSaved?: boolean
}
