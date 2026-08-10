import { projectApi, type ProjectApi, type ProjectSummary } from '../../../entities/project'

import { projectPerspectiveOptions } from '../model/projectPerspective.config'
import type { ProjectCreateDraft, ProjectMaterialDraft } from '../model/projectCreate.types'

/**
 * 프로젝트 생성 플로우가 실제로 쓰는 메서드만 요구합니다.
 * ProjectApi 전체를 받으면 무관한 메서드가 늘어날 때마다 테스트 더블이 깨집니다.
 */
export type ProjectCreationApi = Pick<
  ProjectApi,
  | 'createProject'
  | 'deleteProject'
  | 'getProjectReferences'
  | 'registerProjectFiles'
  | 'registerProjectLink'
>

export async function createProjectWithMaterials(
  draft: ProjectCreateDraft,
  materials: ProjectMaterialDraft,
  api: ProjectCreationApi = projectApi,
): Promise<ProjectSummary> {
  console.log('[projectCreation] 프로젝트 생성 시작', {
    title: draft.name,
    hasDescription: Boolean(draft.overview),
    fileCount: materials.files.length,
    linkCount: materials.links.length,
  })

  const createdProject = await api
    .createProject({
      title: draft.name,
      description: draft.overview || undefined,
    })
    .catch((error) => {
      console.error('[projectCreation] 프로젝트 생성 실패', { error })
      throw error
    })
  console.log('[projectCreation] 프로젝트 생성 성공', {
    projectId: createdProject.projectId,
  })

  try {
    if (materials.files.length > 0) {
      console.log('[projectCreation] 파일 등록 시작', {
        projectId: createdProject.projectId,
        fileCount: materials.files.length,
      })
      await api.registerProjectFiles(createdProject.projectId, materials.files)
      console.log('[projectCreation] 파일 등록 성공', {
        projectId: createdProject.projectId,
      })
    }

    for (const [index, link] of materials.links.entries()) {
      console.log('[projectCreation] 링크 등록 시작', {
        projectId: createdProject.projectId,
        current: index + 1,
        total: materials.links.length,
      })
      await api.registerProjectLink(createdProject.projectId, { url: link })
    }

    const { references } = await api.getProjectReferences(createdProject.projectId)
    console.log('[projectCreation] 프로젝트 생성 플로우 완료', {
      projectId: createdProject.projectId,
      referenceCount: references.length,
    })
    const perspective = projectPerspectiveOptions.find(
      (option) => option.id === draft.perspectiveId,
    )

    return {
      apiProjectId: createdProject.projectId,
      id: String(createdProject.projectId),
      name: createdProject.title,
      overview: createdProject.description ?? '',
      perspectiveLabel: perspective?.label ?? '직접 설정',
      perspectiveDescription: perspective?.selectedDescription ?? '사용자 설정 관점',
      materials: references.map((reference) => ({
        id: String(reference.referenceId),
        kind: reference.type === 'FILE' ? 'file' : 'link',
        name: reference.name,
        createdAt: reference.createdAt,
      })),
    }
  } catch (error) {
    console.error('[projectCreation] 참고자료 등록 실패', {
      projectId: createdProject.projectId,
      error,
    })

    try {
      await api.deleteProject(createdProject.projectId)
      console.log('[projectCreation] 프로젝트 롤백 성공', {
        projectId: createdProject.projectId,
      })
    } catch (rollbackError) {
      console.error('[projectCreation] 프로젝트 롤백 실패', {
        projectId: createdProject.projectId,
        error: rollbackError,
      })
    }

    throw error
  }
}
