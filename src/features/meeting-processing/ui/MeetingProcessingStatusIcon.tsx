import loaderIcon from '../assets/meeting-processing-loader.png'
import successIcon from '../assets/meeting-processing-success.png'

type MeetingProcessingStatusIconProps = {
  status: 'processing' | 'completed'
}

export function MeetingProcessingStatusIcon({ status }: MeetingProcessingStatusIconProps) {
  const isProcessing = status === 'processing'

  return (
    <span
      aria-label={isProcessing ? '회의 기록 정리 중' : '회의 기록 정리 완료'}
      className="flex size-[28px] shrink-0 items-center justify-center"
      role="status"
    >
      <img
        alt=""
        aria-hidden="true"
        className={isProcessing ? 'size-[28px] animate-spin' : 'size-[28px]'}
        height="28"
        src={isProcessing ? loaderIcon : successIcon}
        width="28"
      />
    </span>
  )
}
