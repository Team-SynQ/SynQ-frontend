import { useState } from 'react'

import moreVerticalIcon from '../../../shared/assets/icons/more-vertical.svg'
import plusIcon from '../../../shared/assets/icons/plus.svg'
import { Badge, Button } from '../../../shared/ui'
import type { AccountPerspective } from '../model/accountSettings.types'
import { AccountNameEditDialog } from './AccountNameEditDialog'
import { ProfileImageEditor, type ProfileImageEditorProps } from './ProfileImageEditor'

export type AccountSettingsViewProps = {
  email: string
  name: string
  perspectives: AccountPerspective[]
  initialProfileImageUrl?: ProfileImageEditorProps['initialImageUrl']
  providerLabel?: string
  onAddPerspective?: () => void
  onOpenPerspectiveMenu?: (perspectiveId: string) => void
  onSaveName?: (name: string) => Promise<void> | void
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
  onOpenPerspectiveMenu,
  onSaveName,
  onSaveProfileImage,
  onUploadProfileImage,
}: AccountSettingsViewProps) {
  const [nameDialogOpen, setNameDialogOpen] = useState(false)

  const handleSaveName = async (nextName: string) => {
    await onSaveName?.(nextName)
    setNameDialogOpen(false)
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
            onClick={onAddPerspective}
            size="medium"
            variant="primaryLine"
          >
            역할·관점 추가
          </Button>
        </header>

        <ul className="m-0 flex list-none flex-col gap-s p-0">
          {perspectives.map((perspective) => (
            <li
              className="flex h-[72px] items-center gap-xl rounded-m border-stroke-md border-line-default px-m"
              key={perspective.id}
            >
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
                aria-label={`${perspective.roleLabel} 관점 더보기`}
                className="size-[32px] px-0"
                onClick={() => onOpenPerspectiveMenu?.(perspective.id)}
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
            </li>
          ))}
        </ul>
      </section>

      <AccountNameEditDialog
        currentName={name}
        onCancel={() => setNameDialogOpen(false)}
        onSubmit={handleSaveName}
        open={nameDialogOpen}
      />
    </section>
  )
}
