import failureIcon from '../assets/meeting-processing-failure.svg'
import loaderIcon from '../assets/meeting-processing-loader.png'
import successIcon from '../assets/meeting-processing-success.png'

type MeetingProcessingStatusIconProps = {
  status: 'processing' | 'completed' | 'failed'
}

const statusIcon = {
  processing: loaderIcon,
  completed: successIcon,
  failed: failureIcon,
}

const statusLabel = {
  processing: '회의 기록 정리 중',
  completed: '회의 기록 정리 완료',
  failed: '회의 기록 정리 실패',
}

export function MeetingProcessingStatusIcon({ status }: MeetingProcessingStatusIconProps) {
  const isProcessing = status === 'processing'

  return (
    <span
      aria-label={statusLabel[status]}
      className="flex size-[28px] shrink-0 items-center justify-center"
      role="status"
    >
      <img
        alt=""
        aria-hidden="true"
        className={isProcessing ? 'size-[28px] animate-spin' : 'size-[28px]'}
        height="28"
        src={statusIcon[status]}
        width="28"
      />
    </span>
  )
}
