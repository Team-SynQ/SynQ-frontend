import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  joinProjectByInviteToken,
  loadProjectInvitationInfo,
  ProjectInviteDialog,
  savePendingInviteToken,
} from '../features/project-invite'
import type { ProjectInvitationInfoResponse } from '../shared/api/contracts/project.contracts'
import { readAccessToken } from '../shared/lib/authStorage'

type InviteViewState =
  | { step: 'loading' }
  | { step: 'confirm'; info: ProjectInvitationInfoResponse }
  | { step: 'approved'; projectTitle: string; justJoined: boolean }
  | { step: 'rejected'; projectTitle: string | null }

export function ProjectInvitePage() {
  const { inviteToken = '' } = useParams()
  const navigate = useNavigate()
  const [viewState, setViewState] = useState<InviteViewState>({ step: 'loading' })
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let isSubscribed = true

    loadProjectInvitationInfo(inviteToken)
      .then((info) => {
        if (!isSubscribed) return
        setViewState(
          info.alreadyJoined
            ? { step: 'approved', projectTitle: info.title, justJoined: false }
            : { step: 'confirm', info },
        )
      })
      .catch(() => {
        if (!isSubscribed) return
        setViewState({ step: 'rejected', projectTitle: null })
      })

    return () => {
      isSubscribed = false
    }
  }, [inviteToken])

  const handleJoin = async () => {
    if (viewState.step !== 'confirm' || pending) return

    // 참여에는 로그인이 필요하므로, 토큰을 보관해 두고 로그인 후 이 화면으로 복귀합니다.
    if (!readAccessToken()) {
      savePendingInviteToken(inviteToken)
      navigate('/login')
      return
    }

    setPending(true)
    try {
      await joinProjectByInviteToken(inviteToken)
      setViewState({ step: 'approved', projectTitle: viewState.info.title, justJoined: true })
    } catch {
      setViewState({ step: 'rejected', projectTitle: viewState.info.title })
    } finally {
      setPending(false)
    }
  }

  // 방금 참여했다면 이 프로젝트에서 쓸 역할·관점 설정으로 이어집니다.
  const handleComplete = () => {
    if (viewState.step === 'approved' && viewState.justJoined) {
      navigate('/invite/setup/role', { state: { projectName: viewState.projectTitle } })
      return
    }
    navigate('/projects', { replace: true })
  }

  return (
    <main className="min-h-dvh w-full bg-surface-muted">
      {viewState.step !== 'loading' ? (
        <ProjectInviteDialog
          currentMemberCount={
            viewState.step === 'confirm' ? viewState.info.currentMemberCount : undefined
          }
          maxMemberCount={viewState.step === 'confirm' ? viewState.info.maxMemberCount : undefined}
          onComplete={handleComplete}
          onJoin={handleJoin}
          pending={pending}
          projectTitle={
            viewState.step === 'confirm' ? viewState.info.title : viewState.projectTitle
          }
          step={viewState.step}
        />
      ) : null}
    </main>
  )
}
