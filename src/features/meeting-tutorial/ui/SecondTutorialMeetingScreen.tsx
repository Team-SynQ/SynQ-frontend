import chevronDownIcon from '../../../shared/assets/icons/chevron-down.svg'
import closeIcon from '../../../shared/assets/icons/close.svg'
import editIcon from '../../../shared/assets/icons/edit.svg'
import minimizeIcon from '../../../shared/assets/icons/minimize.svg'
import pauseIcon from '../../../shared/assets/icons/pause.svg'
import pinIcon from '../../../shared/assets/icons/pin.svg'
import refreshIcon from '../../../shared/assets/icons/refresh.svg'
import { Button, ChatInput, LiveStatus } from '../../../shared/ui'

const transcriptItems = [
  {
    time: '14:44',
    text: '이번 스프린트에서는 신규 온보딩 개선을 우선순위로 가져가려고 합니다. 사용자 이탈이 가장 많이 발생하는 첫 사용 경험을 개선하는 것이 이번 목표입니다.',
    minHeight: 126,
  },
  {
    time: '15:03',
    text: '기존 온보딩은 단계가 많아서 중간에 이탈하는 사용자가 많았습니다. 핵심 기능을 먼저 보여주고 필요한 내용만 순서대로 안내하는 방향으로 수정하면 좋겠습니다.',
    minHeight: 126,
  },
  {
    time: '15:34',
    text: '기능 구현 자체는 어렵지 않습니다. 다만 애니메이션과 상태 저장 기능까지 포함하면 일정이 조금 늘어날 수 있습니다.',
    minHeight: 101,
  },
] as const

const hintItems = [
  ['의미', '온보딩 개선이 이번 분기 핵심 우선순위라는 뜻입니다.'],
  ['내 영향', '일정과 리소스 배분에 영향이 있을 수 있습니다'],
  ['팀 질문', '온보딩 개선의 완료 기준은 무엇인가요?'],
] as const

export function SecondTutorialMeetingScreen() {
  return (
    <main
      className="grid size-full min-h-[720px] min-w-[1024px] grid-rows-[88px_minmax(0,1fr)] overflow-hidden bg-surface-default text-fg-primary"
      data-second-tutorial-screen
    >
      <MeetingHeader />

      <div
        className="grid min-h-0"
        style={{ gridTemplateColumns: 'minmax(0,1fr) clamp(360px,34.722vw,500px)' }}
      >
        <TranscriptPanel />
        <AiChatPanel />
      </div>
    </main>
  )
}

function MeetingHeader() {
  return (
    <header className="flex items-center justify-between bg-surface-elevated px-l">
      <div className="flex min-w-0 items-center gap-s whitespace-nowrap">
        <strong className="typo-title-01">서비스디자인</strong>
        <span className="typo-title-02 text-fg-secondary">2차 대면회의</span>
        <LiveStatus className="h-[32px] border-0 bg-semantic-error-surface px-m font-normal" />
      </div>

      <div className="flex shrink-0 items-center gap-s whitespace-nowrap">
        <span className="p-xs typo-transcription-body-01 text-fg-secondary">16:13</span>
        <img alt="일시 정지" className="size-[42px]" src={pauseIcon} />
        <Button size="medium">회의 종료</Button>
      </div>
    </header>
  )
}

function TranscriptPanel() {
  return (
    <section className="grid min-h-0 grid-rows-[60px_minmax(0,1fr)]">
      <header className="flex items-center justify-between border-y border-line-default bg-surface-elevated px-l">
        <h1 className="m-0 typo-title-02 text-gray-700">전체 전사</h1>
        <img alt="새로고침" className="size-[24px]" src={refreshIcon} />
      </header>

      <div className="min-h-0 overflow-y-auto px-l pb-m pt-[37px]">
        <div className="flex flex-col">
          <div className="flex flex-col gap-s min-[1440px]:h-[413px]">
            {transcriptItems.map((item, index) => (
              <article
                className="shrink-0 rounded-m p-s"
                data-tutorial-target={`transcript-${index + 1}`}
                key={item.time}
                style={{ minHeight: item.minHeight }}
              >
                <p className="m-0 mb-s typo-body-01 text-gray-400">{item.time}</p>
                <p className="m-0 typo-transcription-body-01">{item.text}</p>
              </article>
            ))}
          </div>

          <SelectedUtterance />
          <div className="mt-xs">
            <SynqHint />
          </div>
        </div>
      </div>
    </section>
  )
}

function SelectedUtterance() {
  return (
    <article
      className="min-h-[106px] shrink-0 rounded-m bg-surface-muted p-s"
      data-tutorial-target="selected-utterance"
    >
      <div className="flex items-center justify-between typo-body-01 text-gray-400">
        <span>16:02</span>
        <div className="flex items-center gap-s">
          <img alt="발화 수정" className="size-[24px]" src={editIcon} />
          <Button size="small">AI 에게 질문하기</Button>
        </div>
      </div>
      <p className="m-0 mt-s typo-transcription-body-01">
        일정을 조금 타이트하게 잡아봤는데요. 온보딩 개선을 4월 말까지 베타로 제공하고 5월 초 정식
        릴리즈를 목표로 하고 있습니다.
      </p>
    </article>
  )
}

function SynqHint() {
  return (
    <article
      className="min-h-[216px] shrink-0 scroll-mb-px rounded-m bg-surface-muted p-s"
      data-tutorial-target="synq-hint"
    >
      <div className="mb-s flex items-center justify-between typo-body-01 text-gray-800">
        <span>SynQ 힌트</span>
        <img alt="힌트 접기" className="size-[24px]" src={chevronDownIcon} />
      </div>

      <div className="flex flex-col gap-xs">
        {hintItems.map(([label, description]) => (
          <div className="flex min-h-[42px] items-center gap-s" key={label}>
            <span className="flex w-[81px] shrink-0 items-center justify-center rounded-s bg-surface-elevated px-[12px] py-xs typo-body-01">
              {label}
            </span>
            <span className="min-w-0 typo-transcription-body-01">{description}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function AiChatPanel() {
  return (
    <aside className="relative grid min-h-0 grid-rows-[60px_100px_minmax(0,1fr)_224px] overflow-hidden bg-surface-elevated">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[2px]"
        data-tutorial-target="ai-chat-panel"
      />
      <header className="flex items-center justify-between border border-line-default px-m">
        <h2 className="m-0 typo-title-02">AI Chat</h2>
        <img alt="AI Chat 최소화" className="size-[24px]" src={minimizeIcon} />
      </header>

      <div className="flex items-start gap-xs border border-line-default px-m py-m typo-transcription-body-01">
        <img alt="고정된 발화" className="size-[24px] shrink-0" src={pinIcon} />
        <p className="m-0 min-w-0 flex-1">
          일정을 조금 타이트하게 잡아봤는데요. 온보딩 개선을 4월 말까지 베타로 제공하고 5월 초 정식
          릴리즈를 목표로 하고 있습니다.
        </p>
        <img alt="닫기" className="size-[24px] shrink-0" src={closeIcon} />
      </div>

      <ChatConversation />
      <ChatComposer />
    </aside>
  )
}

function ChatConversation() {
  return (
    <div className="flex min-h-0 flex-col overflow-y-auto border-x border-line-default bg-surface-muted p-m">
      <div className="mr-[-4px] flex min-h-[50px] max-w-full shrink-0 items-center self-end rounded-bl-m rounded-tl-m rounded-tr-m bg-gray-700 px-s typo-transcription-body-01 text-fg-inverse">
        이 일정의 현실성과 리스크를 분석해 줘
      </div>

      <div
        className="mt-m w-full max-w-[400px] shrink-0 rounded-br-m rounded-tl-m rounded-tr-m border border-surface-muted bg-surface-elevated p-s typo-transcription-body-01"
        data-chat-response
      >
        <p className="m-0">
          4월 말 베타, 5월 초 릴리즈 일정이 현실적으로 가능한지 리스크를 분석해 드립니다.
        </p>
        <ul className="my-s list-disc pl-m">
          <li>
            일정 리스크 분석: 현재 팀의 개발 공수를 고려할 때, 5월 초 정식 릴리즈는 다소 공격적인
            목표입니다.
          </li>
          <li>
            주요 병목 포인트: 온보딩 개편은 다양한 환경에서의 예외 케이스 처리가 필수적이므로, QA
            기간을 최소 1주일 이상 확보해야 합니다.
          </li>
          <li>
            특히 다음 주 예정된 '결제 모듈 연동 테스트'와 작업 리소스가 겹칠 경우 지연 가능성이 매우
            높습니다.
          </li>
        </ul>
        <p className="m-0 rounded-s bg-surface-muted px-[12px] py-[10px]">
          제안: 정식 릴리즈를 1주일 연기하거나, 베타 버전의 범위를 '핵심 이탈 방지' 기능으로 좁히는
          것을 권장합니다.
        </p>
      </div>

      <div
        className="mt-[9px] flex shrink-0 items-center gap-xs typo-transcription-body-01"
        data-chat-attachments
      >
        <span className="flex h-[42px] items-center rounded-s border border-surface-muted bg-surface-elevated px-[12px]">
          PRD.pdf
        </span>
        <span className="flex h-[42px] items-center rounded-s border border-surface-muted bg-surface-elevated px-[12px]">
          현재 회의 10:04
        </span>
      </div>
    </div>
  )
}

function ChatComposer() {
  return (
    <div className="flex min-h-0 flex-col justify-between border border-line-default bg-surface-elevated p-m">
      <div className="flex flex-col items-start gap-xs">
        <Button size="medium" variant="primaryLine">
          이 일정의 현실성과 리스크를 분석해 줘
        </Button>
        <Button size="medium" variant="primaryLine">
          QA 리소스 부족을 해결할 대안은?
        </Button>
      </div>
      <ChatInput
        className="text-[16px]"
        placeholder="프로젝트의 맥락에 대해 질문하세요."
        wrapperClassName="max-w-none"
      />
    </div>
  )
}
