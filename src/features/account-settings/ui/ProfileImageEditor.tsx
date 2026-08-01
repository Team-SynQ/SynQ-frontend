import { useId, useRef, useState, type ChangeEvent } from 'react'

import editIcon from '../../../shared/assets/icons/edit.svg'
import { useDismissableLayer } from '../../../shared/lib/useDismissableLayer'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Button, Toast } from '../../../shared/ui'
import profileBase from '../assets/profile-default-base.svg'
import profileGlyph from '../assets/profile-default-glyph.svg'

const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
const PROFILE_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
const supportedProfileImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

type ProfileImageFeedback =
  'success' | 'unsupportedFormat' | 'sizeExceeded' | 'saveFailed' | 'uploadFailed'

const feedbackMessages: Record<
  ProfileImageFeedback,
  { description: string; title: string; type: 'success' | 'error' }
> = {
  success: {
    description: '프로필 이미지가 변경되었습니다.',
    title: '프로필 이미지 변경 완료',
    type: 'success',
  },
  unsupportedFormat: {
    description: 'JPG, PNG, WEBP 형식의 이미지를 등록해 주세요.',
    title: '지원하지 않는 이미지 형식',
    type: 'error',
  },
  sizeExceeded: {
    description: '프로필 이미지는 5MB 이하로 등록해 주세요.',
    title: '이미지 용량 초과',
    type: 'error',
  },
  saveFailed: {
    description: '프로필 정보를 저장하지 못했습니다. 다시 시도해 주세요.',
    title: '프로필 저장 실패',
    type: 'error',
  },
  uploadFailed: {
    description: '이미지를 업로드하지 못했습니다. 다시 시도해 주세요.',
    title: '프로필 이미지 업로드 실패',
    type: 'error',
  },
}

export type ProfileImageEditorProps = {
  initialImageUrl?: string
  onSaveImage?: (imageUrl?: string) => Promise<void> | void
  onUploadImage?: (file: File) => Promise<string | void> | string | void
}

export function ProfileImageEditor({
  initialImageUrl,
  onSaveImage,
  onUploadImage,
}: ProfileImageEditorProps) {
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [menuOpen, setMenuOpen] = useState(false)
  const [feedback, setFeedback] = useState<ProfileImageFeedback>()
  const feedbackToast = useTransientVisibility()
  const menuRef = useDismissableLayer<HTMLDivElement>({
    open: menuOpen,
    onDismiss: () => setMenuOpen(false),
    triggerRef,
  })

  const showFeedback = (nextFeedback: ProfileImageFeedback) => {
    setFeedback(nextFeedback)
    feedbackToast.show()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    if (!supportedProfileImageTypes.has(file.type)) {
      showFeedback('unsupportedFormat')
      return
    }

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      showFeedback('sizeExceeded')
      return
    }

    let nextImageUrl: string

    try {
      nextImageUrl = (await onUploadImage?.(file)) ?? (await readFileAsDataUrl(file))
    } catch {
      showFeedback('uploadFailed')
      return
    }

    try {
      await onSaveImage?.(nextImageUrl)
    } catch {
      showFeedback('saveFailed')
      return
    }

    setImageUrl(nextImageUrl)
    showFeedback('success')
  }

  const handleResetImage = async () => {
    setMenuOpen(false)

    try {
      await onSaveImage?.()
    } catch {
      showFeedback('saveFailed')
      return
    }

    setImageUrl(undefined)
    showFeedback('success')
  }

  const feedbackMessage = feedback ? feedbackMessages[feedback] : undefined

  return (
    <>
      <div className="relative flex shrink-0 items-end">
        <span className="relative mr-[-24px] size-[80px] shrink-0 overflow-hidden rounded-full">
          {imageUrl ? (
            <img
              alt="프로필 이미지"
              className="absolute inset-0 size-[80px] object-cover"
              height="80"
              src={imageUrl}
              width="80"
            />
          ) : (
            <>
              <img
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-[80px]"
                height="80"
                src={profileBase}
                width="80"
              />
              <span className="absolute inset-[20.83%_12.5%_0_12.5%]">
                <img
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full"
                  height="63.34"
                  src={profileGlyph}
                  width="60"
                />
              </span>
            </>
          )}
        </span>

        <Button
          aria-controls={menuId}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="프로필 이미지 수정"
          className="relative z-10 size-[42px] rounded-full! px-0"
          onClick={() => setMenuOpen((current) => !current)}
          ref={triggerRef}
          size="medium"
          variant="fillGray100"
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={editIcon} />
        </Button>

        {menuOpen ? (
          <div
            aria-label="프로필 이미지 설정"
            className="absolute left-[-16px] top-[calc(100%+8px)] z-20 flex w-[164px] flex-col rounded-[16px] border-stroke-md border-line-default bg-surface-default p-xs shadow-floating"
            id={menuId}
            ref={menuRef}
            role="menu"
          >
            <Button
              className="w-full justify-start! rounded-none! border-b border-line-default px-s"
              onClick={() => {
                setMenuOpen(false)
                fileInputRef.current?.click()
              }}
              role="menuitem"
              size="medium"
              variant="basic"
            >
              프로필 이미지 변경
            </Button>
            <Button
              className="w-full justify-start! rounded-none! px-s"
              onClick={() => void handleResetImage()}
              role="menuitem"
              size="medium"
              variant="basic"
            >
              기본 이미지로 변경
            </Button>
          </div>
        ) : null}

        <input
          accept={PROFILE_IMAGE_ACCEPT}
          aria-label="프로필 이미지 파일 선택"
          className="sr-only"
          onChange={(event) => void handleFileChange(event)}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {feedbackMessage && feedbackToast.isMounted ? (
        <Toast
          description={feedbackMessage.description}
          title={feedbackMessage.title}
          type={feedbackMessage.type}
          visible={feedbackToast.isVisible}
        />
      ) : null}
    </>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('The selected image could not be read.'))
      }
    })
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}
