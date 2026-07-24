import { formatElapsedTime } from '../../../entities/meeting'
import type { TranscriptSegment } from '../model/transcript.types'

export type TranscriptItemProps = {
  segment: TranscriptSegment
  onSelect?: (segmentId: string) => void
}

function TranscriptContent({ segment }: { segment: TranscriptSegment }) {
  return (
    <>
      <time className="typo-body-01 text-gray-400">
        {formatElapsedTime(segment.startedAtSeconds)}
      </time>
      <span className="block w-full typo-transcription-body-01 text-fg-primary">
        {segment.text}
      </span>
    </>
  )
}

export function TranscriptItem({ segment, onSelect }: TranscriptItemProps) {
  if (onSelect) {
    return (
      <button
        className="flex w-full flex-col items-start gap-s rounded-m p-s text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        onClick={() => onSelect(segment.id)}
        type="button"
      >
        <TranscriptContent segment={segment} />
      </button>
    )
  }

  return (
    <article className="flex w-full flex-col gap-s rounded-m p-s">
      <TranscriptContent segment={segment} />
    </article>
  )
}
