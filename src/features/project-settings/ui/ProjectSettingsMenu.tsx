import { useId, useRef, useState } from 'react'

import type { ProjectSummary } from '../../../entities/project'

import {
  PROJECT_INVITE_LINK,
  PROJECT_JOIN_REQUEST_MOCK_FAILURE_IDS,
  PROJECT_MEMBER_EXPORT_MOCK_FAILURE_ID,
  PROJECT_MEMBER_LIMIT,
  projectJoinRequests,
  projectManagementMembers,
  projectPopoverMembers,
  type ProjectJoinRequest,
  type ProjectMember,
} from '../model/projectSettings.mock'
import moreVerticalIcon from '../../../shared/assets/icons/more-vertical.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Button, Toast, type ToastType } from '../../../shared/ui'
import {
  ProjectInformationEditDialog,
  type ProjectInformationDraft,
  type ProjectInformationPerspective,
} from './ProjectInformationEditDialog'
import { ProjectDeleteDialog } from './ProjectDeleteDialog'
import { ProjectMemberExportDialog } from './ProjectMemberExportDialog'
import { ProjectMemberManagementDialog } from './ProjectMemberManagementDialog'
import { ProjectMoreOptionsPopover } from './ProjectMoreOptionsPopover'

type SettingsToast = {
  title: string
  description: string
  type?: ToastType
}

type ProjectSettingsMenuProps = {
  project: ProjectSummary
  perspectiveOptions?: ProjectInformationPerspective[]
  onLoadProject?: () => Promise<ProjectSummary | void> | ProjectSummary | void
  onUpdateProject?: (draft: ProjectInformationDraft) => Promise<void> | void
  onDeleteProject?: () => Promise<void> | void
}

export function ProjectSettingsMenu({
  project,
  perspectiveOptions = [],
  onLoadProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectSettingsMenuProps) {
  const managementTitleId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isInformationOpen, setIsInformationOpen] = useState(false)
  const [informationProject, setInformationProject] = useState<ProjectSummary>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isManagementOpen, setIsManagementOpen] = useState(false)
  const [joinRequests, setJoinRequests] = useState(projectJoinRequests)
  const [managementMembers, setManagementMembers] = useState(projectManagementMembers)
  const [exportCandidate, setExportCandidate] = useState<ProjectMember>()
  const [toastMessage, setToastMessage] = useState<SettingsToast>()
  const settingsToast = useTransientVisibility()

  const showToast = (message: SettingsToast) => {
    setToastMessage(message)
    settingsToast.show()
  }

  const handleCopyInviteLink = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API is unavailable')

      await navigator.clipboard.writeText(PROJECT_INVITE_LINK)
      showToast({
        title: '초대 링크 복사 완료',
        description: '링크를 복사 완료했습니다.',
      })
    } catch {
      showToast({
        title: '초대 링크 복사 실패',
        description: '링크를 복사하지 못했습니다. 다시 시도해 주세요.',
        type: 'error',
      })
    }
  }

  const handleOpenManagement = () => {
    setIsPopoverOpen(false)
    setIsManagementOpen(true)
  }

  const handleOpenInformation = async () => {
    setIsPopoverOpen(false)
    try {
      const loadedProject = await onLoadProject?.()
      setInformationProject(loadedProject ?? project)
      setIsInformationOpen(true)
    } catch {
      showToast({
        title: '프로젝트 설정 조회 실패',
        description: '프로젝트 설정을 불러오지 못했습니다. 다시 시도해 주세요.',
        type: 'error',
      })
    }
  }

  const handleCloseInformation = () => {
    setIsInformationOpen(false)
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }

  const handleUpdateProject = async (draft: ProjectInformationDraft) => {
    try {
      await onUpdateProject?.(draft)
      showToast({
        title: '프로젝트 설정 저장 완료',
        description: '프로젝트 설정이 저장 되었습니다.',
      })
    } catch (error) {
      showToast({
        title: '프로젝트 정보 저장 실패',
        description: '프로젝트 정보를 저장하지 못했습니다. 다시 시도해 주세요.',
        type: 'error',
      })
      throw error
    }
  }

  const handleOpenDelete = () => {
    setIsPopoverOpen(false)
    setIsDeleteOpen(true)
  }

  const handleCloseDelete = () => {
    setIsDeleteOpen(false)
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }

  const handleCloseManagement = () => {
    setIsManagementOpen(false)
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }

  const handleApproveRequest = (request: ProjectJoinRequest) => {
    if (request.id === PROJECT_JOIN_REQUEST_MOCK_FAILURE_IDS.approve) {
      showToast({
        title: '참여 요청 승인 실패',
        description: '참여 요청을 승인하지 못했습니다. 다시 시도해 주세요.',
        type: 'error',
      })
      return
    }

    if (managementMembers.length >= PROJECT_MEMBER_LIMIT) {
      showToast({
        title: '프로젝트 최대 인원 도달',
        description: '프로젝트 최대 인원에 도달해 요청을 승인할 수 없습니다.',
        type: 'error',
      })
      return
    }

    setJoinRequests((current) => current.filter((item) => item.id !== request.id))
    setManagementMembers((current) => {
      const approvedMember: ProjectMember = {
        id: `member-${request.id}`,
        name: request.name,
        role: request.role,
      }
      return [...current, approvedMember]
    })
    showToast({
      title: '멤버 승인 완료',
      description: '참여 요청을 승인했습니다.',
    })
  }

  const handleRejectRequest = (request: ProjectJoinRequest) => {
    if (request.id === PROJECT_JOIN_REQUEST_MOCK_FAILURE_IDS.reject) {
      showToast({
        title: '참여 요청 거절 실패',
        description: '참여 요청을 거절하지 못했습니다. 다시 시도해 주세요.',
        type: 'error',
      })
      return
    }

    setJoinRequests((current) => current.filter((item) => item.id !== request.id))
    showToast({
      title: '멤버 거절 완료',
      description: '참여 요청을 거절했습니다.',
    })
  }

  const handleRequestMemberExport = (member: ProjectMember) => {
    setIsManagementOpen(false)
    setExportCandidate(member)
  }

  const handleCancelMemberExport = () => {
    setExportCandidate(undefined)
    setIsManagementOpen(true)
  }

  const handleConfirmMemberExport = () => {
    if (!exportCandidate) return

    if (exportCandidate.id === PROJECT_MEMBER_EXPORT_MOCK_FAILURE_ID) {
      setExportCandidate(undefined)
      setIsManagementOpen(true)
      showToast({
        title: '멤버 삭제 실패',
        description: '멤버를 삭제하지 못했습니다. 다시 시도해 주세요.',
        type: 'error',
      })
      return
    }

    setManagementMembers((current) => current.filter((member) => member.id !== exportCandidate.id))
    setExportCandidate(undefined)
    setIsManagementOpen(true)
    showToast({
      title: '멤버 삭제 성공',
      description: '멤버를 성공적으로 내보냈습니다.',
    })
  }

  return (
    <>
      <div className="relative shrink-0">
        <Button
          aria-controls="project-more-options-popover"
          aria-expanded={isPopoverOpen}
          aria-haspopup="dialog"
          aria-label="프로젝트 더보기"
          className="size-[52px] px-0"
          onClick={() => setIsPopoverOpen((current) => !current)}
          ref={triggerRef}
          size="large"
          variant="fillGray100"
        >
          <img
            alt=""
            aria-hidden="true"
            className="size-[28px]"
            height="28"
            src={moreVerticalIcon}
            width="28"
          />
        </Button>

        <ProjectMoreOptionsPopover
          joinRequestCount={joinRequests.length}
          members={projectPopoverMembers}
          onClose={() => setIsPopoverOpen(false)}
          onInviteMembers={() => void handleCopyInviteLink()}
          onManageMembers={handleOpenManagement}
          onEditProject={() => void handleOpenInformation()}
          onDeleteProject={handleOpenDelete}
          open={isPopoverOpen}
          triggerRef={triggerRef}
        />
      </div>

      <ProjectInformationEditDialog
        onClose={handleCloseInformation}
        onSave={handleUpdateProject}
        open={isInformationOpen}
        perspectiveOptions={perspectiveOptions}
        project={informationProject ?? project}
      />

      <ProjectDeleteDialog
        onClose={handleCloseDelete}
        onDelete={() => onDeleteProject?.()}
        open={isDeleteOpen}
      />

      <ProjectMemberManagementDialog
        joinRequests={joinRequests}
        members={managementMembers}
        onApproveRequest={handleApproveRequest}
        onClose={handleCloseManagement}
        onExportMember={handleRequestMemberExport}
        onInviteMembers={() => void handleCopyInviteLink()}
        onRejectRequest={handleRejectRequest}
        open={isManagementOpen}
        titleId={managementTitleId}
      />

      <ProjectMemberExportDialog
        member={exportCandidate}
        onCancel={handleCancelMemberExport}
        onConfirm={handleConfirmMemberExport}
        open={Boolean(exportCandidate)}
      />

      {settingsToast.isMounted && toastMessage ? (
        <Toast
          className="top-[20px]! z-[70]!"
          description={toastMessage.description}
          position="topCenter"
          title={toastMessage.title}
          type={toastMessage.type}
          visible={settingsToast.isVisible}
        />
      ) : null}
    </>
  )
}
