import { useState } from 'react'

import {
  formatElapsedTime,
  formatMeetingDate,
  type CompletedMeeting,
} from '../../../entities/meeting'
import {
  MeetingRecordActions,
  MeetingRecordDeleteToast,
  meetingParticipantAvatars,
} from '../../../features/meeting-controls'
import {
  MeetingProcessingStatusIcon,
  type MeetingHistoryPresentation,
} from '../../../features/meeting-processing'
import { useTransientVisibility } from '../../../shared/lib/useTransientVisibility'
type ProjectMeetingHistoryProps = {
  meetings: CompletedMeeting[]
  presentation?: MeetingHistoryPresentation
  onOpenMeetingDetail?: (recordId: string) => void
  onDeleteMeeting?: (recordId: string) => Promise<void>
  onRenameMeeting?: (recordId: string, nextTitle: string) => Promise<void>
}

const historyHeaderGrid =
  'grid grid-cols-[minmax(0,1fr)_66px_66px_172px_24px] items-center gap-x-[60px] px-m'
const historyRowGrid = 'grid grid-cols-[minmax(0,1fr)_24px] items-stretch gap-x-[60px] px-m'
const historyContentGrid =
  'grid grid-cols-[minmax(0,1fr)_66px_66px_172px] items-center gap-x-[60px]'

export function ProjectMeetingHistory({
  meetings,
  presentation,
  onOpenMeetingDetail,
  onDeleteMeeting,
  onRenameMeeting,
}: ProjectMeetingHistoryProps) {
  const [deleteFeedback, setDeleteFeedback] = useState<
    { result: 'success'; meetingTitle: string } | { result: 'failure' } | null
  >(null)
  const deleteFeedbackVisibility = useTransientVisibility()

  const handleDeleteMeeting = async (meeting: CompletedMeeting) => {
    if (!onDeleteMeeting) return

    try {
      await onDeleteMeeting(meeting.recordId)
      setDeleteFeedback({ result: 'success', meetingTitle: meeting.meetingTitle })
    } catch (error) {
      setDeleteFeedback({ result: 'failure' })
      throw error
    } finally {
      deleteFeedbackVisibility.show()
    }
  }

  const deleteFeedbackClassName = `transition-opacity duration-300 ${
    deleteFeedbackVisibility.isVisible ? 'opacity-100' : 'opacity-0'
  }`

  return (
    <>
      <section className="flex min-h-0 flex-col gap-s">
        <h2 className="m-0 typo-title-02 text-fg-primary">회의 기록</h2>
        <div className="flex min-h-0 flex-col gap-xs">
          <div
            className={`${historyHeaderGrid} border-b border-line-default pb-s typo-body-01 text-gray-500`}
          >
            <span className="min-w-0">회의 이름</span>
            <span className="text-center">길이</span>
            <span className="text-center">생성일</span>
            <span>진행자</span>
            <span />
          </div>

          {meetings.length > 0 ? (
            <ul className="m-0 max-h-[360px] list-none overflow-y-auto p-0">
              {meetings.map((meeting) => {
                const status =
                  presentation?.recordId === meeting.recordId ? presentation.status : undefined

                return (
                  <li
                    className={`${historyRowGrid} h-[72px] odd:bg-surface-muted`}
                    key={meeting.recordId}
                  >
                    <button
                      aria-label={`${meeting.meetingTitle} 회의 기록 열기`}
                      className={`${historyContentGrid} min-w-0 rounded-xs text-left hover:bg-surface-muted focus-visible:bg-surface-muted`}
                      onClick={() => onOpenMeetingDetail?.(meeting.recordId)}
                      type="button"
                    >
                      <span className="flex min-w-0 items-center gap-xs">
                        {status ? <MeetingProcessingStatusIcon status={status} /> : null}
                        <span className="flex min-w-0 flex-1 flex-col justify-center gap-xs">
                          <span className="truncate typo-body-01 text-fg-primary">
                            {meeting.meetingTitle}
                          </span>
                          <span className="truncate whitespace-pre typo-body-02 text-gray-500">
                            {meeting.keywords.join('  ·  ')}
                          </span>
                        </span>
                      </span>
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
                    </button>
                    {onDeleteMeeting && onRenameMeeting ? (
                      <MeetingRecordActions
                        disabled={status === 'processing'}
                        meeting={meeting}
                        onDelete={() => handleDeleteMeeting(meeting)}
                        onRename={onRenameMeeting}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="flex h-[200px] items-center justify-center whitespace-pre-line text-center typo-body-01 text-gray-500">
              {'아직 회의 기록이 없습니다\n‘새 회의 시작’을 통해 기록을 시작해 보세요'}
            </p>
          )}
        </div>
      </section>

      {deleteFeedbackVisibility.isMounted && deleteFeedback ? (
        deleteFeedback.result === 'success' ? (
          <MeetingRecordDeleteToast
            className={deleteFeedbackClassName}
            meetingTitle={deleteFeedback.meetingTitle}
            result="success"
          />
        ) : (
          <MeetingRecordDeleteToast className={deleteFeedbackClassName} result="failure" />
        )
      ) : null}
    </>
  )
}
