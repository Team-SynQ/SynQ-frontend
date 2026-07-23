import { Toast } from '../../../shared/ui'
import type { MeetingConnectionStatus } from '../model/meetingConnection.types'

export type MeetingConnectionToastProps = {
  status: MeetingConnectionStatus
  className?: string
}

const content: Record<MeetingConnectionStatus, { title: string; description: string }> = {
  unstable: {
    title: '연결 상태 불안정',
    description: '연결 상태가 불안정합니다. 다시 시도해주세요.',
  },
  restored: {
    title: '연결 완료',
    description: '정상적으로 연결되었습니다.',
  },
}

export function MeetingConnectionToast({
  status,
  className,
}: MeetingConnectionToastProps) {
  const toastContent = content[status]

  return (
    <Toast
      className={className}
      description={toastContent.description}
      position="topCenter"
      size="compact"
      title={toastContent.title}
      type={status === 'unstable' ? 'error' : 'success'}
    />
  )
}
