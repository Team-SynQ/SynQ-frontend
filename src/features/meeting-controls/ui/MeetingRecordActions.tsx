import { useCallback, useRef, useState } from 'react'

import type { CompletedMeeting } from '../../../entities/meeting'
import burgerIcon from '../../../shared/assets/icons/burger.svg'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
import { MeetingRecordActionsMenu } from './MeetingRecordActionsMenu'
import { MeetingRecordDeleteDialog } from './MeetingRecordDeleteDialog'
import { MeetingTitleEditDialog } from './MeetingTitleEditDialog'
import { MeetingTitleResultToast } from './MeetingTitleResultToast'

type MeetingRecordActionsProps = {
  meeting: CompletedMeeting
  disabled?: boolean
  onDelete: (recordId: string) => Promise<void>
  onRename: (recordId: string, nextTitle: string) => Promise<void>
}

type ActiveLayer = 'menu' | 'edit' | 'delete' | null

type Feedback =
  | { action: 'rename'; result: 'success'; nextTitle: string }
  | { action: 'rename'; result: 'failure' }
  | null

export function MeetingRecordActions({
  meeting,
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
        onDelete={() => setActiveLayer('delete')}
        onDismiss={dismissMenu}
        onEditTitle={() => setActiveLayer('edit')}
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
    </>
  )
}
