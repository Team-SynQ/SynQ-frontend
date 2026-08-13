import { useRef, useState } from 'react'

import {
  PROJECT_MEMBER_LIMIT,
  type ProjectJoinRequest,
  type ProjectMember,
} from '../model/projectSettings.mock'
import closeIcon from '../../../shared/assets/icons/close.svg'
import moreVerticalIcon from '../../../shared/assets/icons/more-vertical.svg'
import { Badge, Button, OverlayDialog } from '../../../shared/ui'
import { ProjectMemberActionMenu } from './ProjectMemberActionMenu'
import { ProjectInviteIcon, ProjectMemberAvatar } from './ProjectMoreOptionsPopover'

type ProjectMemberManagementDialogProps = {
  joinRequests: ProjectJoinRequest[]
  /** 처리 중인 요청. 응답을 기다리는 동안 그 행의 버튼을 잠급니다. */
  pendingRequestId?: string
  members: ProjectMember[]
  maxMemberCount?: number
  onApproveRequest: (request: ProjectJoinRequest) => void
  onClose: () => void
  onExportMember: (member: ProjectMember) => void
  onInviteMembers: () => void
  onRejectRequest: (request: ProjectJoinRequest) => void
  open: boolean
  titleId: string
}

export function ProjectMemberManagementDialog({
  joinRequests,
  pendingRequestId,
  members,
  maxMemberCount = PROJECT_MEMBER_LIMIT,
  onApproveRequest,
  onClose,
  onExportMember,
  onInviteMembers,
  onRejectRequest,
  open,
  titleId,
}: ProjectMemberManagementDialogProps) {
  return (
    <OverlayDialog
      className="relative h-[680px] max-h-[calc(100dvh-48px)] max-w-[460px]! gap-m overflow-hidden px-m py-l shadow-floating"
      closeOnEscape
      onClose={onClose}
      open={open}
      titleId={titleId}
    >
      <h2 className="m-0 text-center typo-title-02 text-fg-primary" id={titleId}>
        멤버 관리
      </h2>

      <div className="flex min-h-0 flex-1 flex-col gap-l">
        <section className="flex shrink-0 flex-col gap-xs" aria-labelledby={`${titleId}-requests`}>
          <header className="flex items-center gap-xs px-xs">
            <h3 className="m-0 typo-body-01 text-fg-primary" id={`${titleId}-requests`}>
              참여 요청
            </h3>
            {joinRequests.length > 0 ? (
              <Badge size="extraSmall">{joinRequests.length}</Badge>
            ) : null}
          </header>

          <div className="flex min-h-[58px] max-h-[172px] flex-col gap-xs overflow-y-auto">
            {joinRequests.length > 0 ? (
              joinRequests.map((request) => (
                <div
                  className="flex min-h-[42px] items-center gap-xs"
                  data-testid={`project-join-request-${request.id}`}
                  key={request.id}
                >
                  <ProjectMemberAvatar custom={false} id={request.id} />
                  <span className="min-w-0 flex-1 truncate typo-body-01 text-fg-secondary">
                    {request.name}
                  </span>
                  <time className="shrink-0 typo-caption text-gray-500">{request.requestedAt}</time>
                  <div className="flex shrink-0 gap-xs">
                    <Button
                      disabled={pendingRequestId === request.id}
                      onClick={() => onRejectRequest(request)}
                      size="small"
                      variant="fillGray100"
                    >
                      거절
                    </Button>
                    <Button
                      disabled={pendingRequestId === request.id}
                      onClick={() => onApproveRequest(request)}
                      size="small"
                    >
                      승인
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="m-0 flex min-h-[58px] items-center justify-center px-s text-center typo-body-01 text-gray-500">
                아직 받은 참여 요청이 없습니다
              </p>
            )}
          </div>
        </section>

        <section
          className="flex min-h-0 flex-1 flex-col gap-xs"
          aria-labelledby={`${titleId}-members`}
        >
          <header className="flex items-center gap-xs px-xs">
            <h3 className="m-0 typo-body-01 text-fg-primary" id={`${titleId}-members`}>
              참여중인 멤버
            </h3>
            <div className="flex min-w-0 flex-1 items-center gap-[2px] whitespace-nowrap">
              <span className="typo-body-02 text-fg-secondary">{members.length}</span>
              <span className="typo-caption text-gray-500">/</span>
              <span className="typo-caption text-gray-500">{maxMemberCount}</span>
            </div>
            <Button
              className="h-[32px] px-xs text-brand-primary! hover:bg-primary-100 hover:text-brand-primary!"
              leftIcon={<ProjectInviteIcon />}
              onClick={onInviteMembers}
              size="small"
              variant="basic"
            >
              초대
            </Button>
          </header>

          <ul className="m-0 flex min-h-[172px] flex-1 list-none flex-col gap-xs overflow-y-auto rounded-m bg-surface-muted p-s">
            {members.map((member) => (
              <li
                className="flex min-h-[42px] items-center gap-xs py-xs"
                data-testid={`project-member-row-${member.id}`}
                key={member.id}
              >
                <ProjectMemberAvatar custom={member.avatarType === 'custom'} id={member.id} />
                <span className="min-w-0 flex-1 truncate typo-body-01 text-fg-secondary">
                  {member.name}
                  {member.role ? `/${member.role}` : ''}
                  {member.isCurrentUser ? ' (you)' : ''}
                </span>
                {member.isOwner ? (
                  <Badge className="bg-overlay-dark-04 text-fg-secondary" size="extraSmall">
                    소유자
                  </Badge>
                ) : (
                  <ProjectMemberMenuButton member={member} onExport={onExportMember} />
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Button
        aria-label="멤버 관리 닫기"
        className="absolute right-[15px] top-[15px] size-[42px] px-0"
        onClick={onClose}
        size="medium"
        variant="basic"
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-[24px]"
          height="24"
          src={closeIcon}
          width="24"
        />
      </Button>
    </OverlayDialog>
  )
}

type ProjectMemberMenuButtonProps = {
  member: ProjectMember
  onExport: (member: ProjectMember) => void
}

function ProjectMemberMenuButton({ member, onExport }: ProjectMemberMenuButtonProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = `project-member-menu-${member.id}`

  return (
    <div className="relative shrink-0">
      <Button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${member.name} 멤버 관리`}
        className="size-[32px] px-0"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        size="small"
        variant="basic"
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-[24px]"
          height="24"
          src={moreVerticalIcon}
          width="24"
        />
      </Button>
      <ProjectMemberActionMenu
        id={menuId}
        memberName={member.name}
        onClose={() => setOpen(false)}
        onExport={() => onExport(member)}
        open={open}
        triggerRef={triggerRef}
      />
    </div>
  )
}
