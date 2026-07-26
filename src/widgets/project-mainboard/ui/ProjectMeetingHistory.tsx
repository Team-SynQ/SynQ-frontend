import {
  formatElapsedTime,
  formatMeetingDate,
  type CompletedMeeting,
} from '../../../entities/meeting'
import { meetingParticipantAvatars } from '../../../features/meeting-controls'
import burgerIcon from '../../../shared/assets/icons/burger.svg'

type ProjectMeetingHistoryProps = {
  meetings: CompletedMeeting[]
}

const historyGrid =
  'grid grid-cols-[minmax(0,1fr)_66px_66px_172px_24px] items-center gap-x-[60px] px-m'

export function ProjectMeetingHistory({ meetings }: ProjectMeetingHistoryProps) {
  return (
    <section className="flex min-h-0 flex-col gap-s">
      <h2 className="m-0 typo-title-02 text-fg-primary">회의 기록</h2>
      <div className="flex min-h-0 flex-col gap-xs">
        <div
          className={`${historyGrid} border-b border-line-default pb-s typo-body-01 text-gray-500`}
        >
          <span className="min-w-0">회의 이름</span>
          <span className="text-center">길이</span>
          <span className="text-center">생성일</span>
          <span>진행자</span>
          <span />
        </div>

        {meetings.length > 0 ? (
          <ul className="m-0 max-h-[360px] list-none overflow-y-auto p-0">
            {meetings.map((meeting) => (
              <li className={`${historyGrid} h-[72px] odd:bg-surface-muted`} key={meeting.recordId}>
                <div className="flex min-w-0 flex-col justify-center gap-xs">
                  <span className="truncate typo-body-01 text-fg-primary">
                    {meeting.meetingTitle}
                  </span>
                  <span className="truncate whitespace-pre typo-body-02 text-gray-500">
                    {meeting.keywords.join('  ·  ')}
                  </span>
                </div>
                <span className="text-center typo-body-02 text-fg-secondary">
                  {formatElapsedTime(meeting.durationSeconds)}
                </span>
                <time
                  className="text-center typo-body-02 text-fg-secondary"
                  dateTime={meeting.completedAt}
                >
                  {formatMeetingDate(meeting.completedAt)}
                </time>
                <span className="flex min-w-0 items-center gap-xs">
                  <img
                    alt=""
                    aria-hidden="true"
                    className="size-[32px] shrink-0 rounded-full"
                    src={meetingParticipantAvatars[meeting.host.avatarKey]}
                  />
                  <span className="truncate typo-body-02 text-fg-secondary">
                    {meeting.host.name}
                  </span>
                </span>
                <button
                  aria-disabled="true"
                  aria-label={`${meeting.meetingTitle} 더보기`}
                  className="flex size-[24px] items-center justify-center"
                  type="button"
                >
                  <img alt="" aria-hidden="true" className="size-[24px]" src={burgerIcon} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex h-[200px] items-center justify-center whitespace-pre-line text-center typo-body-01 text-gray-500">
            {'아직 회의 기록이 없습니다\n‘새 회의 시작’을 통해 기록을 시작해 보세요'}
          </p>
        )}
      </div>
    </section>
  )
}
