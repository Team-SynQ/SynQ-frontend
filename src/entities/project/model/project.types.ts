export const PROJECT_REFERENCE_MAX_MATERIALS = 10

export type ProjectReferenceMaterial = {
  id: string
  kind: 'file' | 'link'
  name: string
  createdAt: string
}

export type ProjectSummary = {
  apiProjectId: number
  id: string
  name: string
  overview: string
  perspectiveLabel: string
  perspectiveDescription: string
  /** 아직 불러오지 않았으면 undefined입니다. 빈 배열은 등록된 자료가 없다는 뜻입니다. */
  materials?: ProjectReferenceMaterial[]
}
