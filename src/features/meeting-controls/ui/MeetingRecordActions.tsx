import { useCallback, useRef, useState } from 'react'

import type { CompletedMeeting } from '../../../entities/meeting'
import burgerIcon from '../../../shared/assets/icons/burger.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { Toast } from '../../../shared/ui'
import { MeetingRecordActionsMenu } from './MeetingRecordActionsMenu'
import { MeetingRecordDeleteDialog } from './MeetingRecordDeleteDialog'
import { MeetingTitleEditDialog } from './MeetingTitleEditDialog'
import { MeetingTitleResultToast } from './MeetingTitleResultToast'

type MeetingRecordActionsProps = {
  meeting: CompletedMeeting
  /** 그 회의를 진행한 사람인지. 아니면 서버가 막으므로 미리 안내한다. */
  canManage?: boolean
  disabled?: boolean
  onDelete: (recordId: string) => Promise<void>
  onRename: (recordId: string, nextTitle: string) => Promise<void>
}

type ActiveLayer = 'menu' | 'edit' | 'delete' | null

type Feedback =
  | { action: 'rename'; result: 'success'; nextTitle: string }
  | { action: 'rename'; result: 'failure' }
  | { action: 'denied'; message: string }
  | null

const deniedMessages = {
  edit: '회의를 진행한 사람만 제목을 수정할 수 있어요.',
  delete: '회의를 진행한 사람만 기록을 삭제할 수 있어요.',
} as const

export function MeetingRecordActions({
  meeting,
  canManage = true,
  disabled = false,
  onDelete,
  onRename,
}: MeetingRecordActionsProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>(null)
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const feedbackVisibility = useTransientVisibility()
  const dismissMenu = useCallback(() => setActiveLayer(null), [])
  const visibleLayer = disabled ? null : activeLayer

  const handleRename = async (nextTitle: string) => {
    if (pending) return
    setPending(true)
    try {
      await onRename(meeting.recordId, nextTitle)
      setFeedback({ action: 'rename', result: 'success', nextTitle })
    } catch {
      setFeedback({ action: 'rename', result: 'failure' })
    } finally {
      setPending(false)
      setActiveLayer(null)
      feedbackVisibility.show()
    }
  }

  const handleDelete = async () => {
    if (pending) return
    setPending(true)
    try {
      await onDelete(meeting.recordId)
    } catch {
      // The stable history container owns deletion feedback because a successful
      // deletion unmounts this row.
    } finally {
      setPending(false)
      setActiveLayer(null)
    }
  }

  /** 권한이 없으면 모달을 열지 않고 메뉴만 닫은 뒤 안내한다. 눌러 보기 전에는 알 수 없기 때문이다. */
  const openLayer = (layer: 'edit' | 'delete') => {
    if (canManage) {
      setActiveLayer(layer)
      return
    }

    setActiveLayer(null)
    setFeedback({ action: 'denied', message: deniedMessages[layer] })
    feedbackVisibility.show()
  }

  const feedbackClassName = `transition-opacity duration-300 ${
    feedbackVisibility.isVisible ? 'opacity-100' : 'opacity-0'
  }`

  return (
    <>
      <button
        aria-expanded={visibleLayer === 'menu'}
        aria-haspopup="menu"
        aria-label={`${meeting.meetingTitle} 더보기`}
        className="flex size-[24px] self-center items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        onClick={() => setActiveLayer((current) => (current === 'menu' ? null : 'menu'))}
        ref={triggerRef}
        type="button"
      >
        <img alt="" aria-hidden="true" className="size-[24px]" src={burgerIcon} />
      </button>

      <MeetingRecordActionsMenu
        meetingTitle={meeting.meetingTitle}
        onDelete={() => openLayer('delete')}
        onDismiss={dismissMenu}
        onEditTitle={() => openLayer('edit')}
        open={visibleLayer === 'menu'}
        triggerRef={triggerRef}
      />
      <MeetingTitleEditDialog
        currentTitle={meeting.meetingTitle}
        onCancel={() => {
          if (!pending) setActiveLayer(null)
        }}
        onSubmit={handleRename}
        open={visibleLayer === 'edit'}
        pending={pending}
      />
      <MeetingRecordDeleteDialog
        meetingTitle={meeting.meetingTitle}
        onCancel={() => {
          if (!pending) setActiveLayer(null)
        }}
        onConfirm={handleDelete}
        open={visibleLayer === 'delete'}
        pending={pending}
      />

      {feedbackVisibility.isMounted && feedback?.action === 'rename' ? (
        feedback.result === 'success' ? (
          <MeetingTitleResultToast
            className={feedbackClassName}
            nextTitle={feedback.nextTitle}
            result="success"
          />
        ) : (
          <MeetingTitleResultToast className={feedbackClassName} result="failure" />
        )
      ) : null}

      {feedbackVisibility.isMounted && feedback?.action === 'denied' ? (
        <Toast
          className={feedbackClassName}
          position="topCenter"
          positionOffset={20}
          size="compact"
          title={feedback.message}
          type="error"
        />
      ) : null}
    </>
  )
}
