import type { ReactNode, RefObject } from 'react'

import type { ProjectMember } from '../model/projectSettings.mock'
import projectInviteLinkAsset from '../assets/project-invite-link.svg'
import projectMemberCustomAsset from '../assets/project-member-custom.png'
import projectMemberDefaultBaseAsset from '../assets/project-member-default-base.svg'
import projectMemberDefaultGlyphAsset from '../assets/project-member-default-glyph.svg'
import projectMemberOutlineAsset from '../assets/project-member-outline.svg'
import projectMembersBodyAsset from '../assets/project-members-body.svg'
import projectMembersHeadAsset from '../assets/project-members-head.svg'
import closeIcon from '../../../shared/assets/icons/close.svg'
import editIcon from '../../../shared/assets/icons/edit.svg'
import trashIcon from '../../../shared/assets/icons/trash.svg'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'
import { Badge, Button } from '../../../shared/ui'

type ProjectMoreOptionsPopoverProps = {
  id?: string
  joinRequestCount: number
  members: ProjectMember[]
  open: boolean
  onClose: () => void
  onDeleteProject?: () => void
  onEditProject?: () => void
  onInviteMembers: () => void
  onManageMembers: () => void
  triggerRef?: RefObject<HTMLElement | null>
}

export function ProjectMoreOptionsPopover({
  id = 'project-more-options-popover',
  joinRequestCount,
  members,
  open,
  onClose,
  onDeleteProject,
  onEditProject,
  onInviteMembers,
  onManageMembers,
  triggerRef,
}: ProjectMoreOptionsPopoverProps) {
  const popoverRef = useDismissableLayer<HTMLDivElement>({
    open,
    onDismiss: onClose,
    triggerRef,
  })

  if (!open) return null

  const closeAndRestoreFocus = () => {
    onClose()
    window.setTimeout(() => triggerRef?.current?.focus(), 0)
  }

  const runAction = (action?: () => void) => {
    if (!action) return
    onClose()
    action()
  }

  return (
    <div
      aria-label="프로젝트 설정 및 멤버 관리"
      className="absolute right-0 top-0 z-40 flex max-h-[calc(100dvh-120px)] w-[340px] flex-col gap-l overflow-hidden rounded-l border-stroke-md border-line-default bg-surface-default p-m shadow-[0_4px_8px_rgb(0_0_0/0.12)]"
      id={id}
      ref={popoverRef}
      role="dialog"
    >
      <section
        className="flex min-h-0 flex-1 flex-col gap-s"
        aria-labelledby={`${id}-members-title`}
      >
        <header className="flex shrink-0 items-center gap-xs">
          <ProjectMembersIcon />
          <h2 className="m-0 shrink-0 typo-body-01 text-fg-primary" id={`${id}-members-title`}>
            멤버
          </h2>
          <div className="flex min-w-0 flex-1 items-center gap-[2px] whitespace-nowrap">
            <span className="typo-body-02 text-fg-secondary">{members.length}</span>
            <span className="typo-caption text-gray-500">/</span>
            <span className="typo-caption text-gray-500">10</span>
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
          <Button
            aria-label="프로젝트 설정 및 멤버 관리 닫기"
            className="size-[32px] px-0"
            onClick={closeAndRestoreFocus}
            size="small"
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
        </header>

        <ul className="m-0 flex min-h-[172px] max-h-[524px] flex-1 list-none flex-col gap-xs overflow-y-auto p-0">
          {members.map((member) => (
            <li className="flex min-h-[52px] items-center gap-xs py-xs" key={member.id}>
              <ProjectMemberAvatar custom={member.avatarType === 'custom'} id={member.id} />
              <span className="min-w-0 flex-1 truncate typo-body-01 text-fg-secondary">
                {member.name}
                {member.role ? `/${member.role}` : ''}
                {member.isCurrentUser ? ' (you)' : ''}
              </span>
              {member.isOwner ? <Badge size="extraSmall">소유자</Badge> : null}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="flex shrink-0 flex-col gap-s border-t border-line-default pt-s"
        aria-label="프로젝트 관리 메뉴"
      >
        <div className="flex flex-col gap-xs">
          <ProjectOptionAction
            icon={<ProjectMemberOutlineIcon />}
            label="멤버 관리"
            onClick={() => runAction(onManageMembers)}
            trailing={
              joinRequestCount > 0 ? <Badge size="small">{joinRequestCount}</Badge> : undefined
            }
          />
          <ProjectOptionAction
            icon={
              <img
                alt=""
                aria-hidden="true"
                className="size-[24px]"
                height="24"
                src={editIcon}
                width="24"
              />
            }
            label="프로젝트 정보 수정하기"
            onClick={() => runAction(onEditProject)}
          />
          <ProjectOptionAction
            icon={
              <span className="flex size-[24px] items-center justify-center">
                <img
                  alt=""
                  aria-hidden="true"
                  className="h-[16px] w-[14px]"
                  height="16"
                  src={trashIcon}
                  width="14"
                />
              </span>
            }
            label="프로젝트 삭제하기"
            onClick={() => runAction(onDeleteProject)}
          />
        </div>
      </section>
    </div>
  )
}

type ProjectOptionActionProps = {
  icon: ReactNode
  label: string
  onClick: () => void
  trailing?: ReactNode
}

function ProjectOptionAction({ icon, label, onClick, trailing }: ProjectOptionActionProps) {
  return (
    <Button
      aria-label={label}
      className="h-[52px] w-full justify-start! px-0 text-fg-secondary"
      leftIcon={icon}
      onClick={onClick}
      rightIcon={trailing}
      size="medium"
      variant="basic"
    >
      {label}
    </Button>
  )
}

function ProjectMembersIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative size-[28px] shrink-0 overflow-hidden"
      data-testid="project-members-icon"
    >
      <span className="absolute inset-[18.75%_36.11%_53.94%_36.57%]">
        <span className="absolute inset-[-10.46%]">
          <img
            alt=""
            className="size-full"
            height="9.24815"
            src={projectMembersHeadAsset}
            width="9.24815"
          />
        </span>
      </span>
      <span className="absolute left-[6px] top-[16px] h-[7px] w-[16px]">
        <span className="absolute inset-[-8.57%_-2.76%]">
          <img
            alt=""
            className="size-full"
            height="8.2"
            src={projectMembersBodyAsset}
            width="16.8828"
          />
        </span>
      </span>
    </span>
  )
}

export function ProjectInviteIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative size-[24px] shrink-0 overflow-hidden"
      data-testid="project-invite-icon"
    >
      <span className="absolute inset-[18.75%_20.54%_18.75%_20.86%]">
        <span className="absolute inset-[-4%_-4.27%]">
          <img
            alt=""
            className="size-full"
            height="16.2"
            src={projectInviteLinkAsset}
            width="15.2625"
          />
        </span>
      </span>
    </span>
  )
}

export function ProjectMemberAvatar({ custom, id }: { custom: boolean; id: string }) {
  if (custom) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className="size-[24px] shrink-0 rounded-full object-cover"
        data-testid={`project-member-avatar-${id}`}
        height="24"
        src={projectMemberCustomAsset}
        width="24"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="relative size-[24px] shrink-0 overflow-hidden rounded-full"
      data-testid={`project-member-avatar-${id}`}
    >
      <img
        alt=""
        className="absolute inset-0 size-[24px]"
        height="24"
        src={projectMemberDefaultBaseAsset}
        width="24"
      />
      <span className="absolute inset-[20.83%_12.5%_0_12.5%]">
        <img
          alt=""
          className="size-full"
          height="19"
          src={projectMemberDefaultGlyphAsset}
          width="18"
        />
      </span>
    </span>
  )
}

function ProjectMemberOutlineIcon() {
  return (
    <span aria-hidden="true" className="relative size-[24px] shrink-0 overflow-hidden">
      <span className="absolute left-1/2 top-[calc(50%-0.25px)] h-[14.5px] w-[12px] -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-[-4.14%_-5%]">
          <img
            alt=""
            className="size-full"
            height="15.7"
            src={projectMemberOutlineAsset}
            width="13.2001"
          />
        </span>
      </span>
    </span>
  )
}
