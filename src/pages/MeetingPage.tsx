import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import type { MeetingHeaderViewModel } from '../entities/meeting'
import type { AiChatMessage } from '../features/meeting-ai-chat'
import type { TranscriptPanelState } from '../features/live-transcription'
import { MeetingRoom } from '../widgets/meeting-room'

const activeTranscriptState: TranscriptPanelState = {
  kind: 'active',
  isSpeaking: true,
  segments: [
    {
      id: 'segment-1',
      startedAtSeconds: 284,
      text: '네, 지난주 유저 인터뷰 결과를 토대로 봤을 때, 제품 측면에서는 온보딩 플로우 개선이 가장 큰 임팩트를 줄 수 있을 것 같습니다. 사용자들이 앱에 처음 들어왔을 때 핵심 기능을 파악하기 전에 헤매는 구간이 너무 길어요.',
    },
  ],
}

const initialMessages: AiChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content: '회의가 시작되었습니다. 프로젝트 자료와 지난 회의 맥락을 바탕으로 언제든 답변해 드립니다.',
  },
]

const suggestions = [
  { id: 'previous-scope', label: '지난 회의에서는 이 범위 어디까지 정했어?' },
  { id: 'my-role', label: '오늘 내가 맡은 부분은?' },
]

export function MeetingPage() {
  const { meetingId = 'demo' } = useParams()
  const [elapsedSeconds, setElapsedSeconds] = useState(373)
  const [recordingState, setRecordingState] = useState<MeetingHeaderViewModel['recordingState']>('recording')
  const [transcriptState, setTranscriptState] = useState<TranscriptPanelState>({ kind: 'waiting' })
  const [messages, setMessages] = useState<AiChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [lastAction, setLastAction] = useState('회의 진행 화면 준비 완료')

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  const sendMessage = () => {
    const content = draft.trim()
    if (!content) return

    setMessages((current) => [
      ...current,
      { id: `user-${current.length}`, role: 'user', content },
    ])
    setDraft('')
    setLastAction('AI Chat 메시지를 전송했습니다.')
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-surface-default">
      <MeetingRoom
        aiChat={{
          actions: {
            onDraftChange: setDraft,
            onMinimize: () => setLastAction('AI Chat 최소화 요청'),
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
            suggestions,
          },
        }}
        header={{
          actions: {
            onEndMeeting: () => setLastAction('회의 종료 요청'),
            onOpenMoreMenu: () => setLastAction('회의 메뉴 열기 요청'),
            onOpenParticipants: () => setLastAction('참여자 확인 요청'),
            onToggleRecording: () => {
              setRecordingState((current) => current === 'recording' ? 'paused' : 'recording')
            },
          },
          model: {
            elapsedSeconds,
            liveStatus: 'live',
            meetingId,
            meetingTitle: '2차 대면회의',
            participantCount: 4,
            projectTitle: '서비스디자인',
            recordingState,
          },
        }}
        transcript={{
          actions: {
            onRefresh: () => {
              setTranscriptState((current) => current.kind === 'waiting'
                ? activeTranscriptState
                : { kind: 'waiting' })
              setLastAction('전사 상태를 전환했습니다.')
            },
            onSelectSegment: (segmentId) => setLastAction(`${segmentId} 발화 선택`),
          },
          state: transcriptState,
        }}
      />
      <p aria-live="polite" className="sr-only">{lastAction}</p>
    </div>
  )
}
