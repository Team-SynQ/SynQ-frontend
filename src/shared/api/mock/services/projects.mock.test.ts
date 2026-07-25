import { beforeEach, describe, expect, it } from 'vitest'

import { resetProjectMockDb } from '../db/projects.mockDb'
import { projectMockService } from './projects.mock'

describe('projectMockService', () => {
  beforeEach(() => {
    resetProjectMockDb()
  })

  it('creates and lists a project with the API contract', async () => {
    const project = await projectMockService.createProject({
      title: 'SynQ',
      description: '회의 협업 프로젝트',
    })

    expect(project).toMatchObject({
      ownerId: 12,
      title: 'SynQ',
      description: '회의 협업 프로젝트',
    })

    const projects = await projectMockService.listProjects()
    expect(projects).toEqual([
      expect.objectContaining({
        projectId: project.projectId,
        title: 'SynQ',
      }),
    ])
  })

  it('registers files and links before returning the available reference list', async () => {
    const project = await projectMockService.createProject({ title: 'SynQ' })
    const file = new File(['requirements'], 'requirements.pdf', {
      type: 'application/pdf',
    })

    const fileResponse = await projectMockService.registerProjectFiles(
      project.projectId,
      [file],
    )
    const linkResponse = await projectMockService.registerProjectLink(
      project.projectId,
      { url: 'https://www.notion.so/example' },
    )
    const references = await projectMockService.getProjectReferences(project.projectId)

    expect(fileResponse.references[0]?.status).toBe('UPLOADING')
    expect(linkResponse.status).toBe('UPLOADING')
    expect(references).toMatchObject({
      currentCount: 2,
      maxCount: 10,
      references: [
        { type: 'FILE', name: 'requirements.pdf', status: 'AVAILABLE' },
        { type: 'LINK', name: 'www.notion.so', status: 'AVAILABLE' },
      ],
    })
  })

  it('deletes a registered reference', async () => {
    const project = await projectMockService.createProject({ title: 'SynQ' })
    const link = await projectMockService.registerProjectLink(project.projectId, {
      url: 'https://example.com/document',
    })

    await projectMockService.deleteProjectReference(
      project.projectId,
      link.referenceId,
    )

    await expect(
      projectMockService.getProjectReferences(project.projectId),
    ).resolves.toMatchObject({ currentCount: 0, references: [] })
  })

  it('rejects invalid project and reference requests with HTTP-like errors', async () => {
    await expect(
      projectMockService.createProject({ title: '' }),
    ).rejects.toMatchObject({ status: 400 })

    const project = await projectMockService.createProject({ title: 'SynQ' })
    const unsupportedFile = new File(['image'], 'image.png', { type: 'image/png' })
    await expect(
      projectMockService.registerProjectFiles(project.projectId, [unsupportedFile]),
    ).rejects.toMatchObject({ status: 415 })
  })
})
