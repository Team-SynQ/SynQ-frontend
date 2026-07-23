export type TranscriptSegment = {
  id: string
  startedAtSeconds: number
  text: string
}

export type TranscriptPanelState =
  | {
      kind: 'waiting'
    }
  | {
      kind: 'active'
      segments: TranscriptSegment[]
      isSpeaking: boolean
    }

export type TranscriptPanelActions = {
  onRefresh: () => void
  onSelectSegment?: (segmentId: string) => void
}
