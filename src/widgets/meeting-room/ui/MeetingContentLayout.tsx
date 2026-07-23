import { AiChatPanel } from '../../../features/meeting-ai-chat'
import type { AiChatPanelProps } from '../../../features/meeting-ai-chat'
import { TranscriptPanel } from '../../../features/live-transcription'
import type { TranscriptPanelProps } from '../../../features/live-transcription'

export type MeetingContentLayoutProps = {
  transcript: TranscriptPanelProps
  aiChat: AiChatPanelProps
}

export function MeetingContentLayout({ transcript, aiChat }: MeetingContentLayoutProps) {
  return (
    <div className="grid min-h-0 grid-cols-[minmax(524px,1fr)_500px]">
      <TranscriptPanel {...transcript} />
      <AiChatPanel {...aiChat} />
    </div>
  )
}
