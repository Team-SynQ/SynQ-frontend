import { useEffect, useRef } from 'react'

import {
  AiChatLauncher,
  AiChatPanel,
  type AiChatContentProps,
  type AiChatDisplayMode,
} from '../../../features/meeting-ai-chat'
import { TranscriptPanel } from '../../../features/live-transcription'
import type { TranscriptPanelProps } from '../../../features/live-transcription'
import { cn } from '../../../shared/lib/cn'

export type MeetingAiChatDisplayProps = {
  mode: AiChatDisplayMode
  onModeChange: (mode: AiChatDisplayMode) => void
}

type RestorableAiChatMode = Exclude<AiChatDisplayMode, 'launcher'>

export type MeetingContentLayoutProps = {
  transcript: TranscriptPanelProps
  aiChat: AiChatContentProps
  aiChatDisplay: MeetingAiChatDisplayProps
}

export function MeetingContentLayout({
  transcript,
  aiChat,
  aiChatDisplay,
}: MeetingContentLayoutProps) {
  const panelActionRef = useRef<HTMLButtonElement>(null)
  const collapseButtonRef = useRef<HTMLButtonElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const previousModeRef = useRef(aiChatDisplay.mode)
  const mode = aiChatDisplay.mode
  const launcherReturnModeRef = useRef<RestorableAiChatMode>(
    mode === 'launcher' ? 'floating' : mode,
  )

  useEffect(() => {
    const previousMode = previousModeRef.current

    if (previousMode === 'launcher' && mode !== 'launcher') {
      collapseButtonRef.current?.focus()
    }

    if (previousMode !== 'launcher' && mode === 'launcher') {
      launcherRef.current?.focus()
    }

    if (mode !== 'launcher') {
      launcherReturnModeRef.current = mode
    }

    previousModeRef.current = mode
  }, [mode])

  return (
    <div
      className={cn(
        'relative grid min-h-0 overflow-hidden',
        mode === 'docked' ? 'grid-cols-[minmax(524px,1fr)_500px]' : 'grid-cols-[minmax(0,1fr)]',
      )}
      data-ai-chat-mode={mode}
    >
      <TranscriptPanel {...transcript} />

      {mode !== 'launcher' ? (
        <div
          className={cn(
            // min-w-0이 없으면 긴 문구가 그리드 트랙을 밀고 나간다.
            'min-h-0 min-w-0',
            mode === 'floating' &&
              'absolute bottom-m right-m z-20 h-[min(618px,calc(100%_-_48px))] w-[400px] rounded-m shadow-ai-chat-floating',
          )}
        >
          {mode === 'docked' ? (
            <AiChatPanel
              {...aiChat}
              actionButtonRef={panelActionRef}
              collapseButtonRef={collapseButtonRef}
              onCollapse={() => aiChatDisplay.onModeChange('launcher')}
              onMinimize={() => aiChatDisplay.onModeChange('floating')}
              variant="docked"
            />
          ) : (
            <AiChatPanel
              {...aiChat}
              actionButtonRef={panelActionRef}
              collapseButtonRef={collapseButtonRef}
              onCollapse={() => aiChatDisplay.onModeChange('launcher')}
              onMaximize={() => aiChatDisplay.onModeChange('docked')}
              variant="floating"
            />
          )}
        </div>
      ) : (
        <div className="absolute bottom-m right-m z-20 size-[100px]">
          <AiChatLauncher
            buttonRef={launcherRef}
            onOpen={() => aiChatDisplay.onModeChange(launcherReturnModeRef.current)}
          />
        </div>
      )}
    </div>
  )
}
