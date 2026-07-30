export const MEETING_SUMMARY_PROCESSING_MS = 2_000
export const MEETING_HISTORY_PROCESSING_MS = 2_000

export type MeetingProcessingPhase =
  'idle' | 'summaryProcessing' | 'historyProcessing' | 'completionVisible' | 'settled'

export type MeetingHistoryPresentation = {
  recordId: string
  status: 'processing' | 'completed'
}

export type ProjectNavigationState = {
  activeProjectId?: string
  openCreateProject?: boolean
  processingMeetingRecordId?: string
}
