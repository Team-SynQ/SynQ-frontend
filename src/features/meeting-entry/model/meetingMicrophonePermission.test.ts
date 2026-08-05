import { afterEach, describe, expect, it, vi } from 'vitest'

import { requestMeetingMicrophonePermission } from './meetingMicrophonePermission'

describe('requestMeetingMicrophonePermission', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports unsupported when the browser has no microphone media API', async () => {
    vi.stubGlobal('navigator', {})

    await expect(requestMeetingMicrophonePermission()).resolves.toBe('unsupported')
  })

  it('reports denied when browser microphone access fails', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('denied', 'NotAllowedError')),
      },
    })

    await expect(requestMeetingMicrophonePermission()).resolves.toBe('denied')
  })

  it('stops the permission-check stream before reporting granted', async () => {
    const stopFirstTrack = vi.fn()
    const stopSecondTrack = vi.fn()
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopFirstTrack }, { stop: stopSecondTrack }],
        }),
      },
    })

    await expect(requestMeetingMicrophonePermission()).resolves.toBe('granted')
    expect(stopFirstTrack).toHaveBeenCalledOnce()
    expect(stopSecondTrack).toHaveBeenCalledOnce()
  })
})
