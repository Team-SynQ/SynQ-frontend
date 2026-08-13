import { useEffect, useState } from 'react'

import { listProjectSummaries } from '../../../entities/project'

export type SidebarProjectSummary = {
  id: string
  name: string
}

/**
 * 프로젝트 데이터를 직접 관리하지 않는 페이지(설정 화면 등)에서
 * 사이드바에 표시할 프로젝트 목록을 조회합니다.
 */
export function useSidebarProjects(): SidebarProjectSummary[] {
  const [projects, setProjects] = useState<SidebarProjectSummary[]>([])

  useEffect(() => {
    let active = true

    listProjectSummaries()
      .then((loaded) => {
        if (!active) return
        setProjects(loaded.map(({ id, name }) => ({ id, name })))
      })
      .catch(() => {
        // 조회 실패 시 프로젝트 목록 없이 사이드바를 유지합니다.
      })

    return () => {
      active = false
    }
  }, [])

  return projects
}
