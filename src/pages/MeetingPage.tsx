import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import type { CompletedMeeting, LiveMeetingProjectContext } from '../entities/meeting'
import type { CurrentUser } from '../entities/user'
import type { AiChatDisplayMode } from '../features/meeting-ai-chat'
import { MeetingConnectionToast } from '../features/meeting-connection'
import type { ProjectNavigationState } from '../features/meeting-processing'
import {
  MeetingExitDialog,
  MeetingMoreMenu,
  MeetingParticipantsPopover,
  MeetingSaveDialog,
  MeetingTitleEditDialog,
  type MeetingParticipant,
} from '../features/meeting-controls'
import { MeetingRoom } from '../widgets/meeting-room'
import { useLiveMeetingController } from './meeting/model/useLiveMeetingController'
import { useMeetingExitGuard } from './meeting/model/useMeetingExitGuard'

type ActiveMeetingControl =
  | 'idle'
  | 'participants'
  | 'more'
  | 'edit-title'
  | 'end-confirm'
  | 'saving'
  | 'save-success'
  | 'save-failure'

const aiChatModeAnnouncements: Record<AiChatDisplayMode, string> = {
  docked: 'AI Chat을 기본 크기로 확장했습니다.',
  floating: 'AI Chat을 작은 창으로 전환했습니다.',
  launcher: 'AI Chat을 완전히 축소했습니다.',
}

export type MeetingPageProps = {
  user?: CurrentUser
}

export function MeetingPage({ user }: MeetingPageProps = {}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { meetingId = 'demo' } = useParams()
  const controller = useLiveMeetingController(meetingId, user?.userId ?? null)
  const exitGuard = useMeetingExitGuard({ enabled: controller.status === 'ready' })
  const [lastAction, setLastAction] = useState('회의 진행 화면 준비 완료')
  const [activeControl, setActiveControl] = useState<ActiveMeetingControl>('idle')
  const [completedMeeting, setCompletedMeeting] = useState<CompletedMeeting | null>(null)
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

  const participants: MeetingParticipant[] = controller.participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    avatarSrc: participant.profileImageUrl ?? undefined,
    isCurrentUser: participant.isCurrentUser,
    isHost: participant.isHost,
  }))
  const currentUserIsHost = controller.role === 'host'

  const changeAiChatDisplayMode = (mode: AiChatDisplayMode) => {
    controller.changeAiChatDisplayMode(mode)
    setLastAction(aiChatModeAnnouncements[mode])
  }

  const locationState = location.state as Partial<LiveMeetingProjectContext> | null
  const projectContext: LiveMeetingProjectContext = {
    projectId: locationState?.projectId ?? controller.meeting.projectId,
    projectTitle: locationState?.projectTitle ?? controller.meeting.projectTitle,
  }

  const returnToProject = () => {
    exitGuard.allowExit()
    navigate('/projects', {
      replace: true,
      state: { activeProjectId: projectContext.projectId },
    })
  }

  const returnToProjectWithCompletedMeeting = () => {
    if (!completedMeeting) return

    exitGuard.allowExit()
    navigate('/projects', {
      replace: true,
      state: {
        activeProjectId: completedMeeting.projectId,
        processingMeetingRecordId: completedMeeting.recordId,
      } satisfies ProjectNavigationState,
    })
  }

  const saveMeeting = async () => {
    setActiveControl('saving')
    try {
      const completed = await controller.completeMeeting(projectContext)
      setCompletedMeeting(completed)
      setActiveControl('save-success')
    } catch {
      setActiveControl('save-failure')
    }
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
            projectTitle: projectContext.projectTitle,
            recordingState: controller.recordingState,
            recordingControlDisabled: controller.connectionState !== 'connected',
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
      {currentUserIsHost && controller.connectionNotice ? (
        <MeetingConnectionToast className="top-[106px]!" status={controller.connectionNotice} />
      ) : null}
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
        onCancel={() => {
          exitGuard.dismiss()
          setActiveControl('idle')
        }}
        onConfirm={() => {
          // 가로챈 이동은 여기서 놓아준다. 종료·나가기 처리가 끝나면 스스로 프로젝트 화면으로 보낸다.
          exitGuard.dismiss()
          if (currentUserIsHost) {
            void saveMeeting()
            return
          }
          returnToProject()
        }}
        open={activeControl === 'end-confirm' || exitGuard.isBlocked}
      />
      {activeControl === 'saving' ? <MeetingSaveDialog open state="saving" /> : null}
      {activeControl === 'save-success' && completedMeeting ? (
        <MeetingSaveDialog
          meetingTitle={completedMeeting.meetingTitle}
          onClose={returnToProjectWithCompletedMeeting}
          open
          projectTitle={completedMeeting.projectTitle}
          state="success"
        />
      ) : null}
      {activeControl === 'save-failure' ? (
        <MeetingSaveDialog onRetry={() => void saveMeeting()} open state="failure" />
      ) : null}
      <p aria-live="polite" className="sr-only">
        {lastAction}
      </p>
    </div>
  )
}
