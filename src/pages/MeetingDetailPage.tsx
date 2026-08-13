import React, { useEffect, useRef, useState, type Ref } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button, Modal, ChatInput } from '../shared/ui'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'
import { meetingService } from '../shared/api/services/meeting.service'
import { transcriptService } from '../shared/api/services/transcript.service'
import { aiChatService } from '../shared/api/services/aiChat.service'
import { participantService } from '../shared/api/services/participant.service'
import { hintService } from '../shared/api/services/hint.service'
import type { AiChatSendRequest } from '../shared/api/contracts/aiChat.contracts'
import { listProjectSummaries } from '../entities/project'
import { toTranscriptSegments } from '../entities/meeting/api/transcript.adapter'
import type {
  OverallMeetingSummaryResult,
  PersonalMeetingSummaryResult,
  AiChatPinnedContext as AiChatPinnedContextModel,
} from '../shared/api/contracts/meeting.contracts'
import { MeetingSettingsMenu, type MeetingMember } from '../features/meeting-settings'
import { cn } from '../shared/lib/cn'

function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export interface AiChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface AiChatSuggestion {
  id: string
  label: string
}

export interface AiChatViewModel {
  messages: AiChatMessage[]
  draft: string
  suggestions: AiChatSuggestion[]
  isSending: boolean
  sendError?: string | null
  pinnedContext?: AiChatPinnedContextModel | null
}

export interface AiChatActions {
  onDraftChange: (draft: string) => void
  onSend: () => void
  onSelectSuggestion: (id: string) => void
  onClearContext: () => void
}

export type AiChatLauncherProps = {
  onOpen: () => void
  buttonRef?: Ref<HTMLButtonElement>
}

export function AiChatLauncher({ onOpen, buttonRef }: AiChatLauncherProps) {
  return (
    <button
      aria-label="AI Chat 열기"
      className="flex size-[100px] items-center justify-center rounded-full bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      onClick={onOpen}
      ref={buttonRef}
      type="button"
    >
      <span
        className="pointer-events-none flex size-[80px] items-center justify-center rounded-full bg-gray-800 shadow-ai-chat-launcher"
        data-testid="ai-chat-launcher-surface"
      >
        <img
          alt="AI Chat"
          aria-hidden="true"
          className="h-[46px] w-[27px]"
          data-testid="ai-chat-launcher-symbol"
          src="/assets/images/synq-symbol-inverse.png"
        />
      </span>
    </button>
  )
}

export type AiChatMessageListProps = {
  messages: AiChatMessage[]
  variant: 'docked' | 'floating'
}

export function AiChatMessageList({ messages, variant }: AiChatMessageListProps) {
  return (
    <div
      aria-label="AI Chat 메시지"
      aria-live="polite"
      aria-relevant="additions text"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-m overflow-y-auto bg-[#F8F9FA]',
        variant === 'floating' ? 'px-m py-[28px]' : 'p-m',
      )}
      role="log"
      tabIndex={0}
    >
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xs text-gray-400">
          대화 내역이 없습니다.
        </div>
      ) : (
        messages.map((message) => (
          <article
            className={cn(
              'rounded-m p-s typo-transcription-body-01 whitespace-pre-wrap',
              variant === 'floating' ? 'max-w-[300px]' : 'max-w-[400px]',
              message.role === 'assistant'
                ? cn(
                    'self-start rounded-bl-none border bg-surface-elevated text-gray-700',
                    variant === 'floating' ? 'border-line-default' : 'border-gray-100',
                  )
                : 'self-end rounded-br-none bg-gray-700 text-fg-inverse',
            )}
            key={message.id}
          >
            {message.content}
          </article>
        ))
      )}
    </div>
  )
}

export type AiChatComposerProps = {
  model: AiChatViewModel
  actions: AiChatActions
  inputRef?: Ref<HTMLInputElement>
}

export function AiChatComposer({ model, actions, inputRef }: AiChatComposerProps) {
  const sendDisabled = model.draft.trim().length === 0 || model.isSending

  return (
    <div className="flex flex-col gap-s border-t border-line-default bg-surface-elevated p-m">
      <div className="flex flex-col items-start gap-xs">
        {model.suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            onClick={() => actions.onSelectSuggestion(suggestion.id)}
            size="medium"
            variant="primaryLine"
          >
            {suggestion.label}
          </Button>
        ))}
      </div>

      {model.sendError ? (
        <p className="m-0 typo-caption-01 text-status-negative" role="alert">
          {model.sendError}
        </p>
      ) : null}

      <ChatInput
        aria-label="AI Chat 질문"
        disabled={model.isSending}
        onChange={(event) => actions.onDraftChange(event.target.value)}
        onSend={actions.onSend}
        placeholder="프로젝트의 맥락에 대해 질문하세요."
        sendDisabled={sendDisabled}
        ref={inputRef}
        value={model.draft}
        wrapperClassName="max-w-none"
      />
    </div>
  )
}

export type AiChatPinnedContextProps = {
  context: AiChatPinnedContextModel
  onClear: () => void
}

export function AiChatPinnedContext({ context, onClear }: AiChatPinnedContextProps) {
  return (
    <section
      aria-label="AI 질문 전사 컨텍스트"
      className="flex min-h-[100px] items-start gap-xs border-b border-line-default bg-surface-elevated px-m py-m typo-transcription-body-01 text-fg-primary"
    >
      <img
        alt="pin"
        aria-hidden="true"
        className="size-[24px] shrink-0"
        src="/assets/images/pin.png"
      />
      <p className="m-0 min-w-0 flex-1">{context.text}</p>
      <Button
        aria-label="전사 컨텍스트 제거"
        className="size-[32px] px-0!"
        onClick={onClear}
        size="small"
        variant="basic"
      >
        <img alt="닫기" aria-hidden="true" className="size-[24px]" src="/assets/images/close.png" />
      </Button>
    </section>
  )
}

export type AiChatPanelProps = {
  model: AiChatViewModel
  actions: AiChatActions
  composerInputRef?: Ref<HTMLInputElement>
  onCollapse: () => void
  collapseButtonRef?: Ref<HTMLButtonElement>
} & (
  | {
      variant: 'docked'
      onMinimize: () => void
      actionButtonRef?: Ref<HTMLButtonElement>
    }
  | {
      variant: 'floating'
      onMaximize: () => void
      actionButtonRef?: Ref<HTMLButtonElement>
    }
)

export function AiChatPanel(props: AiChatPanelProps) {
  const {
    model,
    actions,
    variant,
    actionButtonRef,
    collapseButtonRef,
    composerInputRef,
    onCollapse,
  } = props
  const floating = variant === 'floating'
  const resizeLabel = floating ? 'AI Chat 창 확장' : 'AI Chat 창 축소'
  const resizeIcon = floating ? '/assets/images/maximize.png' : '/assets/images/minimize.png'
  const onResize = floating ? props.onMaximize : props.onMinimize

  return (
    <aside
      aria-labelledby="meeting-ai-chat-title"
      className={cn(
        'flex flex-col h-full bg-surface-elevated border-l border-gray-200',
        floating ? 'border border-gray-200 rounded-m shadow-2xl overflow-hidden' : '',
      )}
    >
      <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-gray-200 px-5 bg-white">
        <h2 className="m-0 text-base font-bold text-gray-800" id="meeting-ai-chat-title">
          AI Chat
        </h2>
        <div className="flex items-center gap-1">
          <button
            aria-label="AI Chat 런처로 축소"
            onClick={onCollapse}
            ref={collapseButtonRef}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <img
              alt="접기"
              aria-hidden="true"
              className="size-4"
              src="/assets/images/collapse.png"
            />
          </button>
          <button
            aria-label={resizeLabel}
            onClick={onResize}
            ref={actionButtonRef}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <img alt="크기 조절" aria-hidden="true" className="size-4" src={resizeIcon} />
          </button>
        </div>
      </header>

      {model.pinnedContext ? (
        <AiChatPinnedContext context={model.pinnedContext} onClear={actions.onClearContext} />
      ) : null}
      <AiChatMessageList messages={model.messages} variant={variant} />
      <AiChatComposer actions={actions} inputRef={composerInputRef} model={model} />
    </aside>
  )
}

export interface TranscriptItem {
  id: string
  segmentId: number
  time: string
  text: string
  isEdited?: boolean
  hasHint: boolean
  hintData?: {
    meaning: string
    myImpact: string
    teamQuestion: string
  }
}

interface MeetingDetailPageProps {
  user?: ProjectSidebarUser
}

export const MeetingDetailPage = ({ user }: MeetingDetailPageProps) => {
  const { meetingRecordId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { meetingTitle?: string } | null

  const [hasError, setHasError] = useState(false)

  const [activeTab, setActiveTab] = useState<'personal' | 'allSummary' | 'allRecord'>('allRecord')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTitleInput, setEditTitleInput] = useState('')

  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([])
  const [isLoadingTranscripts, setIsLoadingTranscripts] = useState(false)
  const [fallbackDurationSeconds, setFallbackDurationSeconds] = useState<number | null>(null)

  const [overallSummary, setOverallSummary] = useState<OverallMeetingSummaryResult | null>(null)
  const [isLoadingOverallSummary, setIsLoadingOverallSummary] = useState(false)

  const [personalSummary, setPersonalSummary] = useState<PersonalMeetingSummaryResult | null>(null)
  const [isLoadingPersonalSummary, setIsLoadingPersonalSummary] = useState(false)

  const [sidebarProjects, setSidebarProjects] = useState<{ id: string; name: string }[]>([])
  const [participants, setParticipants] = useState<MeetingMember[]>([])

  const [chatModel, setChatModel] = useState<AiChatViewModel>({
    messages: [],
    draft: '',
    suggestions: [
      { id: 'sug-1', label: '지난 회의에서는 이 범위 어디까지 정했어?' },
      { id: 'sug-2', label: '오늘 내가 맡은 부분은?' },
    ],
    isSending: false,
  })

  const apiMeetingId = Number(meetingRecordId)
  const hasValidMeetingId = Number.isSafeInteger(apiMeetingId) && apiMeetingId > 0

  const currentMeetingIdRef = useRef(apiMeetingId)
  useEffect(() => {
    currentMeetingIdRef.current = apiMeetingId
    setHasError(false)
    setIsEditModalOpen(false)
    setOverallSummary(null)
    setPersonalSummary(null)
    setTranscripts([])
  }, [apiMeetingId])

  useEffect(() => {
    let active = true

    void listProjectSummaries()
      .then((projects) => {
        if (!active) return
        setSidebarProjects(projects.map((p) => ({ id: p.id, name: p.name })))
      })
      .catch((err) => {
        console.error('사이드바 프로젝트 목록 조회 실패:', err)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!hasValidMeetingId) return

    let active = true

    void participantService
      .listParticipants(apiMeetingId)
      .then((res) => {
        if (!active) return
        setParticipants(
          res.map((p) => ({
            id: String(p.userId),
            name: p.name,
            role: p.role === 'HOST' ? 'HOST' : 'MEMBER',
            isOwner: p.role === 'HOST',
            avatarUrl: p.profileImageUrl || undefined,
          })),
        )
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [apiMeetingId, hasValidMeetingId])

  useEffect(() => {
    if (!hasValidMeetingId) return

    let active = true
    queueMicrotask(() => {
      if (active) setIsLoadingTranscripts(true)
    })

    void (async () => {
      try {
        const [transcriptRes, hintResult] = await Promise.all([
          transcriptService.listSegments(apiMeetingId),
          hintService
            .listHintRecords(apiMeetingId)
            .catch(() => ({ meetingId: apiMeetingId, hints: [] })),
        ])

        if (!active) return

        if (transcriptRes.segments.length > 0) {
          const maxEndMs = Math.max(...transcriptRes.segments.map((s) => s.endMs))
          setFallbackDurationSeconds(Math.floor(maxEndMs / 1000))
        } else {
          setFallbackDurationSeconds(0)
        }

        const convertedSegments = toTranscriptSegments(transcriptRes.segments)
        const hintMap = new Map(hintResult.hints.map((h) => [h.segmentId, h]))

        const mappedItems: TranscriptItem[] = convertedSegments.map((segment) => {
          const segmentIdNum = Number(segment.id)
          const hint = hintMap.get(segmentIdNum)
          const hasHint = Boolean(hint && (hint.meaning || hint.myImpact || hint.teamQuestion))

          return {
            id: segment.id,
            segmentId: segmentIdNum,
            time: formatSecondsToTime(segment.startedAtSeconds),
            text: segment.text,
            isEdited: segment.isEdited,
            hasHint,
            hintData:
              hasHint && hint
                ? {
                    meaning: hint.meaning || '',
                    myImpact: hint.myImpact || '',
                    teamQuestion: hint.teamQuestion || '',
                  }
                : undefined,
          }
        })

        setTranscripts(mappedItems)
      } catch (err) {
        console.error('전사 또는 힌트 데이터 조회 실패:', err)
      } finally {
        if (active) setIsLoadingTranscripts(false)
      }
    })()

    return () => {
      active = false
    }
  }, [apiMeetingId, hasValidMeetingId])

  useEffect(() => {
    if (!hasValidMeetingId) return

    let active = true
    queueMicrotask(() => {
      if (active) setIsLoadingOverallSummary(true)
    })

    void meetingService
      .getOverallSummary(apiMeetingId)
      .then((res) => {
        if (!active) return
        setOverallSummary(res)
      })
      .catch((err) => {
        console.error('전체 요약 데이터 조회 실패:', err)
        if (active) setHasError(true)
      })
      .finally(() => {
        if (active) setIsLoadingOverallSummary(false)
      })

    return () => {
      active = false
    }
  }, [apiMeetingId, hasValidMeetingId])

  useEffect(() => {
    if (!hasValidMeetingId) return

    let active = true
    queueMicrotask(() => {
      if (active) setIsLoadingPersonalSummary(true)
    })

    void meetingService
      .getPersonalSummary(apiMeetingId)
      .then((res) => {
        if (!active) return
        setPersonalSummary(res)
      })
      .catch((err) => {
        console.error('개인 요약 데이터 조회 실패:', err)
      })
      .finally(() => {
        if (active) setIsLoadingPersonalSummary(false)
      })

    return () => {
      active = false
    }
  }, [apiMeetingId, hasValidMeetingId])

  useEffect(() => {
    if (!hasValidMeetingId) return

    let active = true

    const loadChatData = async () => {
      try {
        const historyResult = await aiChatService.listMessages(apiMeetingId)
        if (!active) return

        const formattedMessages: AiChatMessage[] = []
        historyResult.messages.forEach((dto) => {
          formattedMessages.push({
            id: `${dto.id}-q`,
            role: 'user',
            content: dto.question,
          })
          if (dto.answer) {
            formattedMessages.push({
              id: `${dto.id}-a`,
              role: 'assistant',
              content: dto.answer,
            })
          }
        })

        setChatModel((prev) => ({
          ...prev,
          messages: formattedMessages,
        }))
      } catch (err) {
        console.error('AI Chat 대화 내역 불러오기 실패:', err)
      }

      try {
        const welcomeResult = await aiChatService.getWelcome(apiMeetingId)
        if (!active) return
        if (welcomeResult.suggestedQuestions && welcomeResult.suggestedQuestions.length > 0) {
          setChatModel((prev) => ({
            ...prev,
            suggestions: welcomeResult.suggestedQuestions.map((q, idx) => ({
              id: `sug-${idx}`,
              label: q,
            })),
          }))
        }
      } catch {
        // 추천 질문 로드 실패 시 기본값 유지
      }
    }

    void loadChatData()

    return () => {
      active = false
    }
  }, [apiMeetingId, hasValidMeetingId])

  if (!hasValidMeetingId || hasError) {
    return (
      <div className="flex h-screen w-full bg-white overflow-hidden relative">
        <ProjectSidebar
          accountSettingsActions={{
            onOpenAccountInfo: () => navigate('/settings/account'),
            onOpenHelp: () => navigate('/settings/help'),
            onOpenTerms: () => navigate('/settings/policy'),
          }}
          user={user}
          projects={sidebarProjects}
          activeProjectId={sidebarProjects[0]?.id}
          onSelectProject={(id) => {
            navigate('/projects', { state: { activeProjectId: id } })
          }}
          onAddProject={() => {
            navigate('/projects', { state: { openCreateProject: true } })
          }}
        />

        <main className="flex-1 h-full flex flex-col items-center justify-center bg-white p-8">
          <div role="alert" className="flex flex-col items-center gap-4 text-center">
            <p className="text-base font-medium text-gray-800">회의 기록을 불러오지 못했습니다.</p>
            <Button variant="primaryLine" onClick={() => navigate('/projects')}>
              메인보드로 이동
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const displayTitle = overallSummary?.title || locationState?.meetingTitle || '회의 기록'
  const displayRoleTag = personalSummary?.role || ''
  const displayDateIso =
    overallSummary?.generatedAt || personalSummary?.generatedAt || new Date().toISOString()
  const displayDurationSeconds = fallbackDurationSeconds ?? 0

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '0초'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes === 0) return `${secs}초`
    if (secs === 0) return `${minutes}분`
    return `${minutes}분 ${secs}초`
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    const yy = String(date.getFullYear()).slice(-2)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yy}.${mm}.${dd}`
  }

  const handleConfirmEditTitle = async () => {
    if (!editTitleInput.trim() || !hasValidMeetingId) return
    const nextTitle = editTitleInput.trim()
    const targetMeetingId = apiMeetingId

    try {
      await meetingService.updateMeetingTitle(apiMeetingId, nextTitle)
      if (currentMeetingIdRef.current === targetMeetingId) {
        setOverallSummary((prev) =>
          prev && prev.meetingId === targetMeetingId ? { ...prev, title: nextTitle } : prev,
        )
        setIsEditModalOpen(false)
      }
    } catch (error) {
      console.error('회의 제목 수정 실패:', error)
      alert('회의 제목을 수정하지 못했습니다.')
    }
  }

  const handleDeleteMeeting = async () => {
    if (!hasValidMeetingId) return
    if (confirm('회의를 삭제하시겠습니까?')) {
      try {
        await meetingService.deleteMeeting(apiMeetingId)
        navigate('/projects')
      } catch (error) {
        console.error('회의 삭제 실패:', error)
        alert('회의를 삭제하지 못했습니다.')
      }
    }
  }

  const activeProjectId = sidebarProjects[0]?.id

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      <ProjectSidebar
        accountSettingsActions={{
          onOpenAccountInfo: () => navigate('/settings/account'),
          onOpenHelp: () => navigate('/settings/help'),
          onOpenTerms: () => navigate('/settings/policy'),
        }}
        user={user}
        projects={sidebarProjects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          navigate('/projects', { state: { activeProjectId: id } })
        }}
        onAddProject={() => {
          navigate('/projects', { state: { openCreateProject: true } })
        }}
      />

      <main className="flex-1 h-full overflow-hidden flex flex-col bg-white text-gray-900 pb-20">
        <div className="px-12 pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/projects')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <img src="/assets/images/arrow-left.png" alt="뒤로가기" className="size-5" />
                </button>
                <h1 className="text-2xl font-bold">{displayTitle}</h1>
                {displayRoleTag && (
                  <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded">
                    {displayRoleTag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <MeetingSettingsMenu
                  members={participants}
                  onEditTitle={() => {
                    setEditTitleInput(displayTitle)
                    setIsEditModalOpen(true)
                  }}
                  onDeleteMeeting={handleDeleteMeeting}
                />
              </div>
            </div>

            <div className="text-sm text-gray-400 mb-8 ml-8">
              {formatDate(displayDateIso)} &nbsp;|&nbsp; {formatDuration(displayDurationSeconds)}
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`pb-3 text-base font-semibold border-b-2 transition-colors ${
                    activeTab === 'personal'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  개인별 정리
                </button>
                <button
                  onClick={() => setActiveTab('allSummary')}
                  className={`pb-3 text-base font-semibold border-b-2 transition-colors ${
                    activeTab === 'allSummary'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  전체 정리
                </button>
                <button
                  onClick={() => setActiveTab('allRecord')}
                  className={`pb-3 text-base font-semibold border-b-2 transition-colors ${
                    activeTab === 'allRecord'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  전체 기록
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'personal' && (
            <MeetingPersonalSummaryTab
              summary={personalSummary}
              isLoading={isLoadingPersonalSummary}
              defaultRoleTag={displayRoleTag}
            />
          )}

          {activeTab === 'allSummary' && (
            <div className="max-w-6xl mx-auto px-12 py-8">
              <MeetingAllSummaryTab summary={overallSummary} isLoading={isLoadingOverallSummary} />
            </div>
          )}

          {activeTab === 'allRecord' && (
            <MeetingAllRecordTab
              apiMeetingId={apiMeetingId}
              isLoading={isLoadingTranscripts}
              transcripts={transcripts}
              setTranscripts={setTranscripts}
              chatModel={chatModel}
              setChatModel={setChatModel}
            />
          )}
        </div>
      </main>

      {activeTab === 'allRecord' && <AudioPlayerControls />}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Modal
            type="form"
            title="회의 제목 수정"
            confirmLabel="제목 변경하기"
            cancelLabel="취소"
            onConfirm={handleConfirmEditTitle}
            onCancel={() => setIsEditModalOpen(false)}
          >
            <div className="flex flex-col gap-xs pt-xs">
              <label className="typo-body-02 font-medium text-fg-primary flex items-center justify-between">
                <span>회의 제목</span>
                <span className="typo-caption text-fg-tertiary">최대 50자</span>
              </label>
              <input
                type="text"
                maxLength={50}
                value={editTitleInput}
                onChange={(e) => setEditTitleInput(e.target.value)}
                placeholder="회의 제목을 입력해 주세요"
                className="w-full px-m py-s rounded-m border border-line-default bg-surface-default text-fg-primary typo-body-01 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </Modal>
        </div>
      )}
    </div>
  )
}

interface MeetingPersonalSummaryTabProps {
  summary: PersonalMeetingSummaryResult | null
  isLoading: boolean
  defaultRoleTag: string
}

function MeetingPersonalSummaryTab({
  summary,
  isLoading,
  defaultRoleTag,
}: MeetingPersonalSummaryTabProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        개인 요약을 불러오는 중입니다...
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">생성된 개인 요약이 없습니다.</div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-12 py-8 space-y-10 pb-16">
      <section>
        <div className="flex items-center gap-2 mb-3">
          {summary.role || defaultRoleTag ? (
            <span className="px-2.5 py-0.5 bg-brand-primary text-fg-inverse text-xs font-bold rounded">
              {summary.role || defaultRoleTag}
            </span>
          ) : null}
          <h2 className="text-lg font-bold text-gray-900">내 관점 요약</h2>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed bg-[#F8F9FA] p-5 rounded-xl">
          {summary.personalSummary}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">나에게 영향 있는 내용</h2>
        <ul className="space-y-2">
          {summary.keyPoints.map((item, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-700 leading-relaxed">
              <span className="mr-2 text-gray-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">내 액션 아이템</h2>
        <ul className="space-y-2">
          {summary.myActionItems.map((item, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-700 leading-relaxed">
              <span className="mr-2 text-gray-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">다시 확인하면 좋은 질문</h2>
        <div className="space-y-3">
          {summary.followUpQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#F8F9FA] rounded-xl text-sm text-gray-800 hover:bg-gray-100 transition-colors"
            >
              {q}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

interface MeetingAllRecordTabProps {
  apiMeetingId: number
  isLoading: boolean
  transcripts: TranscriptItem[]
  setTranscripts: React.Dispatch<React.SetStateAction<TranscriptItem[]>>
  chatModel: AiChatViewModel
  setChatModel: React.Dispatch<React.SetStateAction<AiChatViewModel>>
}

function MeetingAllRecordTab({
  apiMeetingId,
  isLoading,
  transcripts,
  setTranscripts,
  chatModel,
  setChatModel,
}: MeetingAllRecordTabProps) {
  const [onlyTranscript, setOnlyTranscript] = useState(false)
  const [includeMyAiRecord, setIncludeMyAiRecord] = useState(true)
  const [aiChatVariant, setAiChatVariant] = useState<'docked' | 'floating'>('docked')
  const [isHintOpen, setIsHintOpen] = useState(true)
  const [chatWidth, setChatWidth] = useState(420)

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = chatWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX
      const newWidth = Math.min(Math.max(startWidth + deltaX, 300), 650)
      setChatWidth(newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const chatActions: AiChatActions = {
    onDraftChange: (draft) => setChatModel((prev) => ({ ...prev, draft })),
    onSend: async () => {
      if (!chatModel.draft.trim() || chatModel.isSending) return
      const text = chatModel.draft.trim()
      const clientRequestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const userMsgId = `user-${Date.now()}`

      setChatModel((prev) => ({
        ...prev,
        messages: [...prev.messages, { id: userMsgId, role: 'user', content: text }],
        draft: '',
        isSending: true,
        sendError: null,
      }))

      try {
        const sendReq: AiChatSendRequest = {
          question: text,
          linkedSegmentId: chatModel.pinnedContext
            ? Number(chatModel.pinnedContext.transcriptId)
            : undefined,
          clientRequestId,
        }

        const response = await aiChatService.sendQuestion(apiMeetingId, sendReq)

        if (response.answer) {
          setChatModel((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              { id: `${response.id}-a`, role: 'assistant', content: response.answer! },
            ],
            isSending: false,
          }))
        } else {
          setChatModel((prev) => ({ ...prev, isSending: false }))
        }
      } catch (err) {
        console.error('AI 질문 전송 실패:', err)
        setChatModel((prev) => ({
          ...prev,
          isSending: false,
          sendError: '답변을 불러오지 못했습니다.',
        }))
      }
    },
    onSelectSuggestion: (id) => {
      const selected = chatModel.suggestions.find((s) => s.id === id)
      if (selected) {
        setChatModel((prev) => ({
          ...prev,
          draft: selected.label,
        }))
      }
    },
    onClearContext: () => {
      setChatModel((prev) => ({ ...prev, pinnedContext: null }))
    },
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  const handleStartEdit = (item: TranscriptItem) => {
    setEditingId(item.id)
    setEditingText(item.text)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const handleSaveEdit = async (item: TranscriptItem) => {
    if (!editingText.trim() || isSaving) return
    setIsSaving(true)

    try {
      await transcriptService.updateSegment(apiMeetingId, item.segmentId, editingText.trim())
      setTranscripts((prev) =>
        prev.map((t) =>
          t.id === item.id ? { ...t, text: editingText.trim(), isEdited: true } : t,
        ),
      )
      setEditingId(null)
      setEditingText('')
    } catch (error) {
      console.error('전사 내용 수정 실패:', error)
      alert('전사 내용을 수정하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden text-gray-900 relative">
      <div className="px-12 py-3 border-b border-gray-200 text-xs text-gray-700 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyTranscript}
              onChange={(e) => setOnlyTranscript(e.target.checked)}
              className="size-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <span>전사만 보기</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeMyAiRecord}
              onChange={(e) => {
                const checked = e.target.checked
                setIncludeMyAiRecord(checked)
                if (checked) {
                  setAiChatVariant('docked')
                }
              }}
              className="size-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <span>내 AI 기록 포함</span>
          </label>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 h-full border-r border-gray-200">
          <div className="h-[52px] shrink-0 border-b border-gray-200 px-12 flex items-center">
            <h2 className="text-base font-bold text-gray-900">전체 전사</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-12 py-6 space-y-6">
            {isLoading ? (
              <div className="py-12 text-center text-sm text-gray-400">
                전사 데이터를 불러오는 중입니다...
              </div>
            ) : transcripts.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                저장된 전사 기록이 없습니다.
              </div>
            ) : (
              transcripts.map((item) => {
                const isEditing = editingId === item.id
                const isChanged = isEditing && editingText !== item.text

                if (isEditing) {
                  return (
                    <div key={item.id} className="p-5 bg-[#F8F9FA] rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                        <span>{item.time}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="px-3 py-1 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item)}
                            disabled={!isChanged || isSaving}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                              isChanged && !isSaving
                                ? 'bg-brand-primary text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isSaving ? '저장 중...' : '저장'}
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={3}
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed focus:outline-none focus:border-brand-primary resize-none"
                      />
                    </div>
                  )
                }

                return (
                  <div key={item.id} className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                      <span>{item.time}</span>
                      {item.isEdited && (
                        <span className="text-xs font-medium text-brand-primary">수정됨</span>
                      )}
                    </div>

                    <div className="relative group">
                      <p className="text-sm text-gray-800 leading-relaxed pr-8">{item.text}</p>
                      <button
                        onClick={() => handleStartEdit(item)}
                        aria-label="편집"
                        className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors opacity-80 group-hover:opacity-100"
                      >
                        <img src="/assets/images/edit.png" alt="편집" className="size-4" />
                      </button>
                    </div>

                    {!onlyTranscript && item.hasHint && item.hintData && (
                      <div className="mt-3 p-4 bg-[#F8F9FA] rounded-2xl border border-gray-100 space-y-3">
                        <div
                          className="flex items-center justify-between cursor-pointer select-none"
                          onClick={() => setIsHintOpen(!isHintOpen)}
                        >
                          <span className="text-xs font-bold text-gray-800">SynQ 힌트</span>
                          <img
                            src="/assets/images/chevron-down.png"
                            alt="열기/접기"
                            className={`size-4 transition-transform ${isHintOpen ? 'rotate-180' : ''}`}
                          />
                        </div>

                        {isHintOpen && (
                          <div className="space-y-2.5 pt-1">
                            {item.hintData.meaning && (
                              <div className="flex items-start gap-3 text-xs">
                                <span className="shrink-0 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 font-semibold rounded-md min-w-[56px] text-center">
                                  의미
                                </span>
                                <p className="text-gray-700 pt-0.5 leading-relaxed">
                                  {item.hintData.meaning}
                                </p>
                              </div>
                            )}

                            {item.hintData.myImpact && (
                              <div className="flex items-start gap-3 text-xs">
                                <span className="shrink-0 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 font-semibold rounded-md min-w-[56px] text-center">
                                  내 영향
                                </span>
                                <p className="text-gray-700 pt-0.5 leading-relaxed">
                                  {item.hintData.myImpact}
                                </p>
                              </div>
                            )}

                            {item.hintData.teamQuestion && (
                              <div className="flex items-start gap-3 text-xs">
                                <span className="shrink-0 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 font-semibold rounded-md min-w-[56px] text-center">
                                  팀 질문
                                </span>
                                <p className="text-gray-700 pt-0.5 leading-relaxed">
                                  {item.hintData.teamQuestion}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {includeMyAiRecord && aiChatVariant === 'docked' && (
          <div
            style={{ width: `${chatWidth}px` }}
            className="shrink-0 h-full relative group pl-2 bg-[#F8F9FA]"
          >
            <div
              onMouseDown={handleResizeMouseDown}
              className="absolute top-0 left-0 bottom-0 w-2 cursor-col-resize hover:bg-brand-primary/40 z-10 transition-colors"
              title="드래그하여 너비 조절"
            />
            <AiChatPanel
              variant="docked"
              model={chatModel}
              actions={chatActions}
              onCollapse={() => setIncludeMyAiRecord(false)}
              onMinimize={() => setAiChatVariant('floating')}
            />
          </div>
        )}
      </div>

      {includeMyAiRecord && aiChatVariant === 'floating' && (
        <div className="fixed bottom-20 right-8 z-50 w-[380px] h-[520px]">
          <AiChatPanel
            variant="floating"
            model={chatModel}
            actions={chatActions}
            onCollapse={() => setIncludeMyAiRecord(false)}
            onMaximize={() => setAiChatVariant('docked')}
          />
        </div>
      )}

      {!includeMyAiRecord && (
        <div className="fixed bottom-20 right-8 z-50">
          <AiChatLauncher
            onOpen={() => {
              setIncludeMyAiRecord(true)
              setAiChatVariant('docked')
            }}
          />
        </div>
      )}
    </div>
  )
}

function AudioPlayerControls() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-8 py-3 flex flex-col gap-2">
      <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden relative cursor-pointer">
        <div className="bg-brand-primary h-full w-[25%]" />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
        <span>13:06</span>

        <div className="flex items-center gap-6">
          <button
            aria-label="5초 뒤로"
            className="flex size-9 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <img src="/assets/images/rotate-left-5.png" alt="5초 뒤로" className="size-9" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? '일시정지' : '재생'}
            className="flex size-10 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <img
              src={isPlaying ? '/assets/images/pause.png' : '/assets/images/play.png'}
              alt={isPlaying ? '일시정지' : '재생'}
              className="size-10"
            />
          </button>

          <button
            aria-label="5초 앞으로"
            className="flex size-9 items-center justify-center rounded-full transition-transform active:scale-95"
          >
            <img src="/assets/images/rotate-right-5.png" alt="5초 앞으로" className="size-9" />
          </button>
        </div>

        <span>53:11</span>
      </div>
    </div>
  )
}

interface MeetingAllSummaryTabProps {
  summary: OverallMeetingSummaryResult | null
  isLoading: boolean
}

function MeetingAllSummaryTab({ summary, isLoading }: MeetingAllSummaryTabProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        전체 요약을 불러오는 중입니다...
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">생성된 전체 요약이 없습니다.</div>
    )
  }

  return (
    <div className="space-y-10 pb-16 text-gray-900">
      <section>
        <h2 className="text-lg font-bold mb-4">핵심 키워드</h2>
        <div className="flex flex-wrap gap-2">
          {summary.keyTopics.map((kw, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-md"
            >
              {kw}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">한 줄 요약</h2>
        <p className="text-sm text-gray-800 leading-relaxed">{summary.oneLineSummary}</p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">주요 논의</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.discussionSections.map((card, idx) => (
            <div key={idx} className="p-5 bg-surface-muted rounded-2xl border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">{card.title}</h3>
              <ul className="space-y-2">
                {card.details.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start text-xs text-gray-700 leading-relaxed"
                  >
                    <span className="mr-2 text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">결정된 내용</h2>
        <ul className="space-y-2">
          {summary.decisions.map((item, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-800 leading-relaxed">
              <span className="mr-2 text-gray-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold">논의된 방향</h2>
          <span className="text-xs text-gray-400 font-normal">
            아직 최종 확정되지 않은 내용입니다.
          </span>
        </div>
        <ul className="space-y-2">
          {summary.tentativeDirections.map((item, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-800 leading-relaxed">
              <span className="mr-2 text-gray-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">확인 필요 내용</h2>
        <ul className="space-y-2">
          {summary.confirmationItems.map((item, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-800 leading-relaxed">
              <span className="mr-2 text-gray-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
