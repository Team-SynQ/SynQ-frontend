import { useNavigate } from 'react-router-dom'

import { Button } from '../shared/ui'

export function MeetingSummaryPlaceholderPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-default px-l py-xl">
      <section className="flex w-full max-w-[520px] flex-col items-center gap-l rounded-[20px] border-stroke-md border-line-default bg-surface-default p-xl text-center shadow-panel">
        <div className="flex flex-col gap-s">
          <h1 className="m-0 typo-heading text-fg-primary">회의 정리</h1>
          <p className="m-0 typo-body-01 text-fg-secondary">
            회의 기록 상세 화면은 준비 중입니다.
          </p>
        </div>
        <Button className="w-[200px]" onClick={() => navigate('/projects')} size="large">
          프로젝트로 돌아가기
        </Button>
      </section>
    </main>
  )
}
