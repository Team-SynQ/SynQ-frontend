import type { AiChatContentProps } from '../../../features/meeting-ai-chat'
import type { TranscriptPanelProps } from '../../../features/live-transcription'
import { MeetingContentLayout, type MeetingAiChatDisplayProps } from './MeetingContentLayout'
import { MeetingHeader } from './MeetingHeader'
import type { MeetingHeaderProps } from './MeetingHeader'

export type MeetingRoomProps = {
  header: MeetingHeaderProps
  transcript: TranscriptPanelProps
  aiChat: AiChatContentProps
  aiChatDisplay: MeetingAiChatDisplayProps
}

export function MeetingRoom({ header, transcript, aiChat, aiChatDisplay }: MeetingRoomProps) {
  return (
    <main className="grid h-dvh min-h-[720px] min-w-[1024px] grid-rows-[90px_minmax(0,1fr)] overflow-hidden bg-surface-default text-fg-primary">
      <MeetingHeader {...header} />
      <MeetingContentLayout aiChat={aiChat} aiChatDisplay={aiChatDisplay} transcript={transcript} />
    </main>
  )
}
