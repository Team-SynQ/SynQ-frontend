import { useId } from 'react'

import clipboardIcon from '../assets/clipboard.svg'
import { Button, OverlayDialog } from '../../../shared/ui'

export type MeetingSaveDialogProps =
  | {
      open: boolean
      state: 'saving'
    }
  | {
      open: boolean
      state: 'success'
      projectTitle: string
      meetingTitle: string
      onClose: () => void
    }
  | {
      open: boolean
      state: 'failure'
      onRetry: () => void
    }

export function MeetingSaveDialog(props: MeetingSaveDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  if (props.state === 'saving') {
    return (
      <OverlayDialog
        className="max-w-[440px] items-center gap-m px-l py-[40px] text-center"
        descriptionId={descriptionId}
        open={props.open}
        titleId={titleId}
      >
        <span
          aria-hidden="true"
          className="size-[48px] animate-spin rounded-full border-[5px] border-primary-100 border-t-brand-primary"
        />
        <h2 className="typo-title-01 text-fg-primary" id={titleId}>
          회의 내용을 저장하고 있습니다.
        </h2>
        <p className="typo-title-01 tracking-[6px] text-fg-secondary" id={descriptionId}>
          ...
        </p>
      </OverlayDialog>
    )
  }

  if (props.state === 'success') {
    return (
      <OverlayDialog
        className="max-w-[440px] items-center gap-m px-l py-[32px] text-center"
        open={props.open}
        titleId={titleId}
      >
        <img
          alt="저장 완료"
          className="size-[72px]"
          src={clipboardIcon}
        />
        <h2 className="typo-title-01 text-fg-primary" id={titleId}>
          회의가 종료되었습니다.
        </h2>
        <dl className="flex w-full flex-col gap-xs rounded-m bg-surface-muted p-m text-left">
          <div className="flex items-center gap-m">
            <dt className="w-[64px] shrink-0 typo-caption text-fg-secondary">프로젝트</dt>
            <dd className="min-w-0 truncate typo-body-02 text-fg-primary">{props.projectTitle}</dd>
          </div>
          <div className="flex items-center gap-m">
            <dt className="w-[64px] shrink-0 typo-caption text-fg-secondary">회의 제목</dt>
            <dd className="min-w-0 truncate typo-body-02 text-fg-primary">{props.meetingTitle}</dd>
          </div>
        </dl>
        <Button fullWidth onClick={props.onClose} size="large">
          닫기
        </Button>
      </OverlayDialog>
    )
  }

  return (
    <OverlayDialog
      className="max-w-[440px] items-center gap-m px-l py-[32px] text-center"
      open={props.open}
      titleId={titleId}
    >
      <span
        aria-hidden="true"
        className="flex size-[64px] items-center justify-center rounded-full bg-semantic-error text-fg-inverse"
      >
        <svg className="size-[30px]" fill="none" viewBox="0 0 30 30">
          <path d="M15 8v8" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          <path d="M15 21h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
        </svg>
      </span>
      <h2 className="sr-only" id={titleId}>회의 저장 실패</h2>
      <div className="typo-title-01 text-fg-primary">
        <p>회의 내용을 저장하지 못했습니다.</p>
        <p>다시 시도해 주세요.</p>
      </div>
      <Button fullWidth onClick={props.onRetry} size="large">
        다시 시도하기
      </Button>
    </OverlayDialog>
  )
}
