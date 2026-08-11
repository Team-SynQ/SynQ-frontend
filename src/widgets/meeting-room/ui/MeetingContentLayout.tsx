import { useEffect, useRef, useState, type CSSProperties } from 'react'

import {
  AiChatLauncher,
  AiChatPanel,
  type AiChatContentProps,
  type AiChatDisplayMode,
} from '../../../features/meeting-ai-chat'
import { TranscriptPanel } from '../../../features/live-transcription'
import type { TranscriptPanelProps } from '../../../features/live-transcription'
import { cn } from '../../../shared/lib/cn'
import {
  clampAiChatWidth,
  readAiChatPanelWidth,
  TRANSCRIPT_MIN_WIDTH,
  writeAiChatPanelWidth,
} from '../model/aiChatPanelWidth.storage'
import { AiChatResizeHandle } from './AiChatResizeHandle'

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
  const contentRef = useRef<HTMLDivElement>(null)
  const [aiChatWidth, setAiChatWidth] = useState(readAiChatPanelWidth)
  const [maxAiChatWidth, setMaxAiChatWidth] = useState(0)

  /**
   * 저장 시점에 쓸 최신 폭. 상태는 다음 렌더에 반영되므로, 같은 이벤트 안에서
   * 조절하고 곧바로 저장하는 키보드 경로가 한 단계 이전 값을 쓰게 된다.
   */
  const latestAiChatWidthRef = useRef(aiChatWidth)

  // 컨테이너 폭은 렌더 중에 읽지 않는다. 조절 시점과 창 크기 변경 시점에만 잰다.
  const resizeAiChat = (nextWidth: number) => {
    const containerWidth = contentRef.current?.clientWidth ?? 0
    const clamped = clampAiChatWidth(nextWidth, containerWidth)
    latestAiChatWidthRef.current = clamped
    setMaxAiChatWidth(Math.max(containerWidth - TRANSCRIPT_MIN_WIDTH, 0))
    setAiChatWidth(clamped)
  }

  useEffect(() => {
    // 창이 좁아지면 지금 폭이 상한을 넘을 수 있어 함께 다시 맞춘다.
    const syncWidth = () => {
      const containerWidth = contentRef.current?.clientWidth ?? 0
      setMaxAiChatWidth(Math.max(containerWidth - TRANSCRIPT_MIN_WIDTH, 0))
      setAiChatWidth((current) => {
        const clamped = clampAiChatWidth(current, containerWidth)
        latestAiChatWidthRef.current = clamped
        return clamped
      })
    }

    // effect 본문에서 setState를 직접 부르지 않는다. 저장소의 회피 패턴을 따른다.
    void Promise.resolve().then(syncWidth)
    window.addEventListener('resize', syncWidth)
    return () => window.removeEventListener('resize', syncWidth)
  }, [])

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
        mode === 'docked'
          ? 'grid-cols-[minmax(524px,1fr)_auto_var(--ai-chat-width)]'
          : 'grid-cols-[minmax(0,1fr)]',
      )}
      data-ai-chat-mode={mode}
      ref={contentRef}
      style={
        mode === 'docked' ? ({ '--ai-chat-width': `${aiChatWidth}px` } as CSSProperties) : undefined
      }
    >
      <TranscriptPanel {...transcript} />

      {mode === 'docked' ? (
        <AiChatResizeHandle
          maxWidth={maxAiChatWidth}
          onResize={resizeAiChat}
          onResizeEnd={() => writeAiChatPanelWidth(latestAiChatWidthRef.current)}
          width={aiChatWidth}
        />
      ) : null}

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
