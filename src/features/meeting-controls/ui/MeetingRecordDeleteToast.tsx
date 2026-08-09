import { Toast } from '../../../shared/ui'

type MeetingRecordDeleteToastProps =
  | { result: 'success'; meetingTitle: string; className?: string }
  | { result: 'failure'; meetingTitle?: never; className?: string }

export function MeetingRecordDeleteToast(props: MeetingRecordDeleteToastProps) {
  if (props.result === 'success') {
    return (
      <Toast
        className={props.className}
        description={`‘${props.meetingTitle}’ 회의가 삭제되었습니다.`}
        position="topCenter"
        positionOffset={20}
        title="회의 기록 삭제 완료"
        type="success"
      />
    )
  }

  return (
    <Toast
      className={props.className}
      description="오류가 발생했습니다. 다시 시도해 주세요."
      position="topCenter"
      positionOffset={20}
      title="회의 기록 삭제 실패"
      type="error"
    />
  )
}
