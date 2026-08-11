import { useId } from 'react'

import membersIcon from '../../../shared/assets/icons/members.svg'
import { Button, OverlayDialog } from '../../../shared/ui'

export type ProjectInviteStep = 'confirm' | 'approved' | 'rejected'

type ProjectInviteDialogProps = {
  step: ProjectInviteStep
  /** 초대 링크가 유효하지 않아 제목을 모르는 경우 null입니다. */
  projectTitle: string | null
  currentMemberCount?: number
  maxMemberCount?: number
  pending?: boolean
  onJoin: () => void
  onComplete: () => void
}

function resultTitle(step: 'approved' | 'rejected', projectTitle: string | null) {
  if (step === 'approved') return `‘${projectTitle ?? ''}’ 참여가 승인되었어요.`
  return projectTitle
    ? `‘${projectTitle}’ 참여가 승인되지 않았어요.`
    : '프로젝트 참여가 승인되지 않았어요.'
}

export function ProjectInviteDialog({
  step,
  projectTitle,
  currentMemberCount,
  maxMemberCount,
  pending = false,
  onJoin,
  onComplete,
}: ProjectInviteDialogProps) {
  const titleId = useId()

  return (
    <OverlayDialog className="max-w-[440px]! gap-l" open titleId={titleId}>
      {step === 'confirm' ? (
        <>
          <div className="flex flex-col gap-xs">
            <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
              {`‘${projectTitle ?? ''}’ 프로젝트에 참여하시겠습니까?`}
            </h2>
            <div className="flex min-h-[52px] items-center justify-end gap-xs py-xs">
              <img
                alt=""
                aria-hidden="true"
                className="size-[24px]"
                height="24"
                src={membersIcon}
                width="24"
              />
              <p
                aria-label={`현재 인원 ${currentMemberCount ?? 0}명, 최대 ${maxMemberCount ?? 0}명`}
                className="m-0 flex items-center gap-[2px] whitespace-nowrap"
              >
                <span aria-hidden="true" className="typo-body-02 text-fg-secondary">
                  {currentMemberCount ?? 0}
                </span>
                <span aria-hidden="true" className="typo-caption text-gray-500">
                  /
                </span>
                <span aria-hidden="true" className="typo-caption text-gray-500">
                  {maxMemberCount ?? 0}
                </span>
              </p>
            </div>
          </div>
          <Button aria-busy={pending} disabled={pending} fullWidth onClick={onJoin} size="large">
            참여 요청하기
          </Button>
        </>
      ) : (
        <>
          <h2 className="m-0 typo-title-02 text-fg-primary" id={titleId}>
            {resultTitle(step, projectTitle)}
          </h2>
          <Button fullWidth onClick={onComplete} size="large">
            {step === 'approved' ? '프로젝트 보기' : '확인'}
          </Button>
        </>
      )}
    </OverlayDialog>
  )
}
