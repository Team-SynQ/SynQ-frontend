import React from 'react'

import { Modal } from '../../../shared/ui/Modal'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <Modal
        type="confirm"
        title="로그아웃하시겠습니까?"
        cancelLabel="취소"
        confirmLabel="로그아웃하기"
        onCancel={onClose}
        onConfirm={onConfirm}
        className="w-[360px] !rounded-2xl"
      />
    </div>
  )
}
