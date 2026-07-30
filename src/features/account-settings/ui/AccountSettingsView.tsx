import { useId, useRef, useState } from 'react'

import moreVerticalIcon from '../../../shared/assets/icons/more-vertical.svg'
import plusIcon from '../../../shared/assets/icons/plus.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Badge, Button, Toast } from '../../../shared/ui'
import type { AccountPerspective, AccountPerspectiveDraft } from '../model/accountSettings.types'
import {
  AccountPerspectiveActionsMenu,
  AccountPerspectiveDeleteUnavailableDialog,
} from './AccountPerspectiveActionsMenu'
import { AccountPerspectiveAddDialog } from './AccountPerspectiveAddDialog'
import { AccountPerspectiveEditDialog } from './AccountPerspectiveEditDialog'
import { AccountNameEditDialog } from './AccountNameEditDialog'
import { ProfileImageEditor, type ProfileImageEditorProps } from './ProfileImageEditor'

export type AccountSettingsViewProps = {
  email: string
  name: string
  perspectives: AccountPerspective[]
  initialProfileImageUrl?: ProfileImageEditorProps['initialImageUrl']
  providerLabel?: string
  onAddPerspective?: (perspective: AccountPerspectiveDraft) => Promise<void> | void
  onDeletePerspective?: (perspectiveId: string) => Promise<void> | void
  onOpenPerspectiveMenu?: (perspectiveId: string) => void
  onSaveName?: (name: string) => Promise<void> | void
  onSetDefaultPerspective?: (perspectiveId: string) => void
  onUpdatePerspective?: (perspective: AccountPerspective) => Promise<void> | void
  onSaveProfileImage?: ProfileImageEditorProps['onSaveImage']
  onUploadProfileImage?: ProfileImageEditorProps['onUploadImage']
}

export function AccountSettingsView({
  email,
  initialProfileImageUrl,
  name,
  perspectives,
  providerLabel = 'Google 가입',
  onAddPerspective,
  onDeletePerspective,
  onOpenPerspectiveMenu,
  onSaveName,
  onSetDefaultPerspective,
  onUpdatePerspective,
  onSaveProfileImage,
  onUploadProfileImage,
}: AccountSettingsViewProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const deleteFeedback = useTransientVisibility()

  const handleSaveName = async (nextName: string) => {
    await onSaveName?.(nextName)
    setNameDialogOpen(false)
  }

  const handleDeletePerspective = async (perspectiveId: string) => {
    try {
      await onDeletePerspective?.(perspectiveId)
    } catch {
      return
    }

    deleteFeedback.show()
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col gap-l overflow-y-auto">
      <div className="flex flex-col gap-s">
        <h1 className="m-0 typo-title-01 text-fg-primary">계정 정보 및 보안</h1>
        <section className="flex flex-col gap-s" aria-labelledby="account-information-title">
          <h2 className="m-0 typo-title-02 text-fg-primary" id="account-information-title">
            계정 정보
          </h2>
          <div className="flex w-full items-center gap-m rounded-m border-stroke-md border-line-default p-m">
            <ProfileImageEditor
              initialImageUrl={initialProfileImageUrl}
              onSaveImage={onSaveProfileImage}
              onUploadImage={onUploadProfileImage}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-xs">
              <div className="flex w-full items-center gap-xl">
                <strong className="min-w-0 flex-1 truncate typo-title-02 text-fg-primary">
                  {name}
                </strong>
                <Button
                  className="w-[120px] border-line-default"
                  onClick={() => setNameDialogOpen(true)}
                  size="small"
                  variant="fillGray100"
                >
                  이름 변경
                </Button>
              </div>
              <div className="flex items-center gap-s">
                <span className="truncate typo-body-01 text-fg-primary">{email}</span>
                <Badge className="bg-overlay-dark-04 text-fg-secondary" size="small">
                  {providerLabel}
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-s" aria-labelledby="account-perspectives-title">
        <header className="flex items-center justify-between">
          <h2 className="m-0 typo-title-02 text-fg-primary" id="account-perspectives-title">
            역할·관점
          </h2>
          <Button
            className="w-[150px]"
            leftIcon={<img alt="" aria-hidden="true" className="size-[24px]" src={plusIcon} />}
            onClick={() => setAddDialogOpen(true)}
            size="medium"
            variant="primaryLine"
          >
            역할·관점 추가
          </Button>
        </header>

        <ul className="m-0 flex list-none flex-col gap-s p-0">
          {perspectives.map((perspective) => (
            <AccountPerspectiveRow
              key={perspective.id}
              onDeletePerspective={handleDeletePerspective}
              onOpenPerspectiveMenu={onOpenPerspectiveMenu}
              onSetDefaultPerspective={onSetDefaultPerspective}
              onUpdatePerspective={onUpdatePerspective}
              perspective={perspective}
              perspectiveCount={perspectives.length}
            />
          ))}
        </ul>
      </section>

      <AccountPerspectiveAddDialog
        onCancel={() => setAddDialogOpen(false)}
        onSubmit={(perspective) => onAddPerspective?.(perspective)}
        open={addDialogOpen}
      />
      <AccountNameEditDialog
        currentName={name}
        onCancel={() => setNameDialogOpen(false)}
        onSubmit={handleSaveName}
        open={nameDialogOpen}
      />
      {deleteFeedback.isMounted ? (
        <Toast
          description="역할·관점 삭제가 이루어졌습니다."
          position="topCenter"
          title="역할·관점 삭제 성공"
          type="success"
          visible={deleteFeedback.isVisible}
        />
      ) : null}
    </section>
  )
}

type AccountPerspectiveRowProps = Pick<
  AccountSettingsViewProps,
  | 'onDeletePerspective'
  | 'onOpenPerspectiveMenu'
  | 'onSetDefaultPerspective'
  | 'onUpdatePerspective'
> & {
  perspective: AccountPerspective
  perspectiveCount: number
}

function AccountPerspectiveRow({
  onDeletePerspective,
  onOpenPerspectiveMenu,
  onSetDefaultPerspective,
  onUpdatePerspective,
  perspective,
  perspectiveCount,
}: AccountPerspectiveRowProps) {
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteUnavailableOpen, setDeleteUnavailableOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleToggleMenu = () => {
    setMenuOpen((current) => {
      const nextOpen = !current
      if (nextOpen) onOpenPerspectiveMenu?.(perspective.id)
      return nextOpen
    })
  }

  const handleDelete = () => {
    if (perspective.isDefault || perspectiveCount <= 1) {
      setDeleteUnavailableOpen(true)
      return
    }

    void onDeletePerspective?.(perspective.id)
  }

  return (
    <li className="flex h-[72px] items-center gap-xl rounded-m border-stroke-md border-line-default px-m">
      <div className="flex min-w-0 flex-1 items-center gap-s">
        <span className="flex h-[40px] w-[75px] shrink-0 items-center justify-center overflow-hidden rounded-xs bg-surface-muted">
          <img
            alt=""
            aria-hidden="true"
            className="h-[40px] w-[75px] object-contain"
            height="40"
            src={perspective.icon}
            width="75"
          />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-xs">
          {perspective.isDefault ? <Badge size="extraSmall">기본 관점</Badge> : null}
          <strong className="shrink-0 truncate typo-body-02 text-fg-primary">
            {perspective.roleLabel}
          </strong>
          <span className="min-w-0 flex-1 truncate typo-body-02 text-fg-secondary">
            {perspective.focusDescription}
          </span>
        </span>
      </div>
      <Button
        aria-controls={menuId}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={`${perspective.roleLabel} 관점 더보기`}
        className="size-[32px] px-0"
        onClick={handleToggleMenu}
        ref={triggerRef}
        size="small"
        variant="basic"
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-[32px]"
          height="32"
          src={moreVerticalIcon}
          width="32"
        />
      </Button>

      <AccountPerspectiveActionsMenu
        canSetDefault={!perspective.isDefault}
        id={menuId}
        label={perspective.roleLabel}
        onClose={() => setMenuOpen(false)}
        onDelete={handleDelete}
        onEdit={() => setEditDialogOpen(true)}
        onSetDefault={() => onSetDefaultPerspective?.(perspective.id)}
        open={menuOpen}
        triggerRef={triggerRef}
      />
      <AccountPerspectiveDeleteUnavailableDialog
        onClose={() => setDeleteUnavailableOpen(false)}
        open={deleteUnavailableOpen}
      />
      <AccountPerspectiveEditDialog
        onCancel={() => setEditDialogOpen(false)}
        onSubmit={(nextPerspective) => onUpdatePerspective?.(nextPerspective)}
        open={editDialogOpen}
        perspective={perspective}
      />
    </li>
  )
}
