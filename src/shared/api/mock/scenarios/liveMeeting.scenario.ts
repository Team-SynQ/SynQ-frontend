import type { LiveMeetingResponse, TranscriptHintResponse } from '../../contracts/meeting.contracts'
import {
  liveMeetingAiAnswerFixture,
  liveMeetingFixture,
  liveMeetingHintFixture,
} from '../fixtures/liveMeeting.fixture'

export type LiveMeetingScenario = {
  meeting: LiveMeetingResponse
  hints: Record<string, TranscriptHintResponse>
  aiAnswer: string
  hintFailureCount: number
  transcriptEditFails: boolean
}

function cloneMeeting(meetingId: string): LiveMeetingResponse {
  return structuredClone({
    ...liveMeetingFixture,
    meetingId,
  })
}

function cloneHints(): Record<string, TranscriptHintResponse> {
  return structuredClone(liveMeetingHintFixture)
}

export function createLiveMeetingScenarios(): Record<string, LiveMeetingScenario> {
  return {
    demo: {
      meeting: cloneMeeting('demo'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 0,
      transcriptEditFails: false,
    },
    'demo-hint-error': {
      meeting: cloneMeeting('demo-hint-error'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 1,
      transcriptEditFails: false,
    },
    'demo-edit-error': {
      meeting: cloneMeeting('demo-edit-error'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 0,
      transcriptEditFails: true,
    },
  }
}
