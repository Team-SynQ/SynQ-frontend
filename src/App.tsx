import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  InputBox,
  Modal,
  Panel,
  ProjectMenuItem,
  Radio,
  Segment,
  SegmentItem,
  Toast,
} from './shared/ui'

function App() {
  return (
    <main className="min-h-screen bg-surface-muted px-m py-l text-fg-primary">
      <section className="mx-auto flex max-w-7xl flex-col gap-l">
        <header className="flex flex-col gap-xs">
          <Badge size="extraSmall">Shared UI</Badge>
          <h1 className="typo-heading">SynQ 공통 컴포넌트</h1>
          <p className="max-w-3xl typo-body-01 text-fg-secondary">
            Figma 디자인 시스템의 컴포넌트를 FSD 구조에 맞춰 shared/ui에 가볍게 구성한 미리보기입니다.
          </p>
        </header>

        <div className="grid gap-m xl:grid-cols-[260px_1fr]">
          <Panel
            footer={
              <Button size="small" variant="basic">
                접기
              </Button>
            }
            header={<strong className="typo-title-02">SynQ</strong>}
            type="unfolded"
          >
            <ProjectMenuItem visualState="active">프로젝트 홈</ProjectMenuItem>
            <ProjectMenuItem>회의 기록</ProjectMenuItem>
            <ProjectMenuItem visualState="hover">AI 참고 자료</ProjectMenuItem>
          </Panel>

          <div className="grid gap-m">
            <section className="rounded-m border-stroke-md border-line-default bg-surface-elevated p-m">
              <h2 className="typo-title-02">Button</h2>
              <div className="mt-s flex flex-wrap items-center gap-s">
                <Button size="large">PrimaryFill</Button>
                <Button size="large" variant="primaryLine">
                  PrimaryLine
                </Button>
                <Button size="large" variant="fillGray100">
                  FillGray100
                </Button>
                <Button size="large" variant="basic">
                  Basic
                </Button>
                <Button disabled size="large">
                  Disabled
                </Button>
              </div>
              <div className="mt-s flex flex-wrap items-center gap-s">
                <Button size="medium">Medium</Button>
                <Button size="small">Small</Button>
              </div>
            </section>

            <section className="grid gap-m lg:grid-cols-2">
              <div className="rounded-m border-stroke-md border-line-default bg-surface-elevated p-m">
                <h2 className="typo-title-02">InputBox</h2>
                <div className="mt-s grid gap-s">
                  <InputBox label="프로젝트명" placeholder="프로젝트명을 입력하세요" size="large" />
                  <InputBox label="검색" placeholder="회의록 검색" visualState="active" />
                  <InputBox errorText="필수 입력 항목입니다" label="역할" placeholder="역할을 입력하세요" />
                  <InputBox disabled label="비활성 입력" placeholder="입력할 수 없습니다" />
                </div>
              </div>

              <div className="rounded-m border-stroke-md border-line-default bg-surface-elevated p-m">
                <h2 className="typo-title-02">Segment / Selection / Badge</h2>
                <div className="mt-s flex flex-col gap-s">
                  <Segment>
                    <SegmentItem visualState="active">요약</SegmentItem>
                    <SegmentItem>원문</SegmentItem>
                  </Segment>
                  <div className="flex flex-wrap gap-s">
                    <Checkbox defaultChecked label="회의록 포함" />
                    <Checkbox label="자료 포함" />
                    <Radio defaultChecked label="공개" name="visibility" />
                    <Radio label="비공개" name="visibility" />
                  </div>
                  <div className="flex flex-wrap gap-xs">
                    <Badge>진행중</Badge>
                    <Badge size="extraSmall">새 회의</Badge>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-m lg:grid-cols-2">
              <Modal
                description="선택한 회의 기록을 삭제하면 다시 복구할 수 없습니다."
                title="회의 기록을 삭제할까요?"
              />
              <div className="grid gap-m">
                <Toast description="프로젝트 설정이 반영되었습니다." title="저장되었습니다" type="success" />
                <Toast description="잠시 후 다시 시도해주세요." title="저장에 실패했습니다" type="error" />
              </div>
            </section>

            <section className="rounded-m border-stroke-md border-line-default bg-surface-elevated p-m">
              <EmptyState
                action={<Button variant="primaryLine">프로젝트 만들기</Button>}
                description="새 프로젝트를 만들고 회의 자료를 연결해보세요."
                title="아직 프로젝트가 없습니다"
              />
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
