import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import type { CompletedMeeting, LiveMeetingProjectContext } from '../entities/meeting'
import type { CurrentUser } from '../entities/user'
import type { AiChatDisplayMode } from '../features/meeting-ai-chat'
import { MeetingConnectionToast } from '../features/meeting-connection'
import type { ProjectNavigationState } from '../features/meeting-processing'
import {
  MeetingEndedNoticeDialog,
  MeetingExitDialog,
  MeetingMoreMenu,
  MeetingParticipantsPopover,
  MeetingSaveDialog,
  MeetingTitleEditDialog,
  type MeetingParticipant,
} from '../features/meeting-controls'
import { useTransientVisibility } from '../shared/lib/useTransientVisibility'
import { Toast } from '../shared/ui'
import { MeetingRoom } from '../widgets/meeting-room'
import { clearMeetingProjectContext } from './meeting/model/meetingProjectContext.storage'
import { useLiveMeetingController } from './meeting/model/useLiveMeetingController'
import { useMeetingExitGuard } from './meeting/model/useMeetingExitGuard'
import { useMeetingProjectContext } from './meeting/model/useMeetingProjectContext'

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
  // 이미 끝난 회의를 떠나는 것은 막을 이유가 없다. 종료 안내 위에 이탈 확인 모달이 겹치지도 않는다.
  const exitGuard = useMeetingExitGuard({
    enabled: controller.status === 'ready' && !controller.endedByServer,
  })
  const knownProjectContext = useMeetingProjectContext(
    meetingId,
    location.state as Partial<LiveMeetingProjectContext> | null,
  )
  const [lastAction, setLastAction] = useState('회의 진행 화면 준비 완료')
  const [activeControl, setActiveControl] = useState<ActiveMeetingControl>('idle')
  const [completedMeeting, setCompletedMeeting] = useState<CompletedMeeting | null>(null)
  const [titleSave, setTitleSave] = useState<{ pending: boolean; errorMessage: string | null }>({
    pending: false,
    errorMessage: null,
  })
  const [isRecordingControlPending, setIsRecordingControlPending] = useState(false)
  const [recordingControlError, setRecordingControlError] = useState<string | null>(null)
  const recordingControlToast = useTransientVisibility()
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

  const projectContext: LiveMeetingProjectContext = knownProjectContext ?? {
    projectId: controller.meeting.projectId,
    projectTitle: controller.meeting.projectTitle,
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

  const closeTitleEdit = () => {
    setTitleSave({ pending: false, errorMessage: null })
    setActiveControl('idle')
  }

  const renameMeeting = async (nextTitle: string) => {
    setTitleSave({ pending: true, errorMessage: null })
    try {
      await controller.renameMeeting(nextTitle)
      closeTitleEdit()
      setLastAction('회의 제목을 변경했습니다.')
    } catch (error) {
      setTitleSave({
        pending: false,
        errorMessage:
          error instanceof Error && error.message
            ? error.message
            : '회의 제목을 변경하지 못했습니다.',
      })
    }
  }

  /** 서버 응답이 와야 시간이 맞춰지므로, 오가는 동안에는 버튼을 눌러도 아무 일이 없게 막는다. */
  const toggleRecording = async () => {
    if (isRecordingControlPending) return

    setIsRecordingControlPending(true)
    try {
      await controller.toggleRecording()
    } catch (error) {
      setRecordingControlError(
        error instanceof Error && error.message ? error.message : '회의 상태를 바꾸지 못했습니다.',
      )
      recordingControlToast.show()
    } finally {
      setIsRecordingControlPending(false)
    }
  }

  const saveMeeting = async () => {
    setActiveControl('saving')
    try {
      const completed = await controller.completeMeeting(projectContext)
      // 이후 이동은 저장된 기록이 들고 있다. 끝난 회의의 값을 탭에 남겨 둘 이유가 없다.
      clearMeetingProjectContext(meetingId)
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
            onToggleRecording: () => void toggleRecording(),
          },
          model: {
            elapsedSeconds: controller.elapsedSeconds,
            isHost: currentUserIsHost,
            meetingId,
            meetingTitle: controller.meetingTitle,
            participantCount: participants.length,
            projectTitle: projectContext.projectTitle,
            recordingState: controller.recordingState,
            recordingControlDisabled:
              controller.connectionState !== 'connected' || isRecordingControlPending,
          },
          moreMenuOpen: activeControl === 'more',
          moreMenuPopover: (
            <MeetingMoreMenu
              onClose={() => setActiveControl('idle')}
              onEditTitle={() => {
                setTitleSave({ pending: false, errorMessage: null })
                setActiveControl('edit-title')
              }}
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
      {controller.connectionNotice ? (
        <MeetingConnectionToast className="top-[106px]!" status={controller.connectionNotice} />
      ) : null}
      <MeetingTitleEditDialog
        currentTitle={controller.meetingTitle}
        errorMessage={titleSave.errorMessage}
        onCancel={closeTitleEdit}
        onSubmit={(nextTitle) => void renameMeeting(nextTitle)}
        open={activeControl === 'edit-title'}
        pending={titleSave.pending}
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
      {recordingControlToast.isMounted && recordingControlError ? (
        <Toast
          position="topCenter"
          title={recordingControlError}
          type="error"
          visible={recordingControlToast.isVisible}
        />
      ) : null}
      <MeetingEndedNoticeDialog onConfirm={returnToProject} open={controller.endedByServer} />
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
