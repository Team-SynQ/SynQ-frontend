export type ProjectInformationPerspective = {
  /** 계정 역할·관점 프로필에서 온 옵션이면 그 옵션 id입니다. 라벨 문자열보다 정확한 매칭 기준입니다. */
  id?: string
  label: string
  description: string
}

export type ProjectInformationDraft = {
  name: string
  overview: string
  /** 드롭다운에서 고른 옵션의 id. 없으면 라벨·설명 문자열로 프로필을 찾습니다. */
  perspectiveId?: string
  perspectiveLabel: string
  perspectiveDescription: string
}
