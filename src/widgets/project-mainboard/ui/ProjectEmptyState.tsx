import { Button } from '../../../shared/ui'

import emptyProjectImage from '../assets/project-empty-state.png'
import plusPrimaryButtonIcon from '../assets/plus-primary-button.svg'

type ProjectEmptyStateProps = {
  onCreateProject?: () => void
}

export function ProjectEmptyState({
  onCreateProject,
}: ProjectEmptyStateProps) {
  return (
    <section className="flex flex-col items-center gap-xl text-center">
      <div className="flex flex-col items-center gap-s">
        <img
          alt=""
          aria-hidden="true"
          className="h-[260px] w-[420px] max-w-full object-contain"
          height="260"
          src={emptyProjectImage}
          width="420"
        />
        <p className="typo-title-02 text-fg-secondary">
          아직 생성한 프로젝트가 없습니다.
          <br />
          새 프로젝트를 만들어보세요.
        </p>
      </div>
      <Button
        leftIcon={
          <span className="flex size-[28px] items-center justify-center">
            <img
              alt=""
              aria-hidden="true"
              className="size-[17.5px]"
              height="17.5"
              src={plusPrimaryButtonIcon}
              width="17.5"
            />
          </span>
        }
        onClick={onCreateProject}
        size="large"
      >
        프로젝트 생성하기
      </Button>
    </section>
  )
}
