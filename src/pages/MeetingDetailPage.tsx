import React, { useEffect, useState, type Ref } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Modal, ChatInput } from '../shared/ui'
import { ProjectSidebar, type ProjectSidebarUser } from '../widgets/project-sidebar'
import { fetchMeetingDetail, updateMeetingTitle } from '../shared/api/mock/services/meeting.mock'
import type {
  MeetingDetailResponse,
  AiChatPinnedContext as AiChatPinnedContextModel,
} from '../shared/api/contracts/meeting.contracts'
import { MeetingSettingsMenu, type MeetingMember } from '../features/meeting-settings'
import { cn } from '../shared/lib/cn'

// ==========================================
// 1. AI Chat 관련 타입 및 컴포넌트 정의
// ==========================================

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
      {messages.map((message) => (
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
      ))}
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
        'flex flex-col h-full bg-surface-elevated',
        floating
          ? 'border border-gray-200 rounded-m shadow-2xl overflow-hidden'
          : 'border-l border-gray-200',
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

// ==========================================
// 2. 메인 MeetingDetailPage 컴포넌트
// ==========================================

export interface TranscriptItem {
  id: string
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
  const [activeTab, setActiveTab] = useState<'personal' | 'allSummary' | 'allRecord'>('allRecord')
  const [meetingData, setMeetingData] = useState<MeetingDetailResponse | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTitleInput, setEditTitleInput] = useState('')

  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 'tr-1',
      time: '00:04',
      text: '안녕하세요. 오늘 회의에서는 신규 온보딩 개선 방향과 이번 분기 개발 일정을 중심으로 논의하겠습니다. 특히 사용자 이탈률 개선을 위한 우선순위와 베타 출시 일정까지 함께 정리해보면 좋겠습니다.',
      hasHint: false,
    },
    {
      id: 'tr-2',
      time: '00:23',
      text: '지난 한 달 데이터를 보면 신규 가입자의 약 42%가 온보딩을 완료하기 전에 이탈했습니다. 특히 두 번째 단계에서 가장 높은 이탈률이 발생했고, 평균 완료 시간도 예상보다 길었습니다.',
      hasHint: true,
      hintData: {
        meaning: '사용자 첫 경험 개선이 이번 프로젝트의 핵심 과제로 제기되었습니다.',
        myImpact: '온보딩 UI 개편 일정이 프로젝트 우선순위에 반영될 수 있습니다.',
        teamQuestion: '가장 먼저 개선해야 할 온보딩 단계는 어디인가요?',
      },
    },
    {
      id: 'tr-3',
      time: '00:53',
      text: '그렇다면 이번 분기에는 온보딩 개선을 최우선 과제로 진행하는 방향이 좋겠습니다. 다른 신규 기능보다 먼저 사용자 경험을 개선하는 것이 효과가 클 것으로 보입니다.',
      hasHint: false,
    },
    {
      id: 'tr-4',
      time: '01:22',
      text: '현재 개발 일정으로는 4월 말 베타, 5월 초 정식 출시가 가능하지만 QA 일정이 다소 부족할 수 있습니다. 기능 범위를 조정하면 일정은 충분히 맞출 수 있을 것 같습니다.',
      hasHint: false,
    },
    {
      id: 'tr-5',
      time: '01:33',
      text: '현재 온보딩은 정보를 한 번에 너무 많이 보여주고 있습니다. 핵심 기능을 먼저 체험할 수 있도록 단계를 줄이고, 필요한 설명은 이후에 자연스럽게 안내하는 방식이 좋을 것 같습니다.',
      hasHint: false,
    },
  ])

  const [chatModel, setChatModel] = useState<AiChatViewModel>({
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: '이탈 원인이 무엇인지 분석해줘',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content:
          '현재 회의 내용과 프로젝트 데이터를 종합하면 이탈 원인은 다음과 같습니다.\n\n• 2단계에서 정보량이 많아 사용자의 인지 부담이 증가했습니다.\n• 핵심 기능을 체험하기 전 긴 설명이 이어져 초기 흥미가 감소했을 가능성이 있습니다.\n• 평균 완료 시간이 길어질수록 온보딩 중 이탈률이 증가하는 패턴이 확인됩니다.\n\n추천 개선안\n• 핵심 기능을 먼저 경험하도록 온보딩 순서를 재구성합니다.\n• 설명 중심 화면을 줄이고, 필요한 시점에 안내를 제공합니다.\n• 2단계를 세분화하거나 정보를 축약하여 완료 시간을 단축합니다.',
      },
    ],
    draft: '',
    suggestions: [
      { id: 'sug-1', label: '지난 회의에서는 이 범위 어디까지 정했어?' },
      { id: 'sug-2', label: '오늘 내가 맡은 부분은?' },
    ],
    isSending: false,
  })

  const sampleProjects = [
    { id: 'proj-1', name: '회의 보조 AI, 씽큐' },
    { id: 'proj-2', name: '서비스 디자인' },
  ]
  const [activeProjectId, setActiveProjectId] = useState<string>('proj-1')

  const sampleMembers: MeetingMember[] = [
    {
      id: 'm-1',
      name: '윤금서',
      role: 'Design (you)',
      isOwner: true,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Geumseo',
    },
    {
      id: 'm-2',
      name: '캐서디',
      role: '딜러',
      isOwner: false,
    },
    {
      id: 'm-3',
      name: '애쉬',
      role: '딜러',
      isOwner: false,
    },
    {
      id: 'm-4',
      name: '도로롱',
      role: '개발',
      isOwner: false,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dororong',
    },
  ]

  useEffect(() => {
    let active = true

    void fetchMeetingDetail(meetingRecordId).then((data) => {
      if (!active) return
      setMeetingData(data)
      setEditTitleInput(data.meetingTitle)
    })

    return () => {
      active = false
    }
  }, [meetingRecordId])

  if (!meetingData) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>
  }

  const { personalSummary } = meetingData

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}분`
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    const yy = String(date.getFullYear()).slice(-2)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yy}.${mm}.${dd}`
  }

  const handleConfirmEditTitle = async () => {
    if (!editTitleInput.trim()) return
    await updateMeetingTitle(meetingData.meetingId, editTitleInput.trim())
    setMeetingData((prev) => (prev ? { ...prev, meetingTitle: editTitleInput.trim() } : null))
    setIsEditModalOpen(false)
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      <ProjectSidebar
        accountSettingsActions={{
          onOpenAccountInfo: () => navigate('/settings/account'),
        }}
        user={user}
        projects={sampleProjects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onAddProject={() => {}}
      />

      <main className="flex-1 h-full overflow-hidden flex flex-col bg-white text-gray-900 pb-20">
        <div className="px-12 pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <img src="/assets/images/arrow-left.png" alt="뒤로가기" className="size-5" />
                </button>
                <h1 className="text-2xl font-bold">{meetingData.meetingTitle}</h1>
                <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded">
                  {meetingData.roleTag}
                </span>
                <span className="px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded">
                  {meetingData.perspectiveTag}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="small" variant="primaryFill" className="text-xs px-3">
                  프로젝트로 돌아가기
                </Button>
                <MeetingSettingsMenu
                  members={sampleMembers}
                  onEditTitle={() => {
                    setEditTitleInput(meetingData.meetingTitle)
                    setIsEditModalOpen(true)
                  }}
                  onDeleteMeeting={() => {
                    if (confirm('회의를 삭제하시겠습니까?')) {
                      console.log('회의 삭제 진행')
                    }
                  }}
                />
              </div>
            </div>

            <div className="text-sm text-gray-400 mb-8 ml-8">
              {meetingData.round} &nbsp;|&nbsp; {formatDate(meetingData.completedAt)} &nbsp;|&nbsp;{' '}
              {formatDuration(meetingData.durationSeconds)}
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
            <div className="max-w-6xl mx-auto px-12 py-8 space-y-10 pb-16">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-brand-primary text-fg-inverse text-xs font-bold rounded">
                    {personalSummary.roleBadge}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">내 관점 요약</h2>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-[#F8F9FA] p-5 rounded-xl">
                  {personalSummary.roleSummary}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">나에게 영향 있는 내용</h2>
                <ul className="space-y-2">
                  {personalSummary.impacts.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-700 leading-relaxed"
                    >
                      <span className="mr-2 text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">내 액션 아이템</h2>
                <ul className="space-y-2">
                  {personalSummary.actionItems.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-700 leading-relaxed"
                    >
                      <span className="mr-2 text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">다시 확인하면 좋은 질문</h2>
                <div className="space-y-3">
                  {personalSummary.questions.map((q, idx) => (
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
          )}

          {activeTab === 'allSummary' && (
            <div className="max-w-6xl mx-auto px-12 py-8">
              <MeetingAllSummaryTab />
            </div>
          )}

          {activeTab === 'allRecord' && (
            <MeetingAllRecordTab
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

// ==========================================
// 3. 전체 기록 탭 및 AI Chat 스플릿 뷰
// ==========================================

interface MeetingAllRecordTabProps {
  transcripts: TranscriptItem[]
  setTranscripts: React.Dispatch<React.SetStateAction<TranscriptItem[]>>
  chatModel: AiChatViewModel
  setChatModel: React.Dispatch<React.SetStateAction<AiChatViewModel>>
}

function MeetingAllRecordTab({
  transcripts,
  setTranscripts,
  chatModel,
  setChatModel,
}: MeetingAllRecordTabProps) {
  const [onlyTranscript, setOnlyTranscript] = useState(true)
  const [includeMyAiRecord, setIncludeMyAiRecord] = useState(true)
  const [aiChatVariant, setAiChatVariant] = useState<'docked' | 'floating'>('docked')
  const [isHintOpen, setIsHintOpen] = useState(true)

  const chatActions: AiChatActions = {
    onDraftChange: (draft) => setChatModel((prev) => ({ ...prev, draft })),
    onSend: () => {
      if (!chatModel.draft.trim()) return
      setChatModel((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { id: Date.now().toString(), role: 'user', content: prev.draft },
        ],
        draft: '',
      }))
    },
    onSelectSuggestion: (id) => {
      const selected = chatModel.suggestions.find((s) => s.id === id)
      if (selected) {
        setChatModel((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            { id: Date.now().toString(), role: 'user', content: selected.label },
          ],
        }))
      }
    },
    onClearContext: () => {
      setChatModel((prev) => ({ ...prev, pinnedContext: null }))
    },
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string>('')

  const handleStartEdit = (item: TranscriptItem) => {
    setEditingId(item.id)
    setEditingText(item.text)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return
    setTranscripts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, text: editingText.trim(), isEdited: true } : item,
      ),
    )
    setEditingId(null)
    setEditingText('')
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
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="h-[52px] shrink-0 border-b border-gray-200 px-12 flex items-center">
            <h2 className="text-base font-bold text-gray-900">전체 전사</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-12 py-6 space-y-6">
            {transcripts.map((item) => {
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
                          className="px-3 py-1 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          disabled={!isChanged}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            isChanged
                              ? 'bg-brand-primary text-white hover:bg-blue-600'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          저장
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

                  {item.hasHint && item.hintData && (
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
                          <div className="flex items-start gap-3 text-xs">
                            <span className="shrink-0 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 font-semibold rounded-md min-w-[56px] text-center">
                              의미
                            </span>
                            <p className="text-gray-700 pt-0.5 leading-relaxed">
                              {item.hintData.meaning}
                            </p>
                          </div>

                          <div className="flex items-start gap-3 text-xs">
                            <span className="shrink-0 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 font-semibold rounded-md min-w-[56px] text-center">
                              내 영향
                            </span>
                            <p className="text-gray-700 pt-0.5 leading-relaxed">
                              {item.hintData.myImpact}
                            </p>
                          </div>

                          <div className="flex items-start gap-3 text-xs">
                            <span className="shrink-0 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 font-semibold rounded-md min-w-[56px] text-center">
                              팀 질문
                            </span>
                            <p className="text-gray-700 pt-0.5 leading-relaxed">
                              {item.hintData.teamQuestion}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {includeMyAiRecord && aiChatVariant === 'docked' && (
          <div className="w-[420px] shrink-0 h-full">
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

function MeetingAllSummaryTab() {
  const keywords = [
    'MVP 기능 설계',
    '일정 재조율',
    '역할 재배분',
    '로그인/회원가입 포함',
    'QA 리소스 확보',
    '베타 범위 조정',
    '온보딩 개선',
    '결제 모듈 연동',
    '핵심 기능 우선순위',
    '스프린트 계획',
    '후속 액션',
    '사용자 이탈률',
  ]

  const mainDiscussions = [
    {
      title: '온보딩 개선 우선순위',
      items: [
        '신규 사용자 이탈률 감소를 위해 온보딩 개선을 최우선 과제로 선정',
        '핵심 기능을 먼저 노출하는 구조로 개편 필요',
      ],
    },
    {
      title: '출시 일정 검토',
      items: [
        '4월 말 베타, 5월 초 정식 출시 일정 공유',
        '현재 일정 기준으로는 QA 기간이 다소 부족할 가능성 논의',
      ],
    },
    {
      title: '리소스 및 개발 일정',
      items: [
        '결제 모듈 개발과 온보딩 개발 일정이 일부 겹침',
        '기능 범위를 조정해 일정 리스크를 줄이는 방안 검토',
      ],
    },
    {
      title: 'QA 계획',
      items: [
        '테스트 기간 확보 필요',
        '베타 전 주요 사용자 시나리오 중심으로 우선 검증하기로 의견 제시',
      ],
    },
  ]

  const decisions = [
    '온보딩 개선을 이번 분기 최우선 개발 과제로 진행한다.',
    '4월 말 베타, 5월 초 정식 출시를 목표 일정으로 유지한다.',
    '핵심 사용자 경험 개선 기능부터 우선 개발한다.',
    '다음 스프린트 계획에 온보딩 개선 일정을 반영한다.',
  ]

  const discussionDirections = [
    'QA 기간 확보를 위해 출시 일정을 조정할지 검토한다.',
    '베타 버전 기능 범위를 일부 축소하는 방안을 검토한다.',
    '결제 모듈 개발 리소스 재배분 여부를 다음 회의에서 논의한다.',
  ]

  const actionNeeds = [
    'QA 인력 추가 확보 가능 여부 확인',
    '디자인 완료 일정 및 개발 착수 일정 확정',
    '결제 모듈 개발 일정과 온보딩 일정 충돌 여부 확인',
  ]

  return (
    <div className="space-y-10 pb-16 text-gray-900">
      <section>
        <h2 className="text-lg font-bold mb-4">핵심 키워드</h2>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, idx) => (
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
        <p className="text-sm text-gray-800 leading-relaxed">
          온보딩 개선을 이번 분기 핵심 과제로 확정하고, 출시 일정과 QA 리소스 확보 방안을 중심으로
          논의했습니다.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">주요 논의</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mainDiscussions.map((card, idx) => (
            <div key={idx} className="p-5 bg-surface-muted rounded-2xl border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">{card.title}</h3>
              <ul className="space-y-2">
                {card.items.map((item, itemIdx) => (
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
          {decisions.map((item, idx) => (
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
          {discussionDirections.map((item, idx) => (
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
          {actionNeeds.map((item, idx) => (
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
