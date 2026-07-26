import chevronLeftIcon from '../../../shared/assets/icons/chevron-left.svg'
import moreVerticalIcon from '../../../shared/assets/icons/more-vertical.svg'
import plusIcon from '../../../shared/assets/icons/plus.svg'
import sidebarIcon from '../../../shared/assets/icons/sidebar.svg'
import synqLogo from '../../../shared/assets/logos/synq-logo.svg'
import { cn } from '../../../shared/lib/cn'
import { Badge, Button, Checkbox, Panel, ProjectMenuItem, UserInfo } from '../../../shared/ui'

const reviewTabs = ['개인별 정리', '전체 정리', '전사 · 내 AI 기록 보기'] as const

const impactItems = [
  '온보딩 개선을 이번 분기 최우선 과제로 확정했습니다.',
  '4월 말 베타, 5월 초 정식 출시 일정을 유지하기로 했습니다.',
  'QA 리소스 부족 가능성이 있어 기능 범위를 일부 조정하는 방안을 검토하기로 했습니다.',
  '디자인 완료 일정과 개발 착수 일정을 다음 스프린트 계획에 반영해야 합니다.',
  '결제 모듈 개발 일정과 일부 인력이 겹쳐 일정 충돌 가능성이 확인되었습니다.',
] as const

const actionItems = [
  '온보딩 개선 기능 우선순위 최종 확정',
  '베타 버전 포함 기능(Scope) 확정',
  'QA 인력 확보 여부 확인',
  '개발 일정과 QA 일정 재조정',
] as const

const revisitQuestions = [
  {
    question: '온보딩 개선의 완료 기준은 무엇으로 정의하나요?',
    answer:
      '현재 회의에서는 가이드 UI 개선, 핵심 플로우 적용, 샘플 데이터 제공까지를 1차 완료 기준으로 논의했습니다. 세부 QA 통과 기준은 다음 회의에서 확정하기로 했습니다.',
  },
  {
    question: 'QA 기간은 최소 얼마나 확보할 수 있나요?',
    answer:
      '현재 일정 기준으로는 최소 1주 확보를 목표로 하고 있습니다. 개발 일정 변동 여부를 확인한 뒤 최종 확정할 예정입니다.',
  },
  {
    question: '베타 버전에서 제외 가능한 기능은 무엇인가요?',
    answer:
      '사용자 이탈 개선과 직접 관련 없는 고급 AI 추천 기능과 일부 부가 기능은 베타 이후 반영하는 방향으로 검토되었습니다.',
  },
] as const

export function ThirdTutorialMeetingScreen() {
  return (
    <main
      className="grid size-full min-h-[720px] min-w-[1024px] grid-cols-[220px_minmax(0,1fr)] overflow-hidden bg-surface-default text-fg-primary"
      data-third-tutorial-screen
    >
      <ProjectSidebar />
      <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)]">
        <ReviewTopBar />
        <ReviewTabs />
        <ReviewContent />
      </div>
    </main>
  )
}

function ProjectSidebar() {
  return (
    <Panel
      footer={<UserInfo email="HongilllDong@gmail.com" name="홍길동" />}
      header={<SidebarHeader />}
    >
      <ProjectMenuItem visualState="active">회의 보조 AI, 씽큐</ProjectMenuItem>
      <ProjectMenuItem>서비스 디자인</ProjectMenuItem>
    </Panel>
  )
}

function SidebarHeader() {
  return (
    <div className="flex w-full flex-col gap-m">
      <div className="flex items-center justify-between">
        <img alt="SynQ" className="h-[30px] w-[79px]" src={synqLogo} />
        <Button
          aria-label="사이드바 접기"
          className="size-[52px] px-0"
          size="large"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[28px]" src={sidebarIcon} />
        </Button>
      </div>
      <div className="flex items-center gap-s">
        <span className="flex-1 typo-body-01 text-fg-secondary">프로젝트</span>
        <Button
          aria-label="프로젝트 추가"
          className="size-[32px] px-0"
          size="small"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={plusIcon} />
        </Button>
      </div>
    </div>
  )
}

function ReviewTopBar() {
  return (
    <header className="flex items-start justify-between gap-s border-b border-line-default bg-surface-elevated p-m">
      <div className="flex flex-col gap-xs">
        <div className="flex items-center gap-s">
          <img alt="뒤로 가기" className="size-[28px]" src={chevronLeftIcon} />
          <strong className="typo-title-01">회의 기록</strong>
          <Badge size="extraSmall">PM</Badge>
          <Badge size="extraSmall">일정, 범위, 의사결정 영향 중심</Badge>
        </div>
        <div className="flex items-center gap-xs typo-body-02 text-fg-secondary">
          <span>4차 대면 회의</span>
          <span className="text-line-strong">|</span>
          <span>26.05.11</span>
          <span className="text-line-strong">|</span>
          <span>45분</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-s">
        <Button size="small">프로젝트로 돌아가기</Button>
        <Button aria-label="더보기" className="size-[32px] px-0" size="small" variant="basic">
          <img alt="" aria-hidden="true" className="size-[24px]" src={moreVerticalIcon} />
        </Button>
      </div>
    </header>
  )
}

function ReviewTabs() {
  return (
    <nav
      aria-label="회의 정리 탭"
      className="flex border-b-[2px] border-line-strong bg-surface-default"
    >
      {reviewTabs.map((tab, index) => (
        <button
          className={cn(
            '-mb-[2px] border-b-[2px] px-m py-s typo-title-02',
            index === 0 ? 'border-gray-900 text-fg-primary' : 'border-transparent text-line-strong',
          )}
          key={tab}
          type="button"
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}

function ReviewContent() {
  return (
    <div className="min-h-0 overflow-y-auto p-l">
      <Checkbox className="mb-m" label="나만 보기" />

      <div className="flex flex-col gap-s">
        <PerspectiveSummarySection />
        <ImpactSection />
        <ActionItemsSection />
        <RevisitQuestionsSection />
      </div>
    </div>
  )
}

function PerspectiveSummarySection() {
  return (
    <details>
      <summary
        className="flex list-none items-center gap-s rounded-[16px] border-stroke-md border-line-default bg-surface-elevated p-m shadow-floating [&::-webkit-details-marker]:hidden"
        data-tutorial-target="record-section-1"
      >
        <span className="flex h-[32px] items-center rounded-s bg-brand-primary px-s typo-body-02 text-fg-inverse">
          PM
        </span>
        <h2 className="m-0 typo-title-02">내 관점 요약</h2>
      </summary>
      <p className="m-0 mt-s typo-transcription-body-01 text-gray-800">
        이번 회의에서는 온보딩 개선을 이번 분기의 핵심 과제로 확정하고, 개발 일정과 리소스 배분, QA
        계획, 베타 출시 범위를 중심으로 논의했습니다. 프로젝트는 예정된 일정 내 출시를 목표로 하지만
        QA 기간과 기능 범위에 대한 추가 조율이 필요하며, PM은 우선순위와 일정 관리를 중심으로 후속
        의사결정을 진행해야 합니다.
      </p>
    </details>
  )
}

function ImpactSection() {
  return (
    <details>
      <SectionSummary target="record-section-2" title="나에게 영향 있는 내용" />
      <ul className="m-0 mt-s flex list-none flex-col gap-xs p-0 typo-transcription-body-01">
        {impactItems.map((item) => (
          <li className="flex gap-xs" key={item}>
            <span aria-hidden="true">-</span>
            {item}
          </li>
        ))}
      </ul>
    </details>
  )
}

function ActionItemsSection() {
  return (
    <details>
      <SectionSummary target="record-section-3" title="내 액션 아이템" />
      <ul className="m-0 mt-s flex list-none flex-col gap-xs p-0 typo-transcription-body-01 text-gray-800">
        {actionItems.map((item) => (
          <li className="flex gap-xs" key={item}>
            <span aria-hidden="true">-</span>
            {item}
          </li>
        ))}
      </ul>
    </details>
  )
}

function RevisitQuestionsSection() {
  return (
    <details>
      <SectionSummary target="record-section-4" title="다시 확인하면 좋은 질문" />
      <div className="mt-s flex flex-col gap-s">
        {revisitQuestions.map(({ question, answer }) => (
          <div className="flex flex-col gap-xs rounded-m bg-surface-muted p-s" key={question}>
            <p className="m-0 rounded-s bg-surface-elevated p-s typo-transcription-body-01">{`Q. ${question}`}</p>
            <p className="m-0 rounded-s p-s typo-transcription-body-01">{`A. ${answer}`}</p>
          </div>
        ))}
      </div>
    </details>
  )
}

function SectionSummary({ target, title }: { target: string; title: string }) {
  return (
    <summary
      className="flex list-none items-center justify-between rounded-[16px] border-stroke-md border-line-default bg-surface-elevated p-m shadow-floating [&::-webkit-details-marker]:hidden"
      data-tutorial-target={target}
    >
      <h2 className="m-0 typo-title-02">{title}</h2>
      <Button aria-label="더보기" className="size-[32px] px-0" size="small" variant="basic">
        <img alt="" aria-hidden="true" className="size-[24px]" src={moreVerticalIcon} />
      </Button>
    </summary>
  )
}
