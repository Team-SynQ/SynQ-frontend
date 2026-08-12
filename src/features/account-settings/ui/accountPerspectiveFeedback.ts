export type PerspectiveSaveFeedback = 'success' | 'error'

/** 역할·관점 추가/수정 다이얼로그가 공유하는 저장 결과 토스트 문구입니다. */
export const perspectiveSaveFeedbackMessages: Record<
  PerspectiveSaveFeedback,
  { description: string; size: 'default' | 'wide'; title: string; type: 'success' | 'error' }
> = {
  success: {
    description: '역할·관점 설정이 저장되었습니다.',
    size: 'default',
    title: '설정 저장 성공',
    type: 'success',
  },
  error: {
    description: '역할·관점 설정을 저장하지 못했습니다. 다시 시도해 주세요.',
    size: 'wide',
    title: '설정 저장 실패',
    type: 'error',
  },
}
