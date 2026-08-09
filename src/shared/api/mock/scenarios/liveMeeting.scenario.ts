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
  completionFails: boolean
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
    '1': {
      meeting: cloneMeeting('1'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 0,
      transcriptEditFails: false,
      completionFails: false,
    },
    '2': {
      meeting: cloneMeeting('2'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 1,
      transcriptEditFails: false,
      completionFails: false,
    },
    '3': {
      meeting: cloneMeeting('3'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 0,
      transcriptEditFails: true,
      completionFails: false,
    },
    '4': {
      meeting: cloneMeeting('4'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 0,
      transcriptEditFails: false,
      completionFails: true,
    },
    demo: {
      meeting: cloneMeeting('demo'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 0,
      transcriptEditFails: false,
      completionFails: false,
    },
    'demo-hint-error': {
      meeting: cloneMeeting('demo-hint-error'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 1,
      transcriptEditFails: false,
      completionFails: false,
    },
    'demo-edit-error': {
      meeting: cloneMeeting('demo-edit-error'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 0,
      transcriptEditFails: true,
      completionFails: false,
    },
    'demo-save-error': {
      meeting: cloneMeeting('demo-save-error'),
      hints: cloneHints(),
      aiAnswer: liveMeetingAiAnswerFixture,
      hintFailureCount: 0,
      transcriptEditFails: false,
      completionFails: true,
    },
  }
}
