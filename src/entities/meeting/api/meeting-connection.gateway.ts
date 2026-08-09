import { waitForMockApi } from '../../../shared/api/mock/lib/mockApi'

export type MeetingConnectionGateway = {
  restoreConnection(meetingId: number): Promise<void>
}

export const meetingConnectionGateway: MeetingConnectionGateway = {
  async restoreConnection() {
    await waitForMockApi()
  },
}
