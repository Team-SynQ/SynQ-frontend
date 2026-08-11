import type { LiveMeetingResponse } from '../../contracts/meeting.contracts'
import { liveMeetingFixture } from '../fixtures/liveMeeting.fixture'

export type LiveMeetingScenario = {
  meeting: LiveMeetingResponse
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
      transcriptEditFails: false,
      completionFails: false,
    },
    '2': {
      meeting: cloneMeeting('2'),
      transcriptEditFails: false,
      completionFails: false,
    },
    '3': {
      meeting: cloneMeeting('3'),
      transcriptEditFails: true,
      completionFails: false,
    },
    '4': {
      meeting: cloneMeeting('4'),
      transcriptEditFails: false,
      completionFails: true,
    },
    demo: {
      meeting: cloneMeeting('demo'),
      transcriptEditFails: false,
      completionFails: false,
    },
    'demo-hint-error': {
      meeting: cloneMeeting('demo-hint-error'),
      transcriptEditFails: false,
      completionFails: false,
    },
    'demo-edit-error': {
      meeting: cloneMeeting('demo-edit-error'),
      transcriptEditFails: true,
      completionFails: false,
    },
    'demo-save-error': {
      meeting: cloneMeeting('demo-save-error'),
      transcriptEditFails: false,
      completionFails: true,
    },
  }
}
