import { Toast } from '../../../shared/ui'

type MeetingTitleResultToastProps =
  | { result: 'success'; nextTitle: string; className?: string }
  | { result: 'failure'; nextTitle?: never; className?: string }

export function MeetingTitleResultToast(props: MeetingTitleResultToastProps) {
  if (props.result === 'success') {
    return (
      <Toast
        description={`'${props.nextTitle}' 으로 제목이 변경됐습니다.`}
        className={props.className}
        position="topCenter"
        title="회의 기록 제목 변경 성공"
        type="success"
      />
    )
  }

  return (
    <Toast
      description="오류가 발생했습니다. 다시 시도해 주세요."
      className={props.className}
      position="topCenter"
      title="회의 기록 제목 변경 실패"
      type="error"
    />
  )
}
