import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfileImageEditor } from './ProfileImageEditor'

describe('ProfileImageEditor', () => {
  it('opens the Figma profile image menu from the edit button', async () => {
    const user = userEvent.setup()
    render(<ProfileImageEditor />)

    await user.click(screen.getByRole('button', { name: '프로필 이미지 수정' }))

    expect(screen.getByRole('menu', { name: '프로필 이미지 설정' })).toHaveClass(
      'w-[164px]',
      'p-xs',
    )
    expect(screen.getByRole('menuitem', { name: '프로필 이미지 변경' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '기본 이미지로 변경' })).toBeInTheDocument()
  })

  it('uploads and saves a supported image before showing success feedback', async () => {
    const user = userEvent.setup()
    const onUploadImage = vi.fn().mockResolvedValue('blob:profile-image')
    const onSaveImage = vi.fn().mockResolvedValue(undefined)
    render(<ProfileImageEditor onSaveImage={onSaveImage} onUploadImage={onUploadImage} />)

    await selectFile(user, new File(['image'], 'profile.png', { type: 'image/png' }))

    expect(onUploadImage).toHaveBeenCalledTimes(1)
    expect(onSaveImage).toHaveBeenCalledWith('blob:profile-image')
    expect(
      await screen.findByRole('status', { name: '프로필 이미지 변경 완료' }),
    ).toHaveTextContent('프로필 이미지가 변경되었습니다.')
    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveAttribute(
      'src',
      'blob:profile-image',
    )
  })

  it('rejects unsupported image formats', async () => {
    const onUploadImage = vi.fn()
    render(<ProfileImageEditor onUploadImage={onUploadImage} />)

    fireEvent.change(screen.getByLabelText('프로필 이미지 파일 선택'), {
      target: { files: [new File(['image'], 'profile.gif', { type: 'image/gif' })] },
    })

    expect(onUploadImage).not.toHaveBeenCalled()
    expect(
      await screen.findByRole('status', { name: '지원하지 않는 이미지 형식' }),
    ).toHaveTextContent('JPG, PNG, WEBP 형식의 이미지를 등록해 주세요.')
  })

  it('rejects images larger than 5MB', async () => {
    const user = userEvent.setup()
    const onUploadImage = vi.fn()
    render(<ProfileImageEditor onUploadImage={onUploadImage} />)

    await selectFile(
      user,
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'profile.webp', {
        type: 'image/webp',
      }),
    )

    expect(onUploadImage).not.toHaveBeenCalled()
    expect(await screen.findByRole('status', { name: '이미지 용량 초과' })).toHaveTextContent(
      '프로필 이미지는 5MB 이하로 등록해 주세요.',
    )
  })

  it('shows upload failure feedback when uploading rejects', async () => {
    const user = userEvent.setup()
    const onUploadImage = vi.fn().mockRejectedValue(new Error('upload failed'))
    render(<ProfileImageEditor onUploadImage={onUploadImage} />)

    await selectFile(user, new File(['image'], 'profile.jpg', { type: 'image/jpeg' }))

    expect(
      await screen.findByRole('status', { name: '프로필 이미지 업로드 실패' }),
    ).toHaveTextContent('이미지를 업로드하지 못했습니다. 다시 시도해 주세요.')
  })

  it('shows save failure feedback when saving rejects', async () => {
    const user = userEvent.setup()
    const onUploadImage = vi.fn().mockResolvedValue('blob:profile-image')
    const onSaveImage = vi.fn().mockRejectedValue(new Error('save failed'))
    render(<ProfileImageEditor onSaveImage={onSaveImage} onUploadImage={onUploadImage} />)

    await selectFile(user, new File(['image'], 'profile.jpg', { type: 'image/jpeg' }))

    expect(await screen.findByRole('status', { name: '프로필 저장 실패' })).toHaveTextContent(
      '프로필 정보를 저장하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(screen.queryByRole('img', { name: '프로필 이미지' })).not.toBeInTheDocument()
  })

  it('restores the default image and saves the change', async () => {
    const user = userEvent.setup()
    const onSaveImage = vi.fn().mockResolvedValue(undefined)
    render(<ProfileImageEditor initialImageUrl="blob:current-image" onSaveImage={onSaveImage} />)

    await user.click(screen.getByRole('button', { name: '프로필 이미지 수정' }))
    await user.click(screen.getByRole('menuitem', { name: '기본 이미지로 변경' }))

    await waitFor(() => expect(onSaveImage).toHaveBeenCalledWith())
    expect(screen.queryByRole('img', { name: '프로필 이미지' })).not.toBeInTheDocument()
    expect(
      await screen.findByRole('status', { name: '프로필 이미지 변경 완료' }),
    ).toBeInTheDocument()
  })
})

async function selectFile(user: ReturnType<typeof userEvent.setup>, file: File) {
  await user.click(screen.getByRole('button', { name: '프로필 이미지 수정' }))
  await user.click(screen.getByRole('menuitem', { name: '프로필 이미지 변경' }))
  await user.upload(screen.getByLabelText('프로필 이미지 파일 선택'), file)
}
