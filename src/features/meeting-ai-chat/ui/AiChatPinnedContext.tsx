import closeIcon from '../../../shared/assets/icons/close.svg'
import pinIcon from '../../../shared/assets/icons/pin.svg'
import { Button } from '../../../shared/ui'
import type { AiChatPinnedContext as AiChatPinnedContextModel } from '../../../shared/api/contracts/meeting.contracts'

export type AiChatPinnedContextProps = {
  context: AiChatPinnedContextModel
  onClear: () => void
}

export function AiChatPinnedContext({ context, onClear }: AiChatPinnedContextProps) {
  return (
    <section
      aria-label="AI 질문 전사 컨텍스트"
      className="flex min-h-[100px] items-start gap-xs border-x border-b border-line-default bg-surface-elevated px-m py-m typo-transcription-body-01 text-fg-primary"
    >
      <img alt="" aria-hidden="true" className="size-[24px] shrink-0" src={pinIcon} />
      <p className="m-0 min-w-0 flex-1">{context.text}</p>
      <Button
        aria-label="전사 컨텍스트 제거"
        className="size-[32px] px-0!"
        onClick={onClear}
        size="small"
        variant="basic"
      >
        <img alt="" aria-hidden="true" className="size-[24px]" src={closeIcon} />
      </Button>
    </section>
  )
}
