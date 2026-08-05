import { projectApi, type ProjectSummary } from '../../../entities/project'

import { projectPerspectiveOptions } from '../model/projectPerspective.config'
import type { ProjectCreateDraft, ProjectMaterialDraft } from '../model/projectCreate.types'

export async function createProjectWithMaterials(
  draft: ProjectCreateDraft,
  materials: ProjectMaterialDraft,
): Promise<ProjectSummary> {
  const createdProject = await projectApi.createProject({
    title: draft.name,
    description: draft.overview || null,
  })

  try {
    if (materials.files.length > 0) {
      await projectApi.registerProjectFiles(createdProject.projectId, materials.files)
    }

    for (const link of materials.links) {
      await projectApi.registerProjectLink(createdProject.projectId, { url: link })
    }

    const { references } = await projectApi.getProjectReferences(createdProject.projectId)
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
    try {
      await projectApi.deleteProject(createdProject.projectId)
    } catch {
      // Preserve the material registration error if rollback also fails.
    }

    throw error
  }
}
