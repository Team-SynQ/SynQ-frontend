import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { meetingAiMockGateway, meetingApi } from '../../../entities/meeting'
import type {
  MeetingAiChatMessageResponse,
  TranscriptHintResponse,
  TranscriptSegmentResponse,
} from '../../../shared/api/contracts/meeting.contracts'
import { resetLiveMeetingMockDb } from '../../../shared/api/mock/db/liveMeeting.mockDb'
import { useLiveMeetingController } from './useLiveMeetingController'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, reject, resolve }
}

async function renderReadyController(meetingId = 'demo') {
  const hook = renderHook(
    ({ currentMeetingId }: { currentMeetingId: string }) =>
      useLiveMeetingController(currentMeetingId),
    { initialProps: { currentMeetingId: meetingId } },
  )

  await waitFor(() => expect(hook.result.current.status).toBe('ready'))
  return hook
}

describe('useLiveMeetingController async boundaries', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetLiveMeetingMockDb()
  })

  it('keeps the AI draft and pinned context while exposing a controlled send error', async () => {
    vi.spyOn(meetingAiMockGateway, 'sendMeetingAiQuestion').mockRejectedValue(
      new Error('AI_SEND_FAILED'),
    )
    const { result } = await renderReadyController()

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onAskAi?.('segment-1')
      result.current.aiChat.actions.onDraftChange('이 문장이 일정에 미치는 영향은?')
    })
    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.aiChat.actions.onSend()
    })

    await waitFor(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      expect(result.current.aiChat.model.sendError).toBe(
        'AI 답변을 불러오지 못했습니다. 다시 시도해 주세요.',
      )
    })
    if (result.current.status !== 'ready') throw new Error('controller is not ready')
    expect(result.current.aiChat.model.draft).toBe('이 문장이 일정에 미치는 영향은?')
    expect(result.current.aiChat.model.pinnedContext?.transcriptId).toBe('segment-1')
  })

  it('ignores edit and AI responses from the previous meeting session', async () => {
    const updateRequest = deferred<TranscriptSegmentResponse>()
    const sendRequest = deferred<MeetingAiChatMessageResponse>()
    const updateSpy = vi
      .spyOn(meetingApi, 'updateTranscript')
      .mockReturnValue(updateRequest.promise)
    const sendSpy = vi
      .spyOn(meetingAiMockGateway, 'sendMeetingAiQuestion')
      .mockReturnValue(sendRequest.promise)
    const { result, rerender } = await renderReadyController()

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onStartEdit?.('segment-1')
    })
    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onEditDraftChange?.('이전 회의에서 수정한 문장')
    })
    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onSaveEdit?.()
    })
    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.aiChat.actions.onDraftChange('이전 회의 질문')
    })
    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.aiChat.actions.onSend()
    })
    expect(updateSpy).toHaveBeenCalledOnce()
    expect(sendSpy).toHaveBeenCalledOnce()

    rerender({ currentMeetingId: 'demo-hint-error' })
    await waitFor(() => {
      expect(result.current.status).toBe('ready')
      if (result.current.status === 'ready') {
        expect(result.current.meeting.meetingId).toBe('demo-hint-error')
      }
    })

    await act(async () => {
      updateRequest.resolve({
        id: 'segment-1',
        sequenceIndex: 0,
        startedAtSeconds: 284,
        text: '이전 회의에서 수정한 문장',
        isEdited: true,
        editedAt: '2026-07-27T00:00:00.000Z',
      })
      sendRequest.resolve({
        id: 'stale-assistant',
        role: 'assistant',
        content: '이전 회의의 답변',
        context: null,
      })
      await Promise.resolve()
      await Promise.resolve()
    })

    if (result.current.status !== 'ready') throw new Error('controller is not ready')
    expect(result.current.meeting.transcript.segments[0]?.text).toBe(
      '네, 지난주 유저 인터뷰 결과를 토대로 봤을 때, 제품 측면에서는 온보딩 플로우 개선이 가장 큰 임팩트를 줄 수 있을 것 같습니다. 사용자들이 앱에 처음 들어왔을 때 핵심 기능을 파악하기 전에 헤매는 구간이 너무 길어요.',
    )
    expect(result.current.aiChat.model.messages).toHaveLength(1)
    expect(result.current.aiChat.model.messages[0]?.id).toBe('assistant-welcome')
  })

  it('handles transcript refresh rejection without an unhandled promise', async () => {
    vi.spyOn(meetingApi, 'listTranscripts').mockRejectedValue(
      new Error('TRANSCRIPT_REFRESH_FAILED'),
    )
    const { result } = await renderReadyController()

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onRefresh()
    })

    await waitFor(() => expect(meetingApi.listTranscripts).toHaveBeenCalledWith('demo'))
  })

  it('keeps a hint collapsed when an in-flight response arrives later', async () => {
    const hintRequest = deferred<TranscriptHintResponse>()
    vi.spyOn(meetingAiMockGateway, 'getTranscriptHint').mockReturnValue(hintRequest.promise)
    const { result } = await renderReadyController()

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onSelectSegment?.('segment-1')
    })
    await waitFor(() => {
      if (result.current.status !== 'ready' || result.current.transcript.state.kind !== 'active') {
        throw new Error('transcript is not active')
      }
      expect(result.current.transcript.state.hintState?.status).toBe('loading')
    })

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onCollapseHint?.('segment-1')
      hintRequest.resolve({
        transcriptId: 'segment-1',
        notice: null,
        meaning: '늦게 도착한 의미',
        personalImpact: '늦게 도착한 영향',
        teamQuestion: '늦게 도착한 질문',
      })
    })

    await waitFor(() => {
      if (result.current.status !== 'ready' || result.current.transcript.state.kind !== 'active') {
        throw new Error('transcript is not active')
      }
      expect(result.current.transcript.state.hintState?.status).toBe('idle')
    })
  })

  it('restores a collapsed successful hint from cache without another request', async () => {
    const hint: TranscriptHintResponse = {
      transcriptId: 'segment-1',
      notice: null,
      meaning: '캐시된 의미',
      personalImpact: '캐시된 영향',
      teamQuestion: '캐시된 질문',
    }
    const hintSpy = vi.spyOn(meetingAiMockGateway, 'getTranscriptHint').mockResolvedValue(hint)
    const { result } = await renderReadyController()

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onSelectSegment?.('segment-1')
    })
    await waitFor(() => {
      if (result.current.status !== 'ready' || result.current.transcript.state.kind !== 'active') {
        throw new Error('transcript is not active')
      }
      expect(result.current.transcript.state.hintState?.status).toBe('ready')
    })

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onCollapseHint?.('segment-1')
      result.current.transcript.actions.onSelectSegment?.('segment-1')
    })

    await waitFor(() => {
      if (result.current.status !== 'ready' || result.current.transcript.state.kind !== 'active') {
        throw new Error('transcript is not active')
      }
      expect(result.current.transcript.state.hintState).toEqual({
        status: 'ready',
        transcriptId: 'segment-1',
        hint,
      })
    })
    expect(hintSpy).toHaveBeenCalledOnce()
  })

  it('does not recreate the elapsed timer when transcript data is replaced', async () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval')
    const { result, unmount } = await renderReadyController()
    setIntervalSpy.mockClear()
    vi.spyOn(meetingApi, 'listTranscripts').mockResolvedValue([
      {
        id: 'segment-1',
        sequenceIndex: 1,
        startedAtSeconds: 284,
        text: '새로고침된 전사 문장',
        isEdited: false,
        editedAt: null,
      },
    ])

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onRefresh()
    })

    await waitFor(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      expect(result.current.meeting.transcript.segments[0]?.text).toBe('새로고침된 전사 문장')
    })
    expect(setIntervalSpy.mock.calls.filter(([, delay]) => delay === 1000)).toHaveLength(0)
    unmount()
  })

  it('reloads the hint after the selected transcript is edited', async () => {
    const previousHint: TranscriptHintResponse = {
      transcriptId: 'segment-1',
      notice: null,
      meaning: '수정 전 의미',
      personalImpact: '수정 전 영향',
      teamQuestion: '수정 전 질문',
    }
    const updatedHint: TranscriptHintResponse = {
      transcriptId: 'segment-1',
      notice: null,
      meaning: '수정 후 의미',
      personalImpact: '수정 후 영향',
      teamQuestion: '수정 후 질문',
    }
    const hintSpy = vi
      .spyOn(meetingAiMockGateway, 'getTranscriptHint')
      .mockResolvedValueOnce(previousHint)
      .mockResolvedValueOnce(updatedHint)
    const { result } = await renderReadyController()

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onSelectSegment?.('segment-1')
    })
    await waitFor(() => {
      if (result.current.status !== 'ready' || result.current.transcript.state.kind !== 'active') {
        throw new Error('transcript is not active')
      }
      expect(result.current.transcript.state.hintState).toEqual({
        status: 'ready',
        transcriptId: 'segment-1',
        hint: previousHint,
      })
    })

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onStartEdit?.('segment-1')
    })
    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onEditDraftChange?.('수정된 전사 문장')
    })
    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onSaveEdit?.()
    })
    await waitFor(() => {
      if (result.current.status !== 'ready' || result.current.transcript.state.kind !== 'active') {
        throw new Error('transcript is not active')
      }
      expect(result.current.meeting.transcript.segments[0]?.text).toBe('수정된 전사 문장')
      expect(result.current.transcript.state.hintState?.status).toBe('idle')
    })

    act(() => {
      if (result.current.status !== 'ready') throw new Error('controller is not ready')
      result.current.transcript.actions.onSelectSegment?.('segment-1')
    })
    await waitFor(() => {
      if (result.current.status !== 'ready' || result.current.transcript.state.kind !== 'active') {
        throw new Error('transcript is not active')
      }
      expect(result.current.transcript.state.hintState).toEqual({
        status: 'ready',
        transcriptId: 'segment-1',
        hint: updatedHint,
      })
    })
    expect(hintSpy).toHaveBeenCalledTimes(2)
  })
})
