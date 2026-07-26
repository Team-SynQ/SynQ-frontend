import type { CompletedMeeting } from '../../../entities/meeting'
import { formatMeetingDate } from '../../../entities/meeting'
import chevronRightIcon from '../../../shared/assets/icons/chevron-right.svg'
import clipboardIcon from '../assets/clipboard.svg'
import decisionCheckIcon from '../assets/decision-check.svg'

type ProjectLatestMeetingSummaryProps = {
  meeting?: CompletedMeeting
  onOpenMeetingSummary?: (recordId: string) => void
}

export function ProjectLatestMeetingSummary({
  meeting,
  onOpenMeetingSummary,
}: ProjectLatestMeetingSummaryProps) {
  return (
    <section className="flex min-h-[300px] min-w-0 flex-col gap-s rounded-[16px] border-stroke-md border-line-default bg-surface-default p-m">
      <div className="flex items-center gap-xs">
        <img
          alt=""
          aria-hidden="true"
          className="size-[24px]"
          height="24"
          src={clipboardIcon}
          width="24"
        />
        <h3 className="m-0 typo-body-01 text-fg-primary">최신 회의 요약</h3>
      </div>

      {meeting ? (
        <div className="flex min-h-0 flex-1 flex-col gap-m">
          <div className="flex items-center justify-between gap-s">
            <div className="flex min-w-0 items-center gap-s">
              <strong className="truncate typo-body-02 text-fg-primary">
                {meeting.meetingTitle}
              </strong>
              <time
                className="shrink-0 typo-body-02 text-fg-secondary"
                dateTime={meeting.completedAt}
              >
                {formatMeetingDate(meeting.completedAt)}
              </time>
            </div>
            <button
              className="flex h-[32px] shrink-0 items-center gap-xs rounded-xs px-xs typo-body-02 text-fg-secondary hover:bg-overlay-dark-02"
              onClick={() => onOpenMeetingSummary?.(meeting.recordId)}
              type="button"
            >
              자세히 보기
              <span className="flex size-[24px] items-center justify-center">
                <img
                  alt=""
                  aria-hidden="true"
                  className="h-[12px] w-[7px]"
                  src={chevronRightIcon}
                />
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-xs">
            <p className="m-0 typo-body-02 text-fg-primary">{meeting.overview}</p>
            <div className="flex flex-wrap gap-xs">
              {meeting.keywords.map((keyword) => (
                <span
                  className="rounded-full bg-primary-100 px-s py-[4px] typo-caption text-brand-primary"
                  key={keyword}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <ul className="m-0 flex list-none flex-col gap-xs border-l-2 border-brand-primary pl-s">
            {meeting.decisions.map((decision) => (
              <li className="flex items-start gap-xs typo-body-02 text-fg-secondary" key={decision}>
                <img
                  alt=""
                  aria-hidden="true"
                  className="mt-[2px] size-[16px] shrink-0"
                  src={decisionCheckIcon}
                />
                <span>{decision}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="m-auto typo-body-01 text-gray-500">아직 회의 기록이 없습니다</p>
      )}
    </section>
  )
}
