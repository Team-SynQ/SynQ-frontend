import { useId } from 'react'

import type { ProjectInvitationOwnerResponse } from '../../../shared/api/contracts/project.contracts'
import type { RoleProfileRole } from '../../../shared/api/contracts/user.contracts'
import { Badge, Button, OverlayDialog } from '../../../shared/ui'
import userIcon from '../assets/user.svg'

export type ProjectInviteStep = 'confirm' | 'approved' | 'rejected'

type ProjectInviteDialogProps = {
  step: ProjectInviteStep
  /** 초대 링크가 유효하지 않아 제목을 모르는 경우 null입니다. */
  projectTitle: string | null
  currentMemberCount?: number
  maxMemberCount?: number
  /** 프로젝트 소유자 정보입니다. 응답에 없으면 표시하지 않습니다. */
  owner?: ProjectInvitationOwnerResponse | null
  pending?: boolean
  onJoin: () => void
  onComplete: () => void
}

/** 서버 역할 enum의 화면 라벨입니다. 계정 설정 화면과 같은 표기를 씁니다. */
const ownerRoleLabels: Record<RoleProfileRole, string> = {
  PLANNING_OPERATION: '기획/운영',
  DESIGN_CONTENT: '디자인/콘텐츠',
  DEV_TECH: '개발/기술',
  MARKETING_BRANDING: '마케팅/브랜딩',
  SALES_CUSTOMER: '영업/고객',
  DATA_RESEARCH: '데이터/리서치',
  STRATEGY_MANAGEMENT: '경영/전략',
  ETC: '기타',
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
  owner,
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
            <div className="flex min-h-[52px] items-center justify-between gap-xs py-xs">
              {owner ? (
                <div
                  aria-label={`프로젝트 소유자 ${owner.name}`}
                  className="flex min-w-0 items-center gap-xs"
                >
                  {owner.profileImageUrl ? (
                    <img
                      alt=""
                      aria-hidden="true"
                      className="size-[24px] shrink-0 rounded-full object-cover"
                      height="24"
                      src={owner.profileImageUrl}
                      width="24"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-[24px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted"
                    >
                      <img alt="" className="size-[18px]" height="18" src={userIcon} width="18" />
                    </span>
                  )}
                  <span className="truncate typo-body-02 text-fg-primary">
                    {owner.roleCategory
                      ? `${owner.name}/${ownerRoleLabels[owner.roleCategory]}`
                      : owner.name}
                  </span>
                  <Badge className="shrink-0" size="extraSmall">
                    소유자
                  </Badge>
                </div>
              ) : (
                <span aria-hidden="true" />
              )}
              <div className="flex shrink-0 items-center gap-xs">
                <img
                  alt=""
                  aria-hidden="true"
                  className="size-[24px]"
                  height="24"
                  src={userIcon}
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
          </div>
          <Button
            aria-busy={pending}
            className="outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            disabled={pending}
            fullWidth
            onClick={onJoin}
            size="large"
          >
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
