import { beforeEach, describe, expect, it } from 'vitest'

import { resetProjectMockDb } from '../../../shared/api/mock/db/projects.mockDb'
import { projectApi } from '../../../entities/project'
import { createProjectWithMaterials } from './createProjectWithMaterials'

describe('createProjectWithMaterials', () => {
  beforeEach(() => {
    resetProjectMockDb()
  })

  it('creates a project and maps registered references to the dashboard model', async () => {
    const file = new File(['brief'], 'brief.pdf', { type: 'application/pdf' })

    const project = await createProjectWithMaterials(
      {
        name: '서비스 디자인',
        overview: '프로젝트 개요',
        perspectiveId: 'planning-operations',
      },
      {
        files: [file],
        links: ['https://www.notion.so/example'],
      },
    )

    expect(project).toMatchObject({
      name: '서비스 디자인',
      overview: '프로젝트 개요',
      materials: [
        { id: '1', kind: 'file', name: 'brief.pdf' },
        { id: '2', kind: 'link', name: 'www.notion.so' },
      ],
    })
    await expect(projectApi.getProjectReferences(Number(project.id))).resolves.toMatchObject({
      currentCount: 2,
    })
  })

  it('rolls back the project when material registration fails', async () => {
    const unsupportedFile = new File(['image'], 'image.png', {
      type: 'image/png',
    })

    await expect(
      createProjectWithMaterials(
        {
          name: '롤백 프로젝트',
          overview: '',
          perspectiveId: 'planning-operations',
        },
        {
          files: [unsupportedFile],
          links: [],
        },
      ),
    ).rejects.toMatchObject({ status: 415 })

    await expect(projectApi.listProjects()).resolves.toEqual([])
  })
})
