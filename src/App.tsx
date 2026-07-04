function App() {
  return (
    <main className="min-h-screen bg-surface-muted px-m py-l text-fg-primary">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center gap-l">
        <div className="space-y-s">
          <p className="typo-caption uppercase text-brand-primary">
            SynQ Frontend
          </p>
          <h1 className="max-w-3xl typo-heading">
            회의 중 이해와 협업을 돕는 실시간 AI 워크스페이스
          </h1>
          <p className="max-w-2xl typo-body-01 text-fg-secondary">
            프로젝트 자료와 지난 회의 맥락을 바탕으로 발화의 의미, 내 역할에
            대한 영향, 팀과 맞춰야 할 질문을 연결합니다.
          </p>
        </div>

        <div className="grid gap-s md:grid-cols-3">
          <div className="rounded-lg border-stroke-md border-line-default bg-surface-elevated p-m">
            <h2 className="typo-title-02">의미 이해</h2>
            <p className="mt-xs typo-body-02 text-fg-secondary">
              놓치기 쉬운 회의 발화의 맥락을 바로 확인합니다.
            </p>
          </div>
          <div className="rounded-lg border-stroke-md border-line-default bg-surface-elevated p-m">
            <h2 className="typo-title-02">역할별 영향</h2>
            <p className="mt-xs typo-body-02 text-fg-secondary">
              PM, 디자이너, 개발자 관점의 업무 영향을 파악합니다.
            </p>
          </div>
          <div className="rounded-lg border-stroke-md border-line-default bg-surface-elevated p-m">
            <h2 className="typo-title-02">팀 질문</h2>
            <p className="mt-xs typo-body-02 text-fg-secondary">
              회의 중 맞춰야 할 질문을 놓치지 않도록 돕습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
