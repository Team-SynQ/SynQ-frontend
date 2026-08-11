import type { LiveMeetingResponse } from '../../contracts/meeting.contracts'
import { liveMeetingAiAnswerFixture, liveMeetingFixture } from '../fixtures/liveMeeting.fixture'

export type LiveMeetingScenario = {
  meeting: LiveMeetingResponse
  aiAnswer: string
  transcriptEditFails: boolean
  completionFails: boolean
}

function cloneMeeting(meetingId: string): LiveMeetingResponse {
  return structuredClone({
    ...liveMeetingFixture,
    meetingId,
  })
}

export function createLiveMeetingScenarios(): Record<string, LiveMeetingScenario> {
  return {
    '1': {
      meeting: cloneMeeting('1'),
      aiAnswer: liveMeetingAiAnswerFixture,
      transcriptEditFails: false,
      completionFails: false,
    },
    '2': {
      meeting: cloneMeeting('2'),
      aiAnswer: liveMeetingAiAnswerFixture,
      transcriptEditFails: false,
      completionFails: false,
    },
    '3': {
      meeting: cloneMeeting('3'),
      aiAnswer: liveMeetingAiAnswerFixture,
      transcriptEditFails: true,
      completionFails: false,
    },
    '4': {
      meeting: cloneMeeting('4'),
      aiAnswer: liveMeetingAiAnswerFixture,
      transcriptEditFails: false,
      completionFails: true,
    },
    demo: {
      meeting: cloneMeeting('demo'),
      aiAnswer: liveMeetingAiAnswerFixture,
      transcriptEditFails: false,
      completionFails: false,
    },
    'demo-hint-error': {
      meeting: cloneMeeting('demo-hint-error'),
      aiAnswer: liveMeetingAiAnswerFixture,
      transcriptEditFails: false,
      completionFails: false,
    },
    'demo-edit-error': {
      meeting: cloneMeeting('demo-edit-error'),
      aiAnswer: liveMeetingAiAnswerFixture,
      transcriptEditFails: true,
      completionFails: false,
    },
    'demo-save-error': {
      meeting: cloneMeeting('demo-save-error'),
      aiAnswer: liveMeetingAiAnswerFixture,
      transcriptEditFails: false,
      completionFails: true,
    },
  }
}
