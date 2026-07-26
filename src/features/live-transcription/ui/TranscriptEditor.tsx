import { useEffect, useRef } from 'react'

import { Button } from '../../../shared/ui'
import type { TranscriptEditState } from '../model/transcript.types'
import { TranscriptFeedback } from './TranscriptFeedback'

type EditingTranscriptState = Extract<TranscriptEditState, { status: 'editing' }>

export type TranscriptEditorProps = {
  state: EditingTranscriptState
  onCancel?: () => void
  onChange?: (value: string) => void
  onSave?: () => void
}

export function TranscriptEditor({
  state,
  onCancel,
  onChange,
  onSave,
}: TranscriptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSave =
    state.draftText !== state.originalText &&
    state.draftText.trim().length > 0 &&
    !state.isSaving

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [state.draftText])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col gap-xs">
      <textarea
        aria-label="전사 내용"
        className="min-h-[42px] w-full resize-none overflow-hidden rounded-m border border-line-default bg-surface-default px-s py-xs typo-transcription-body-01 text-fg-primary outline-none focus:border-brand-primary"
        disabled={state.isSaving}
        onChange={(event) => onChange?.(event.target.value)}
        ref={textareaRef}
        rows={1}
        value={state.draftText}
      />
      {state.errorMessage ? <TranscriptFeedback message={state.errorMessage} /> : null}
      <div className="flex justify-end gap-xs">
        <Button disabled={state.isSaving} onClick={onCancel} size="small" variant="fillGray100">
          취소
        </Button>
        <Button disabled={!canSave} onClick={onSave} size="small" variant="primaryFill">
          확인
        </Button>
      </div>
    </div>
  )
}
