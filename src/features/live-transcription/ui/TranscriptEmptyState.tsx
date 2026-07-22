export function TranscriptEmptyState() {
  return (
    <div className="flex flex-col gap-s">
      <div className="flex h-[42px] items-center rounded-m border border-brand-primary bg-primary-100 px-s typo-body-02 text-brand-primary">
        발화를 클릭해 AI 힌트를 확인해보세요.
      </div>

      <div className="rounded-m p-s">
        <p className="m-0 typo-transcription-body-01 text-fg-secondary">
          아직 전사된 발화가 없습니다. 회의를 시작하면 이곳에 전사가 표시됩니다.
        </p>
      </div>
    </div>
  )
}
