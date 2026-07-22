import { Navigate, useParams } from 'react-router-dom'

import { isMeetingTutorialHidden } from '../features/meeting-tutorial'

export function MeetingStartPage() {
  const { meetingId = 'demo' } = useParams()
  const nextPage = isMeetingTutorialHidden() ? 'live' : 'tutorial'

  return <Navigate replace to={`/meetings/${encodeURIComponent(meetingId)}/${nextPage}`} />
}
