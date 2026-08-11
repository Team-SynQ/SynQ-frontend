import { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { ProjectSummary } from '../../../entities/project'

import {
  createProjectInviteLink,
  loadProjectMembers,
  removeProjectMember,
  type ProjectMemberList,
} from '../api/projectMembers.api'
import {
  PROJECT_JOIN_REQUEST_MOCK_FAILURE_IDS,
  PROJECT_MEMBER_LIMIT,
  projectJoinRequests,
  type ProjectJoinRequest,
  type ProjectMember,
} from '../model/projectSettings.mock'
import moreVerticalIcon from '../../../shared/assets/icons/more-vertical.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Button, Toast, type ToastType } from '../../../shared/ui'
import type {
  ProjectInformationDraft,
  ProjectInformationPerspective,
} from '../model/projectInformation.types'
import { ProjectInformationEditDialog } from './ProjectInformationEditDialog'
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
  loadMembers?: (projectId: number) => Promise<ProjectMemberList>
  createInviteLink?: (projectId: number) => Promise<string>
  exportMember?: (projectId: number, memberId: number) => Promise<void>
}

export function ProjectSettingsMenu({
  project,
  perspectiveOptions = [],
  onLoadProject,
  onUpdateProject,
  onDeleteProject,
  loadMembers = loadProjectMembers,
  createInviteLink = createProjectInviteLink,
  exportMember = removeProjectMember,
}: ProjectSettingsMenuProps) {
  const managementTitleId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isInformationOpen, setIsInformationOpen] = useState(false)
  const [informationProject, setInformationProject] = useState<ProjectSummary>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isManagementOpen, setIsManagementOpen] = useState(false)
  const [joinRequests, setJoinRequests] = useState(projectJoinRequests)
  const [memberList, setMemberList] = useState<ProjectMemberList>()
  const [exportCandidate, setExportCandidate] = useState<ProjectMember>()
  const [toastMessage, setToastMessage] = useState<SettingsToast>()
  const settingsToast = useTransientVisibility()
  const showSettingsToast = settingsToast.show

  const showToast = useCallback(
    (message: SettingsToast) => {
      setToastMessage(message)
      showSettingsToast()
    },
    [showSettingsToast],
  )

  const apiProjectId = project.apiProjectId
  const members = memberList?.members ?? []
  const maxMemberCount = memberList?.maxCount ?? PROJECT_MEMBER_LIMIT

  useEffect(() => {
    if (!isPopoverOpen) return

    let isSubscribed = true
    void loadMembers(apiProjectId)
      .then((list) => {
        if (!isSubscribed) return
        setMemberList(list)
      })
      .catch(() => {
        if (!isSubscribed) return
        showToast({
          title: '멤버 목록 조회 실패',
          description: '멤버 목록을 불러오지 못했습니다. 다시 시도해 주세요.',
          type: 'error',
        })
      })

    return () => {
      isSubscribed = false
    }
  }, [apiProjectId, isPopoverOpen, loadMembers, showToast])

  const handleCopyInviteLink = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API is unavailable')

      const inviteUrl = await createInviteLink(apiProjectId)
      await navigator.clipboard.writeText(inviteUrl)
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

    if (members.length >= maxMemberCount) {
      showToast({
        title: '프로젝트 최대 인원 도달',
        description: '프로젝트 최대 인원에 도달해 요청을 승인할 수 없습니다.',
        type: 'error',
      })
      return
    }

    setJoinRequests((current) => current.filter((item) => item.id !== request.id))
    setMemberList((current) => {
      if (!current) return current

      const approvedMember: ProjectMember = {
        id: `member-${request.id}`,
        name: request.name,
        role: request.role,
      }
      return {
        ...current,
        members: [...current.members, approvedMember],
        currentCount: current.currentCount + 1,
      }
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

  const handleConfirmMemberExport = async () => {
    if (!exportCandidate) return

    const memberId = Number(exportCandidate.id)
    const removedId = exportCandidate.id
    setExportCandidate(undefined)
    setIsManagementOpen(true)

    const removeFromList = () =>
      setMemberList((current) =>
        current
          ? {
              ...current,
              members: current.members.filter((member) => member.id !== removedId),
              currentCount: Math.max(0, current.currentCount - 1),
            }
          : current,
      )

    // 서버에 등록되지 않은 화면 전용 항목은 내보낼 대상이 없습니다.
    if (!Number.isInteger(memberId)) {
      removeFromList()
      return
    }

    try {
      await exportMember(apiProjectId, memberId)
      removeFromList()
      showToast({
        title: '멤버 삭제 성공',
        description: '멤버를 성공적으로 내보냈습니다.',
      })
    } catch {
      showToast({
        title: '멤버 삭제 실패',
        description: '멤버를 삭제하지 못했습니다. 다시 시도해 주세요.',
        type: 'error',
      })
    }
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
          maxMemberCount={maxMemberCount}
          memberCount={memberList?.currentCount}
          members={members}
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
        maxMemberCount={maxMemberCount}
        members={members}
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
        onConfirm={() => void handleConfirmMemberExport()}
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
