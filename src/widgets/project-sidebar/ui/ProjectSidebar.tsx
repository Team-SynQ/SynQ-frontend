import { useState } from 'react'

import plusIcon from '../../../shared/assets/icons/plus.svg'
import sidebarIcon from '../../../shared/assets/icons/sidebar.svg'
import { cn } from '../../../shared/lib/cn'
import {
  Button,
  Logo,
  Panel,
  ProjectMenuItem,
  UserInfo,
} from '../../../shared/ui'

import type { ProjectSidebarUser } from '../model/projectSidebar.types'

type SidebarProject = {
  id: string
  name: string
}

type ProjectSidebarProps = {
  user?: ProjectSidebarUser
  projects?: SidebarProject[]
  activeProjectId?: string
  onAddProject?: () => void
  onSelectProject?: (projectId: string) => void
  onToggleSidebar?: () => void
}

export function ProjectSidebar({
  user,
  projects = [],
  activeProjectId,
  onAddProject,
  onSelectProject,
  onToggleSidebar,
}: ProjectSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggleSidebar = () => {
    setIsCollapsed((current) => !current)
    onToggleSidebar?.()
  }

  return (
    <Panel
      className="h-screen shrink-0"
      footer={
        user && !isCollapsed ? (
          <UserInfo email={user.email} name={user.name} />
        ) : undefined
      }
      type={isCollapsed ? 'fold' : 'unfolded'}
      header={
        <div className="flex w-full items-center justify-between">
          <div
            aria-hidden={isCollapsed}
            className={cn(
              'overflow-hidden transition-[width,opacity,transform] duration-200 ease-out motion-reduce:transition-none',
              isCollapsed
                ? 'w-0 -translate-x-xs opacity-0'
                : 'w-[79px] translate-x-0 opacity-100',
            )}
          >
            <Logo />
          </div>
          <Button
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            className="aspect-square px-0"
            onClick={handleToggleSidebar}
            size="large"
            variant="basic"
          >
            <img
              alt=""
              aria-hidden="true"
              className="size-[28px]"
              height="28"
              src={sidebarIcon}
              width="28"
            />
          </Button>
        </div>
      }
    >
      <div className="flex w-full items-center gap-s">
        <span
          aria-hidden={isCollapsed}
          className={cn(
            'min-w-0 flex-1 overflow-hidden whitespace-nowrap typo-body-01 text-fg-secondary transition-[max-width,opacity,transform] duration-200 ease-out motion-reduce:transition-none',
            isCollapsed
              ? 'max-w-0 -translate-x-xs opacity-0'
              : 'max-w-[120px] translate-x-0 opacity-100',
          )}
        >
          프로젝트
        </span>
        <Button
          aria-label="프로젝트 추가"
          className="aspect-square px-0"
          leftIcon={(
            <span
              aria-hidden="true"
              className="block size-[24px] shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
              style={{
                maskImage: `url("${plusIcon}")`,
                WebkitMaskImage: `url("${plusIcon}")`,
              }}
            />
          )}
          onClick={onAddProject}
          size="small"
          variant="basic"
        />
      </div>
      {!isCollapsed && projects.length > 0 ? (
        <div className="flex w-full flex-col gap-xs">
          {projects.map((project) => (
            <ProjectMenuItem
              aria-current={project.id === activeProjectId ? 'page' : undefined}
              key={project.id}
              onClick={() => onSelectProject?.(project.id)}
              visualState={project.id === activeProjectId ? 'active' : 'default'}
            >
              {project.name}
            </ProjectMenuItem>
          ))}
        </div>
      ) : null}
    </Panel>
  )
}
