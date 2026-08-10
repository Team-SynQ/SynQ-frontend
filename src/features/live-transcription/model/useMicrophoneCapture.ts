import { useEffect, useRef, useState } from 'react'

/** 백엔드 STT 파이프라인이 기대하는 컨테이너·코덱. */
export const MICROPHONE_MIME_TYPE = 'audio/webm;codecs=opus'
/** 서버로 흘려보내는 오디오 청크 주기. */
export const MICROPHONE_CHUNK_INTERVAL_MS = 1000

export type MicrophoneCaptureStatus = 'idle' | 'starting' | 'recording' | 'paused' | 'error'
export type MicrophoneCaptureErrorReason =
  | 'unsupported'
  | 'mime-type-unsupported'
  | 'permission-denied'
  /** 녹음 도중 레코더가 죽거나 마이크 장치가 분리된 경우. */
  | 'recorder-failed'

type UseMicrophoneCaptureOptions = {
  /** 진행자이고 전송 채널이 열려 있을 때만 true. 마이크 확보와 해제를 결정한다. */
  enabled: boolean
  /** 녹음 세션은 유지한 채 청크 생성만 멈춘다. */
  paused?: boolean
  onChunk: (chunk: ArrayBuffer) => void
  onError?: (reason: MicrophoneCaptureErrorReason) => void
  mimeType?: string
  timesliceMs?: number
}

type UseMicrophoneCaptureResult = {
  status: MicrophoneCaptureStatus
  errorReason: MicrophoneCaptureErrorReason | null
}

/**
 * 진행자 기기의 마이크를 캡처해 일정 주기의 오디오 청크를 넘긴다.
 *
 * 일시정지에 MediaRecorder를 멈췄다가 새로 만들면 WebM 컨테이너 헤더가 스트림 중간에 다시 들어가
 * 서버 쪽 디코딩이 깨진다. 그래서 정지·재개는 pause()/resume()으로 처리해 하나의 녹음 세션을 유지한다.
 *
 * 회의 진입 전 권한 모달에서 이미 getUserMedia를 호출하지만 그때 스트림을 즉시 끊으므로 여기서 다시 잡는다.
 * 권한이 이미 승인된 상태라 사용자에게 프롬프트가 다시 뜨지는 않는다.
 */
export function useMicrophoneCapture({
  enabled,
  paused = false,
  onChunk,
  onError,
  mimeType = MICROPHONE_MIME_TYPE,
  timesliceMs = MICROPHONE_CHUNK_INTERVAL_MS,
}: UseMicrophoneCaptureOptions): UseMicrophoneCaptureResult {
  const [status, setStatus] = useState<MicrophoneCaptureStatus>('idle')
  const [errorReason, setErrorReason] = useState<MicrophoneCaptureErrorReason | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const onChunkRef = useRef(onChunk)
  const onErrorRef = useRef(onError)
  const pausedRef = useRef(paused)

  useEffect(() => {
    onChunkRef.current = onChunk
  }, [onChunk])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    let cancelled = false
    let stream: MediaStream | null = null
    let recorder: MediaRecorder | null = null

    const fail = (reason: MicrophoneCaptureErrorReason) => {
      setStatus('error')
      setErrorReason(reason)
      onErrorRef.current?.(reason)
    }

    const releaseStream = () => {
      stream?.getTracks().forEach((track) => track.stop())
      stream = null
    }

    // 상태 갱신은 effect 본문이 아니라 마이크로태스크에서 수행한다.
    void Promise.resolve().then(async () => {
      if (cancelled) return

      if (!enabled) {
        setStatus('idle')
        setErrorReason(null)
        return
      }

      setStatus('starting')
      setErrorReason(null)

      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        if (!cancelled) fail('unsupported')
        return
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (!cancelled) fail('mime-type-unsupported')
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        if (!cancelled) fail('permission-denied')
        return
      }

      if (cancelled) {
        releaseStream()
        return
      }

      recorder = new MediaRecorder(stream, { mimeType })
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size === 0) return
        void event.data.arrayBuffer().then((chunk) => {
          if (cancelled) return
          onChunkRef.current(chunk)
        })
      }
      // 녹음이 시작된 뒤 레코더가 죽거나 장치가 빠지면 ondataavailable만 조용히 멈춘다.
      // 진행자가 전사 중단을 알 수 있도록 오류로 올린다.
      recorder.onerror = () => {
        if (!cancelled) fail('recorder-failed')
      }
      stream.getTracks().forEach((track) => {
        track.onended = () => {
          if (!cancelled) fail('recorder-failed')
        }
      })
      recorder.start(timesliceMs)
      recorderRef.current = recorder
      // 정지 상태로 진입하면 첫 청크가 나가기 전에 멈춘다.
      if (pausedRef.current) recorder.pause()
      setStatus('recording')
    })

    return () => {
      cancelled = true
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      if (recorderRef.current === recorder) recorderRef.current = null
      recorder = null
      releaseStream()
    }
  }, [enabled, mimeType, timesliceMs])

  useEffect(() => {
    const recorder = recorderRef.current
    if (!recorder) return

    if (paused && recorder.state === 'recording') recorder.pause()
    if (!paused && recorder.state === 'paused') recorder.resume()
  }, [paused, status])

  return {
    status: paused && status === 'recording' ? 'paused' : status,
    errorReason,
  }
}
