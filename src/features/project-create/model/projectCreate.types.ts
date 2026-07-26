export type ProjectPerspectiveOption = {
  id: string
  label: string
  description: string
  selectedDescription: string
}

export type ProjectCreateDraft = {
  name: string
  perspectiveId: string
  overview: string
}

export type ProjectRoleOption = {
  id: string
  label: string
  icon: string
}

export type ProjectFocusOption = {
  id: string
  label: string
}

export type ProjectRolePerspectiveDraft = {
  roleId: string
  detailRole: string
  focusIds: string[]
}

export type ProjectMaterialDraft = {
  files: File[]
  links: string[]
}
