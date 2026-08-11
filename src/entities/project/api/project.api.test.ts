import { beforeEach, describe, expect, it, vi } from 'vitest'

import { projectApi } from './project.api'

const axiosMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../../../shared/api/axiosInstance', () => ({
  axiosInstance: axiosMocks,
}))

describe('projectApi', () => {
  beforeEach(() => {
    axiosMocks.get.mockReset()
    axiosMocks.post.mockReset()
    axiosMocks.delete.mockReset()
  })

  it('creates a project through the projects endpoint', async () => {
    axiosMocks.post.mockResolvedValue({
      data: {
        result: {
          projectId: 1,
          ownerId: 2,
          title: 'SynQ',
          description: null,
          createdAt: '2026-08-09T00:00:00Z',
        },
      },
    })

    await projectApi.createProject({ title: 'SynQ' })

    expect(axiosMocks.post).toHaveBeenCalledWith('/projects', { title: 'SynQ' })
  })

  it('registers selected files as multipart form data', async () => {
    axiosMocks.post.mockResolvedValue({ data: { result: { references: [] } } })
    const firstFile = new File(['first'], 'first.pdf', { type: 'application/pdf' })
    const secondFile = new File(['second'], 'second.txt', { type: 'text/plain' })

    await projectApi.registerProjectFiles(1, [firstFile, secondFile])

    const [, formData] = axiosMocks.post.mock.calls[0] as [string, FormData]
    expect(axiosMocks.post).toHaveBeenCalledWith('/projects/1/references/files', formData)
    expect(formData.getAll('files')).toEqual([firstFile, secondFile])
  })
})
