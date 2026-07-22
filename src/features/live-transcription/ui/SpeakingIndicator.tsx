import voiceRecordingIcon from '../assets/voice-recording.png'

export function SpeakingIndicator() {
  return (
    <div className="flex w-full items-center rounded-m p-s">
      <img alt="" aria-hidden="true" className="size-[36px]" src={voiceRecordingIcon} />
      <span className="sr-only">발화 인식 중</span>
    </div>
  )
}
