import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import type { MeetingHeaderViewModel } from '../entities/meeting'
import type { AiChatDisplayMode, AiChatMessage } from '../features/meeting-ai-chat'
import type { TranscriptPanelState } from '../features/live-transcription'
import {
  MeetingExitDialog,
  MeetingMoreMenu,
  MeetingParticipantsPopover,
  MeetingSaveDialog,
  MeetingTitleEditDialog,
  meetingParticipantAvatars,
  type MeetingParticipant,
} from '../features/meeting-controls'
import { MeetingRoom } from '../widgets/meeting-room'

const activeTranscriptState: TranscriptPanelState = {
  kind: 'active',
  isSpeaking: true,
  segments: [
    {
      id: 'segment-1',
      sequenceIndex: 1,
      startedAtSeconds: 284,
      text: '네, 지난주 유저 인터뷰 결과를 토대로 봤을 때, 제품 측면에서는 온보딩 플로우 개선이 가장 큰 임팩트를 줄 수 있을 것 같습니다. 사용자들이 앱에 처음 들어왔을 때 핵심 기능을 파악하기 전에 헤매는 구간이 너무 길어요.',
      isEdited: false,
      editedAt: null,
    },
  ],
}

const initialMessages: AiChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content:
      '회의가 시작되었습니다. 프로젝트 자료와 지난 회의 맥락을 바탕으로 언제든 답변해 드립니다.',
  },
]

const suggestions = [
  { id: 'previous-scope', label: '지난 회의에서는 이 범위 어디까지 정했어?' },
  { id: 'my-role', label: '오늘 내가 맡은 부분은?' },
]

const participants: MeetingParticipant[] = [
  {
    id: 'you',
    name: '윤금서',
    role: 'Design',
    avatarSrc: meetingParticipantAvatars.you,
    isCurrentUser: true,
    isHost: true,
    isMicrophoneOn: true,
  },
  {
    id: 'design',
    name: '이동희',
    role: 'Design',
    avatarSrc: meetingParticipantAvatars.design,
  },
  {
    id: 'pm',
    name: '이소미',
    role: 'PM',
    avatarSrc: meetingParticipantAvatars.pm,
  },
  {
    id: 'server',
    name: '김도진',
    role: 'Server',
    avatarSrc: meetingParticipantAvatars.server,
  },
]

const currentUserIsHost = participants.some(
  (participant) => participant.isCurrentUser && participant.isHost,
)

type ActiveMeetingControl =
  'idle' | 'participants' | 'more' | 'edit-title' | 'end-confirm' | 'saving'

export function MeetingPage() {
  const { meetingId = 'demo' } = useParams()
  const [elapsedSeconds, setElapsedSeconds] = useState(373)
  const [recordingState, setRecordingState] =
    useState<MeetingHeaderViewModel['recordingState']>('recording')
  const [transcriptState, setTranscriptState] = useState<TranscriptPanelState>({ kind: 'waiting' })
  const [messages, setMessages] = useState<AiChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [aiChatDisplayMode, setAiChatDisplayMode] = useState<AiChatDisplayMode>('docked')
  const [lastAction, setLastAction] = useState('회의 진행 화면 준비 완료')
  const [meetingTitle, setMeetingTitle] = useState('2차 대면회의')
  const [activeControl, setActiveControl] = useState<ActiveMeetingControl>('idle')
  const participantsTriggerRef = useRef<HTMLButtonElement>(null)
  const moreMenuTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  const sendMessage = () => {
    const content = draft.trim()
    if (!content) return

    setMessages((current) => [...current, { id: `user-${current.length}`, role: 'user', content }])
    setDraft('')
    setLastAction('AI Chat 메시지를 전송했습니다.')
  }

  const changeAiChatDisplayMode = (mode: AiChatDisplayMode) => {
    setAiChatDisplayMode(mode)

    const announcement: Record<AiChatDisplayMode, string> = {
      docked: 'AI Chat을 기본 크기로 확장했습니다.',
      floating: 'AI Chat을 작은 창으로 전환했습니다.',
      launcher: 'AI Chat을 완전히 축소했습니다.',
    }

    setLastAction(announcement[mode])
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-surface-default">
      <MeetingRoom
        aiChat={{
          actions: {
            onDraftChange: setDraft,
            onClearContext: () => undefined,
            onSelectSuggestion: (suggestionId) => {
              const suggestion = suggestions.find((item) => item.id === suggestionId)
              if (suggestion) setDraft(suggestion.label)
            },
            onSend: sendMessage,
          },
          model: {
            draft,
            isSending: false,
            messages,
            pinnedContext: null,
            suggestions,
          },
        }}
        aiChatDisplay={{
          mode: aiChatDisplayMode,
          onModeChange: changeAiChatDisplayMode,
        }}
        header={{
          actions: {
            onEndMeeting: () => setActiveControl('end-confirm'),
            onOpenMoreMenu: () =>
              setActiveControl((current) => (current === 'more' ? 'idle' : 'more')),
            onOpenParticipants: () =>
              setActiveControl((current) => (current === 'participants' ? 'idle' : 'participants')),
            onToggleRecording: () => {
              setRecordingState((current) => (current === 'recording' ? 'paused' : 'recording'))
            },
          },
          model: {
            elapsedSeconds,
            isHost: currentUserIsHost,
            liveStatus: 'live',
            meetingId,
            meetingTitle,
            participantCount: 4,
            projectTitle: '서비스디자인',
            recordingState,
          },
          moreMenuOpen: activeControl === 'more',
          moreMenuPopover: (
            <MeetingMoreMenu
              onClose={() => setActiveControl('idle')}
              onEditTitle={() => setActiveControl('edit-title')}
              open={activeControl === 'more'}
              triggerRef={moreMenuTriggerRef}
            />
          ),
          moreMenuTriggerRef,
          participantsOpen: activeControl === 'participants',
          participantsPopover: (
            <MeetingParticipantsPopover
              onClose={() => setActiveControl('idle')}
              open={activeControl === 'participants'}
              participants={participants}
              triggerRef={participantsTriggerRef}
            />
          ),
          participantsTriggerRef,
        }}
        transcript={{
          actions: {
            onRefresh: () => {
              setTranscriptState((current) =>
                current.kind === 'waiting' ? activeTranscriptState : { kind: 'waiting' },
              )
              setLastAction('전사 상태를 전환했습니다.')
            },
            onSelectSegment: (segmentId) => setLastAction(`${segmentId} 발화 선택`),
          },
          state: transcriptState,
        }}
      />
      <MeetingTitleEditDialog
        currentTitle={meetingTitle}
        onCancel={() => setActiveControl('idle')}
        onSubmit={(nextTitle) => {
          setMeetingTitle(nextTitle)
          setActiveControl('idle')
          setLastAction('회의 제목을 변경했습니다.')
        }}
        open={activeControl === 'edit-title'}
      />
      <MeetingExitDialog
        mode={currentUserIsHost ? 'end' : 'leave'}
        onCancel={() => setActiveControl('idle')}
        onConfirm={() => setActiveControl('saving')}
        open={activeControl === 'end-confirm'}
      />
      <MeetingSaveDialog open={activeControl === 'saving'} state="saving" />
      <p aria-live="polite" className="sr-only">
        {lastAction}
      </p>
    </div>
  )
}
