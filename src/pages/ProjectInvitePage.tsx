import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  loadProjectInvitationInfo,
  ProjectInviteDialog,
  savePendingInviteToken,
} from '../features/project-invite'
import type { ProjectInvitationInfoResponse } from '../shared/api/contracts/project.contracts'
import { readAccessToken } from '../shared/lib/authStorage'

type InviteViewState =
  | { step: 'loading' }
  | { step: 'confirm'; info: ProjectInvitationInfoResponse }
  /** 이미 참여한 사람이 링크를 다시 연 경우입니다. */
  | { step: 'approved'; projectTitle: string }
  | { step: 'rejected'; projectTitle: string | null }

export function ProjectInvitePage() {
  const { inviteToken = '' } = useParams()
  const navigate = useNavigate()
  const [viewState, setViewState] = useState<InviteViewState>({ step: 'loading' })

  useEffect(() => {
    let isSubscribed = true

    loadProjectInvitationInfo(inviteToken)
      .then((info) => {
        if (!isSubscribed) return
        setViewState(
          info.alreadyJoined
            ? { step: 'approved', projectTitle: info.title }
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

  /**
   * 참여 요청에는 역할·관점이 함께 실려야 하므로 여기서 바로 요청을 보내지 않습니다.
   * 설정 3단계를 거친 뒤 마지막 화면에서 요청이 나갑니다.
   */
  const handleJoin = () => {
    if (viewState.step !== 'confirm') return

    // 참여에는 로그인이 필요하므로, 토큰을 보관해 두고 로그인 후 이 화면으로 복귀합니다.
    if (!readAccessToken()) {
      savePendingInviteToken(inviteToken)
      navigate('/login')
      return
    }

    navigate('/invite/setup/role', {
      state: {
        inviteToken,
        projectId: viewState.info.projectId,
        projectName: viewState.info.title,
      },
    })
  }

  const handleComplete = () => {
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
          owner={viewState.step === 'confirm' ? viewState.info.owner : undefined}
          onComplete={handleComplete}
          onJoin={handleJoin}
          projectTitle={
            viewState.step === 'confirm' ? viewState.info.title : viewState.projectTitle
          }
          step={viewState.step}
        />
      ) : null}
    </main>
  )
}
