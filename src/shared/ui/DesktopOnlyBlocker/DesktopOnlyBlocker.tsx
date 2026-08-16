export const DesktopOnlyBlocker = () => {
  return (
    // lg(1024px) 미만 화면(모바일·태블릿)에서만 전체 화면으로 안내 오버레이 노출
    <aside
      aria-label="모바일 접속 제한 안내"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white px-6 text-center lg:hidden"
    >
      <div className="flex max-w-sm flex-col items-center">
        <img
          src="/assets/images/desktop-only.png"
          alt="PC 화면 권장 안내"
          className="mb-8 h-auto w-52 select-none pointer-events-none"
        />

        <h1 className="mb-3 text-xl font-bold text-gray-900">PC 환경에서 접속해 주세요</h1>

        <p className="text-sm leading-relaxed text-gray-600 break-keep">
          SynQ는 원활한 회의 녹음, 실시간 전사 및 AI 분석 기능을 위해{' '}
          <span className="font-semibold text-brand-primary">PC(데스크톱/노트북)</span> 환경에
          최적화되어 있습니다.
        </p>
      </div>
    </aside>
  )
}
