import type {
  TranscriptHintResponse,
  TranscriptSegmentResponse,
} from '../../../shared/api/contracts/meeting.contracts'

export type TranscriptSegment = TranscriptSegmentResponse

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
  onSaveEdit?: () => void
  onRetryHint?: (segmentId: string) => void
}
