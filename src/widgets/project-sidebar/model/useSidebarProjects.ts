import { useEffect, useState } from 'react'

import { listProjectSummaries } from '../../../entities/project'

export type SidebarProjectSummary = {
  id: string
  name: string
}

/**
 * 페이지 이동 때마다 빈 목록으로 시작하면 사이드바가 깜빡이므로,
 * 마지막 조회 결과를 세션 동안 기억해 두었다가 즉시 보여주고 백그라운드로 갱신합니다.
 */
let cachedProjects: SidebarProjectSummary[] | undefined

/**
 * 프로젝트 데이터를 직접 관리하지 않는 페이지(설정 화면 등)에서
 * 사이드바에 표시할 프로젝트 목록을 조회합니다.
 */
export function useSidebarProjects(): SidebarProjectSummary[] {
  const [projects, setProjects] = useState<SidebarProjectSummary[]>(cachedProjects ?? [])

  useEffect(() => {
    let active = true

    listProjectSummaries()
      .then((loaded) => {
        const next = loaded.map(({ id, name }) => ({ id, name }))
        cachedProjects = next
        if (!active) return
        setProjects(next)
      })
      .catch(() => {
        // 조회 실패 시 캐시된(또는 빈) 목록을 그대로 유지합니다.
      })

    return () => {
      active = false
    }
  }, [])

  return projects
}
