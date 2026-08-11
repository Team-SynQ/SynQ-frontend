import { useEffect, useMemo } from 'react'

import type { LiveMeetingProjectContext } from '../../../entities/meeting'
import {
  readMeetingProjectContext,
  writeMeetingProjectContext,
} from './meetingProjectContext.storage'

/**
 * 회의 화면이 쓸 프로젝트 정보를 정한다.
 *
 * 회의 id로 프로젝트를 조회할 API가 없어서, 프로젝트 화면에서 넘어올 때 받은 값을 탭에 저장해 둔다.
 * 새로고침하면 라우터 state가 사라지므로 저장해 둔 값으로 복원한다.
 * 새 탭이나 링크 직접 접속은 저장된 값이 없어 복원되지 않는다. 그 경로는 막을 예정이라 대상이 아니다.
 */
export function useMeetingProjectContext(
  meetingId: string,
  fromRouterState: Partial<LiveMeetingProjectContext> | null,
): LiveMeetingProjectContext | null {
  const { projectId, projectTitle } = fromRouterState ?? {}
  const restored = useMemo(() => readMeetingProjectContext(meetingId), [meetingId])

  useEffect(() => {
    if (!projectId || projectTitle === undefined) return
    writeMeetingProjectContext(meetingId, { projectId, projectTitle })
  }, [meetingId, projectId, projectTitle])

  if (projectId && projectTitle !== undefined) return { projectId, projectTitle }
  return restored
}
