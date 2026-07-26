import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import type { AiChatDisplayMode } from '../features/meeting-ai-chat'
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
import { useLiveMeetingController } from './meeting/model/useLiveMeetingController'

type ActiveMeetingControl =
  'idle' | 'participants' | 'more' | 'edit-title' | 'end-confirm' | 'saving'

const aiChatModeAnnouncements: Record<AiChatDisplayMode, string> = {
  docked: 'AI Chat을 기본 크기로 확장했습니다.',
  floating: 'AI Chat을 작은 창으로 전환했습니다.',
  launcher: 'AI Chat을 완전히 축소했습니다.',
}

export function MeetingPage() {
  const { meetingId = 'demo' } = useParams()
  const controller = useLiveMeetingController(meetingId)
  const [lastAction, setLastAction] = useState('회의 진행 화면 준비 완료')
  const [activeControl, setActiveControl] = useState<ActiveMeetingControl>('idle')
  const participantsTriggerRef = useRef<HTMLButtonElement>(null)
  const moreMenuTriggerRef = useRef<HTMLButtonElement>(null)

  if (controller.status === 'loading') {
    return (
      <main
        aria-live="polite"
        className="flex h-dvh min-h-[720px] min-w-[1024px] items-center justify-center bg-surface-default typo-body-01 text-fg-secondary"
      >
        회의 정보를 불러오는 중입니다.
      </main>
    )
  }

  if (controller.status === 'error') {
    return (
      <main
        className="flex h-dvh min-h-[720px] min-w-[1024px] items-center justify-center bg-surface-default typo-body-01 text-fg-secondary"
        role="alert"
      >
        {controller.message}
      </main>
    )
  }

  const participants: MeetingParticipant[] = controller.meeting.participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    role: participant.role,
    avatarSrc: meetingParticipantAvatars[participant.avatarKey],
    isCurrentUser: participant.isCurrentUser,
    isHost: participant.isHost,
    isMicrophoneOn: participant.isMicrophoneOn,
  }))
  const currentUserIsHost = participants.some(
    (participant) => participant.isCurrentUser && participant.isHost,
  )

  const changeAiChatDisplayMode = (mode: AiChatDisplayMode) => {
    controller.changeAiChatDisplayMode(mode)
    setLastAction(aiChatModeAnnouncements[mode])
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-surface-default">
      <MeetingRoom
        aiChat={controller.aiChat}
        aiChatDisplay={{
          mode: controller.aiChatDisplayMode,
          onModeChange: changeAiChatDisplayMode,
        }}
        header={{
          actions: {
            onEndMeeting: () => setActiveControl('end-confirm'),
            onOpenMoreMenu: () =>
              setActiveControl((current) => (current === 'more' ? 'idle' : 'more')),
            onOpenParticipants: () =>
              setActiveControl((current) => (current === 'participants' ? 'idle' : 'participants')),
            onToggleRecording: controller.toggleRecording,
          },
          model: {
            elapsedSeconds: controller.elapsedSeconds,
            isHost: currentUserIsHost,
            liveStatus: 'live',
            meetingId,
            meetingTitle: controller.meetingTitle,
            participantCount: participants.length,
            projectTitle: controller.meeting.projectTitle,
            recordingState: controller.recordingState,
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
        transcript={controller.transcript}
      />
      <MeetingTitleEditDialog
        currentTitle={controller.meetingTitle}
        onCancel={() => setActiveControl('idle')}
        onSubmit={(nextTitle) => {
          controller.setMeetingTitle(nextTitle)
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
