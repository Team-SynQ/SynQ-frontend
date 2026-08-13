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
export { meetingAiChatApi } from './api/meeting-ai-chat.api'
export type {
  MeetingAiChatApi,
  MeetingAiChatSendResult,
  MeetingAiChatWelcome,
} from './api/meeting-ai-chat.api'
export { toAiChatMessages, toAiChatSuggestions } from './api/aiChat.adapter'
export { meetingParticipantApi, toMeetingParticipant } from './api/meeting-participant.api'
export type { MeetingParticipantApi } from './api/meeting-participant.api'
export { meetingHintApi } from './api/meeting-hint.api'
export type { MeetingHintApi } from './api/meeting-hint.api'
export { meetingAiEventsGateway, parseAiEventFrame } from './api/meeting-ai-events.gateway'
export type {
  AiEventChannel,
  AiEventChannelStatus,
  MeetingAiEvent,
  MeetingAiEventsGateway,
} from './api/meeting-ai-events.gateway'
export { toTranscriptHint, toTranscriptHintRecord } from './api/hint.adapter'
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
  OngoingMeeting,
} from './model/meeting.types'
