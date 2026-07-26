import { Navigate, useLocation, useParams } from 'react-router-dom'

import { isMeetingTutorialHidden } from '../features/meeting-tutorial'

export function MeetingStartPage() {
  const location = useLocation()
  const { meetingId = 'demo' } = useParams()
  const nextPage = isMeetingTutorialHidden() ? 'live' : 'tutorial'

  return (
    <Navigate
      replace
      state={location.state}
      to={`/meetings/${encodeURIComponent(meetingId)}/${nextPage}`}
    />
  )
}
