import { useCallback, useEffect, useRef, useState } from 'react'

import {
  MEETING_HISTORY_PROCESSING_MS,
  MEETING_SUMMARY_PROCESSING_MS,
  type MeetingProcessingPhase,
} from './meetingProcessing.types'

export {
  MEETING_HISTORY_PROCESSING_MS,
  MEETING_SUMMARY_PROCESSING_MS,
} from './meetingProcessing.types'

type UseMeetingProcessingFlowParams = {
  recordId?: string
}

type MeetingProcessingFlow = {
  phase: MeetingProcessingPhase
  processingRecordId?: string
  dismissCompletion: () => void
  settle: () => void
}

export function useMeetingProcessingFlow(
  params: UseMeetingProcessingFlowParams,
): MeetingProcessingFlow {
  const { recordId } = params
  const [processingRecordId] = useState(recordId)
  const [phase, setPhase] = useState<MeetingProcessingPhase>(
    processingRecordId ? 'summaryProcessing' : 'idle',
  )
  const summaryTimerRef = useRef<number | null>(null)
  const historyTimerRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (summaryTimerRef.current !== null) {
      window.clearTimeout(summaryTimerRef.current)
      summaryTimerRef.current = null
    }
    if (historyTimerRef.current !== null) {
      window.clearTimeout(historyTimerRef.current)
      historyTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    clearTimers()

    if (!processingRecordId) return clearTimers

    summaryTimerRef.current = window.setTimeout(() => {
      summaryTimerRef.current = null
      setPhase('historyProcessing')
      historyTimerRef.current = window.setTimeout(() => {
        historyTimerRef.current = null
        setPhase('completionVisible')
      }, MEETING_HISTORY_PROCESSING_MS)
    }, MEETING_SUMMARY_PROCESSING_MS)

    return clearTimers
  }, [clearTimers, processingRecordId])

  const dismissCompletion = useCallback(() => {
    setPhase((current) => (current === 'completionVisible' ? 'settled' : current))
  }, [])

  const settle = useCallback(() => {
    clearTimers()
    setPhase((current) => (current === 'idle' ? current : 'settled'))
  }, [clearTimers])

  return {
    phase,
    processingRecordId,
    dismissCompletion,
    settle,
  }
}
