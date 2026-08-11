export { formatElapsedTime } from './lib/formatElapsedTime'
export { formatTranscriptTime } from './lib/formatTranscriptTime'
export { formatMeetingDate } from './lib/formatMeetingDate'
export { meetingLifecycleApi } from './api/meeting-lifecycle.api'
export type { MeetingLifecycleApi } from './api/meeting-lifecycle.api'
export { liveMeetingSnapshotGateway } from './api/meeting-snapshot.gateway'
export type { LiveMeetingSnapshotGateway } from './api/meeting-snapshot.gateway'
export { meetingRecordGateway } from './api/meeting-record.gateway'
export type { MeetingRecordGateway } from './api/meeting-record.gateway'
export { meetingConnectionGateway } from './api/meeting-connection.gateway'
export type { MeetingConnectionGateway } from './api/meeting-connection.gateway'
export { meetingAiMockGateway } from './api/meeting-ai.mock-gateway'
export type { MeetingAiMockGateway } from './api/meeting-ai.mock-gateway'
export { toTranscriptSegment, toTranscriptSegments } from './api/transcript.adapter'
export {
  meetingTranscriptionGateway,
  parseTranscriptionMessage,
  resolveTranscriptionUrl,
} from './api/meeting-transcription.gateway'
export type {
  ConnectTranscriptionOptions,
  MeetingTranscriptionGateway,
  TranscriptionChannel,
  TranscriptionChannelStatus,
  TranscriptionMessage,
} from './api/meeting-transcription.gateway'
export type {
  CompleteMeeting,
  CompletedMeeting,
  LiveMeeting,
  LiveMeetingAiChatMessage,
  LiveMeetingAiChatSuggestion,
  LiveMeetingAiPinnedContext,
  LiveMeetingParticipant,
  LiveMeetingTranscriptHint,
  LiveMeetingTranscriptSegment,
  MeetingHeaderActions,
  MeetingHeaderViewModel,
  LiveMeetingProjectContext,
} from './model/meeting.types'
