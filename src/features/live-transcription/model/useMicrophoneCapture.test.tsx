import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMicrophoneCapture } from './useMicrophoneCapture'

type RecorderInstance = {
  state: string
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  resume: ReturnType<typeof vi.fn>
  ondataavailable: ((event: { data: Blob }) => void) | null
  onerror: (() => void) | null
  mimeType: string
}

type FakeTrack = { stop: ReturnType<typeof vi.fn>; onended: (() => void) | null }

const recorderInstances: RecorderInstance[] = []
const trackInstances: FakeTrack[] = []
const stopTrack = vi.fn()

function createStream() {
  const track: FakeTrack = { stop: stopTrack, onended: null }
  trackInstances.push(track)
  return { getTracks: () => [track] } as unknown as MediaStream
}

function installMediaRecorder(isTypeSupported = true) {
  class FakeMediaRecorder {
    static isTypeSupported = vi.fn().mockReturnValue(isTypeSupported)
    state = 'inactive'
    ondataavailable: ((event: { data: Blob }) => void) | null = null
    onerror: (() => void) | null = null
    mimeType: string
    start = vi.fn(() => {
      this.state = 'recording'
    })
    stop = vi.fn(() => {
      this.state = 'inactive'
    })
    pause = vi.fn(() => {
      this.state = 'paused'
    })
    resume = vi.fn(() => {
      this.state = 'recording'
    })

    constructor(_stream: MediaStream, options: { mimeType: string }) {
      this.mimeType = options.mimeType
      recorderInstances.push(this as unknown as RecorderInstance)
    }
  }

  vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
}

function installMediaDevices(getUserMedia = vi.fn().mockResolvedValue(createStream())) {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  })
  return getUserMedia
}

describe('useMicrophoneCapture', () => {
  beforeEach(() => {
    recorderInstances.length = 0
    trackInstances.length = 0
    stopTrack.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('활성화되면 마이크를 잡고 지정한 주기로 녹음을 시작한다', async () => {
    installMediaRecorder()
    const getUserMedia = installMediaDevices()

    const { result } = renderHook(() =>
      useMicrophoneCapture({ enabled: true, onChunk: vi.fn(), timesliceMs: 1000 }),
    )

    await waitFor(() => expect(result.current.status).toBe('recording'))
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(recorderInstances[0].mimeType).toBe('audio/webm;codecs=opus')
    expect(recorderInstances[0].start).toHaveBeenCalledWith(1000)
  })

  it('오디오 청크를 ArrayBuffer로 전달한다', async () => {
    installMediaRecorder()
    installMediaDevices()
    const onChunk = vi.fn()

    const { result } = renderHook(() => useMicrophoneCapture({ enabled: true, onChunk }))
    await waitFor(() => expect(result.current.status).toBe('recording'))

    const buffer = new ArrayBuffer(8)
    recorderInstances[0].ondataavailable?.({
      data: { size: 8, arrayBuffer: async () => buffer } as unknown as Blob,
    })

    await waitFor(() => expect(onChunk).toHaveBeenCalledWith(buffer))
  })

  it('빈 청크는 전달하지 않는다', async () => {
    installMediaRecorder()
    installMediaDevices()
    const onChunk = vi.fn()

    const { result } = renderHook(() => useMicrophoneCapture({ enabled: true, onChunk }))
    await waitFor(() => expect(result.current.status).toBe('recording'))

    recorderInstances[0].ondataavailable?.({
      data: { size: 0, arrayBuffer: async () => new ArrayBuffer(0) } as unknown as Blob,
    })

    expect(onChunk).not.toHaveBeenCalled()
  })

  it('비활성화되면 녹음을 멈추고 스트림을 정리한다', async () => {
    installMediaRecorder()
    installMediaDevices()

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useMicrophoneCapture({ enabled, onChunk: vi.fn() }),
      { initialProps: { enabled: true } },
    )
    await waitFor(() => expect(result.current.status).toBe('recording'))

    rerender({ enabled: false })

    expect(recorderInstances[0].stop).toHaveBeenCalled()
    expect(stopTrack).toHaveBeenCalled()
    await waitFor(() => expect(result.current.status).toBe('idle'))
  })

  it('언마운트하면 스트림을 정리한다', async () => {
    installMediaRecorder()
    installMediaDevices()

    const { result, unmount } = renderHook(() =>
      useMicrophoneCapture({ enabled: true, onChunk: vi.fn() }),
    )
    await waitFor(() => expect(result.current.status).toBe('recording'))

    unmount()

    expect(stopTrack).toHaveBeenCalled()
  })

  it('일시정지하면 레코더를 새로 만들지 않고 pause만 호출한다', async () => {
    installMediaRecorder()
    installMediaDevices()

    const { result, rerender } = renderHook(
      ({ paused }: { paused: boolean }) =>
        useMicrophoneCapture({ enabled: true, paused, onChunk: vi.fn() }),
      { initialProps: { paused: false } },
    )
    await waitFor(() => expect(result.current.status).toBe('recording'))

    rerender({ paused: true })

    expect(recorderInstances).toHaveLength(1)
    expect(recorderInstances[0].pause).toHaveBeenCalled()
    expect(recorderInstances[0].stop).not.toHaveBeenCalled()
    expect(stopTrack).not.toHaveBeenCalled()
    expect(result.current.status).toBe('paused')
  })

  it('재개하면 같은 녹음 세션을 이어간다', async () => {
    installMediaRecorder()
    installMediaDevices()

    const { result, rerender } = renderHook(
      ({ paused }: { paused: boolean }) =>
        useMicrophoneCapture({ enabled: true, paused, onChunk: vi.fn() }),
      { initialProps: { paused: false } },
    )
    await waitFor(() => expect(result.current.status).toBe('recording'))

    rerender({ paused: true })
    rerender({ paused: false })

    // 새 레코더를 만들면 WebM 헤더가 스트림 중간에 다시 들어가 서버 디코딩이 깨진다.
    expect(recorderInstances).toHaveLength(1)
    expect(recorderInstances[0].resume).toHaveBeenCalled()
    expect(recorderInstances[0].start).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('recording')
  })

  it('녹음 중 레코더가 죽으면 recorder-failed로 알린다', async () => {
    installMediaRecorder()
    installMediaDevices()
    const onError = vi.fn()

    const { result } = renderHook(() =>
      useMicrophoneCapture({ enabled: true, onChunk: vi.fn(), onError }),
    )
    await waitFor(() => expect(result.current.status).toBe('recording'))

    recorderInstances[0].onerror?.()

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.errorReason).toBe('recorder-failed')
    expect(onError).toHaveBeenCalledWith('recorder-failed')
  })

  it('마이크 장치가 분리되면 recorder-failed로 알린다', async () => {
    installMediaRecorder()
    installMediaDevices()

    const { result } = renderHook(() => useMicrophoneCapture({ enabled: true, onChunk: vi.fn() }))
    await waitFor(() => expect(result.current.status).toBe('recording'))

    trackInstances[0].onended?.()

    await waitFor(() => expect(result.current.errorReason).toBe('recorder-failed'))
  })

  it('권한이 거부되면 permission-denied로 알린다', async () => {
    installMediaRecorder()
    installMediaDevices(vi.fn().mockRejectedValue(new DOMException('denied', 'NotAllowedError')))
    const onError = vi.fn()

    const { result } = renderHook(() =>
      useMicrophoneCapture({ enabled: true, onChunk: vi.fn(), onError }),
    )

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.errorReason).toBe('permission-denied')
    expect(onError).toHaveBeenCalledWith('permission-denied')
  })

  it('지원하지 않는 코덱이면 mime-type-unsupported로 알린다', async () => {
    installMediaRecorder(false)
    installMediaDevices()

    const { result } = renderHook(() => useMicrophoneCapture({ enabled: true, onChunk: vi.fn() }))

    await waitFor(() => expect(result.current.errorReason).toBe('mime-type-unsupported'))
  })

  it('마이크 API가 없으면 unsupported로 알린다', async () => {
    installMediaRecorder()
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined })

    const { result } = renderHook(() => useMicrophoneCapture({ enabled: true, onChunk: vi.fn() }))

    await waitFor(() => expect(result.current.errorReason).toBe('unsupported'))
  })
})
