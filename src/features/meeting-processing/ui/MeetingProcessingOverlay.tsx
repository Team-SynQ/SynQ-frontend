import loaderIcon from '../assets/meeting-processing-loader.png'

type MeetingProcessingOverlayProps = {
  open: boolean
}

export function MeetingProcessingOverlay({ open }: MeetingProcessingOverlayProps) {
  if (!open) return null

  return (
    <div
      aria-label="회의 불러오는 중"
      aria-live="polite"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay-black-60"
      role="status"
    >
      <div className="flex flex-col items-center gap-s text-fg-inverse">
        <img
          alt=""
          aria-hidden="true"
          className="size-[56px] animate-spin"
          height="56"
          src={loaderIcon}
          width="56"
        />
        <span className="typo-body-01">회의 불러오는 중</span>
      </div>
    </div>
  )
}
