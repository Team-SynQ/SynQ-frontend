export const projectCreationFailureMessage = {
  title: '프로젝트 생성 실패',
  description: '프로젝트를 생성하지 못했습니다. 다시 시도해 주세요.',
}

export function getProjectCreationSuccessMessage(projectName: string) {
  return {
    title: '프로젝트 생성 완료',
    description: `‘${projectName}’ 프로젝트가 추가됐습니다.`,
  }
}
