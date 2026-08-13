import type {
  TranscriptHintResponse,
  TranscriptSegmentResponse,
} from '../../../shared/api/contracts/meeting.contracts'

export type TranscriptSegment = TranscriptSegmentResponse & {
  /** 확정 전 중간 인식. 저장되지 않으며 화면에 흐리게 표시하고 선택·편집을 막는다. */
  isInterim?: boolean
  /** 이 전사에 생성된 힌트가 있다. 자동 생성분을 사용자가 눌러보기 전에 알리는 용도다. */
  hasHint?: boolean
}

export type TranscriptHintState =
  | { status: 'idle' }
  | { status: 'loading'; transcriptId: string }
  | {
      status: 'ready'
      transcriptId: string
      hint: TranscriptHintResponse
    }
  | {
      status: 'error'
      transcriptId: string
      message: string
    }

export type TranscriptEditState =
  | { status: 'idle' }
  | {
      status: 'editing'
      transcriptId: string
      originalText: string
      draftText: string
      errorMessage: string | null
      isSaving: boolean
    }

export type TranscriptPanelState =
  | {
      kind: 'waiting'
    }
  | {
      kind: 'active'
      segments: TranscriptSegment[]
      isSpeaking: boolean
      /** 회의 시작 시각. 있으면 전사 시각을 벽시계로 표시한다. */
      meetingStartedAt?: string | null
      selectedSegmentId?: string | null
      hintState?: TranscriptHintState
      editState?: TranscriptEditState
    }

export type TranscriptPanelActions = {
  onRefresh: () => void
  onSelectSegment?: (segmentId: string) => void
  onAskAi?: (segmentId: string) => void
  onStartEdit?: (segmentId: string) => void
  onEditDraftChange?: (value: string) => void
  onCancelEdit?: () => void
  onCollapseHint?: (segmentId: string) => void
  onSaveEdit?: () => void
  onRetryHint?: (segmentId: string) => void
}
