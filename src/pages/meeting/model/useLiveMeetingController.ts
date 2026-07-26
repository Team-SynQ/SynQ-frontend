import { useCallback, useEffect, useRef, useState } from 'react'

import {
  meetingApi,
  type LiveMeeting,
  type LiveMeetingAiPinnedContext,
  type LiveMeetingTranscriptHint,
} from '../../../entities/meeting'
import type {
  AiChatContentProps,
  AiChatDisplayMode,
  AiChatMessage,
} from '../../../features/meeting-ai-chat'
import type {
  TranscriptEditState,
  TranscriptHintState,
  TranscriptPanelProps,
} from '../../../features/live-transcription'

type ReadyController = {
  status: 'ready'
  meeting: LiveMeeting
  meetingTitle: string
  elapsedSeconds: number
  recordingState: 'recording' | 'paused'
  transcript: TranscriptPanelProps
  aiChat: AiChatContentProps
  aiChatDisplayMode: AiChatDisplayMode
  setMeetingTitle: (title: string) => void
  toggleRecording: () => void
  changeAiChatDisplayMode: (mode: AiChatDisplayMode) => void
}

type LiveMeetingController =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | ReadyController

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function getErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null
  return typeof error.code === 'string' ? error.code : null
}

export function useLiveMeetingController(meetingId: string): LiveMeetingController {
  const [meeting, setMeeting] = useState<LiveMeeting | null>(null)
  const [loadError, setLoadError] = useState<{ meetingId: string; message: string } | null>(
    null,
  )
  const [meetingTitle, setMeetingTitle] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [recordingState, setRecordingState] = useState<'recording' | 'paused'>('recording')
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
  const [hintState, setHintState] = useState<TranscriptHintState>({ status: 'idle' })
  const [editState, setEditState] = useState<TranscriptEditState>({ status: 'idle' })
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [pinnedContext, setPinnedContext] = useState<LiveMeetingAiPinnedContext | null>(null)
  const [aiChatDisplayMode, setAiChatDisplayMode] = useState<AiChatDisplayMode>('docked')
  const hintCacheRef = useRef(new Map<string, LiveMeetingTranscriptHint>())
  const hintRequestSequenceRef = useRef(0)
  const composerInputRef = useRef<HTMLInputElement>(null)
  const lastExpandedAiChatModeRef = useRef<Exclude<AiChatDisplayMode, 'launcher'>>('docked')

  useEffect(() => {
    let active = true

    hintRequestSequenceRef.current += 1

    void meetingApi
      .joinMeeting(meetingId)
      .then((response) => {
        if (!active) return

        setMeeting(response)
        setLoadError(null)
        setMeetingTitle(response.meetingTitle)
        setElapsedSeconds(response.elapsedSeconds)
        setRecordingState(response.recordingState)
        setSelectedSegmentId(null)
        setHintState({ status: 'idle' })
        setEditState({ status: 'idle' })
        setPinnedContext(null)
        setDraft('')
        setAiChatDisplayMode('docked')
        hintCacheRef.current.clear()
        setMessages(
          response.aiChat.messages.map(({ id, role, content }) => ({
            id,
            role,
            content,
          })),
        )
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadError({
          meetingId,
          message: getErrorMessage(error, '회의 정보를 불러오지 못했습니다.'),
        })
      })

    return () => {
      active = false
    }
  }, [meetingId])

  useEffect(() => {
    if (!meeting) return

    const timerId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [meeting])

  const loadHint = useCallback(
    async (transcriptId: string, useCache: boolean) => {
      const cachedHint = hintCacheRef.current.get(transcriptId)
      if (useCache && cachedHint) {
        setHintState({ status: 'ready', transcriptId, hint: cachedHint })
        return
      }

      const requestSequence = ++hintRequestSequenceRef.current
      setHintState({ status: 'loading', transcriptId })

      try {
        const hint = await meetingApi.getTranscriptHint({ meetingId, transcriptId })
        if (requestSequence !== hintRequestSequenceRef.current) return

        hintCacheRef.current.set(transcriptId, hint)
        setHintState({ status: 'ready', transcriptId, hint })
      } catch (error) {
        if (requestSequence !== hintRequestSequenceRef.current) return

        if (getErrorCode(error) === 'TRANSCRIPT_HINT_NOT_FOUND') {
          setHintState({ status: 'idle' })
          return
        }
        setHintState({
          status: 'error',
          transcriptId,
          message: getErrorMessage(error, 'SynQ 힌트를 불러오지 못했습니다.'),
        })
      }
    },
    [meetingId],
  )

  if (loadError?.meetingId === meetingId) {
    return { status: 'error', message: loadError.message }
  }
  if (!meeting || meeting.meetingId !== meetingId) {
    return { status: 'loading' }
  }

  const selectSegment = (segmentId: string) => {
    if (editState.status === 'editing') return

    setSelectedSegmentId(segmentId)
    void loadHint(segmentId, true)
  }

  const startEdit = (segmentId: string) => {
    const segment = meeting.transcript.segments.find((candidate) => candidate.id === segmentId)
    if (!segment) return

    setEditState({
      status: 'editing',
      transcriptId: segmentId,
      originalText: segment.text,
      draftText: segment.text,
      errorMessage: null,
      isSaving: false,
    })
  }

  const saveEdit = async () => {
    if (editState.status !== 'editing' || editState.isSaving) return
    if (
      editState.draftText === editState.originalText ||
      editState.draftText.trim().length === 0
    ) {
      return
    }

    const savingState = { ...editState, errorMessage: null, isSaving: true }
    setEditState(savingState)

    try {
      const updated = await meetingApi.updateTranscript({
        meetingId,
        segmentId: savingState.transcriptId,
        text: savingState.draftText,
      })
      setMeeting((current) =>
        current
          ? {
              ...current,
              transcript: {
                ...current.transcript,
                segments: current.transcript.segments.map((segment) =>
                  segment.id === updated.id ? updated : segment,
                ),
              },
            }
          : current,
      )
      setEditState({ status: 'idle' })
    } catch (error) {
      setEditState({
        ...savingState,
        errorMessage: getErrorMessage(error, '전사 내용을 수정하지 못했습니다.'),
        isSaving: false,
      })
    }
  }

  const askAi = (segmentId: string) => {
    const segment = meeting.transcript.segments.find((candidate) => candidate.id === segmentId)
    if (!segment) return

    setPinnedContext({ transcriptId: segment.id, text: segment.text })
    setDraft('')
    if (aiChatDisplayMode === 'launcher') {
      setAiChatDisplayMode(lastExpandedAiChatModeRef.current)
      window.setTimeout(() => composerInputRef.current?.focus(), 0)
      return
    }
    composerInputRef.current?.focus()
  }

  const sendMessage = async () => {
    const question = draft.trim()
    if (!question || isSending) return

    setIsSending(true)
    try {
      const response = await meetingApi.sendMeetingAiQuestion({
        meetingId,
        question,
        context: pinnedContext,
      })
      setMessages((current) => [
        ...current,
        {
          id: `user-${response.id}`,
          role: 'user',
          content: question,
        },
        {
          id: response.id,
          role: response.role,
          content: response.content,
        },
      ])
      setDraft('')
    } finally {
      setIsSending(false)
    }
  }

  const changeAiChatDisplayMode = (mode: AiChatDisplayMode) => {
    setAiChatDisplayMode(mode)
    if (mode !== 'launcher') {
      lastExpandedAiChatModeRef.current = mode
    }
  }

  const transcript: TranscriptPanelProps = {
    actions: {
      onAskAi: askAi,
      onCancelEdit: () => setEditState({ status: 'idle' }),
      onEditDraftChange: (value) =>
        setEditState((current) =>
          current.status === 'editing'
            ? { ...current, draftText: value, errorMessage: null }
            : current,
        ),
      onRefresh: () => {
        void meetingApi.listTranscripts(meetingId).then((segments) => {
          setMeeting((current) =>
            current
              ? {
                  ...current,
                  transcript: { ...current.transcript, segments },
                }
              : current,
          )
        })
      },
      onRetryHint: (transcriptId) => void loadHint(transcriptId, false),
      onSaveEdit: () => void saveEdit(),
      onSelectSegment: selectSegment,
      onStartEdit: startEdit,
    },
    state:
      meeting.transcript.status === 'waiting'
        ? { kind: 'waiting' }
        : {
            kind: 'active',
            editState,
            hintState,
            isSpeaking: meeting.transcript.isSpeaking,
            segments: meeting.transcript.segments,
            selectedSegmentId,
          },
  }

  const aiChat: AiChatContentProps = {
    actions: {
      onClearContext: () => setPinnedContext(null),
      onDraftChange: setDraft,
      onSelectSuggestion: (suggestionId) => {
        const suggestion = meeting.aiChat.suggestions.find((item) => item.id === suggestionId)
        if (suggestion) setDraft(suggestion.label)
      },
      onSend: () => void sendMessage(),
    },
    composerInputRef,
    model: {
      draft,
      isSending,
      messages,
      pinnedContext,
      suggestions: meeting.aiChat.suggestions,
    },
  }

  return {
    status: 'ready',
    meeting,
    meetingTitle,
    elapsedSeconds,
    recordingState,
    transcript,
    aiChat,
    aiChatDisplayMode,
    setMeetingTitle,
    toggleRecording: () =>
      setRecordingState((current) => (current === 'recording' ? 'paused' : 'recording')),
    changeAiChatDisplayMode,
  }
}
