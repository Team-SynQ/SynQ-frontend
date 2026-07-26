export type ProjectReferenceMaterial = {
  id: string
  kind: 'file' | 'link'
  name: string
  createdAt: string
}

export type ProjectSummary = {
  id: string
  name: string
  overview: string
  perspectiveLabel: string
  perspectiveDescription: string
  materials: ProjectReferenceMaterial[]
}
