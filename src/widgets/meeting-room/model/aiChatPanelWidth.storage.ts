/**
 * 조절한 AI Chat 폭은 회의별이 아니라 세션 단위로 기억한다.
 * 회의를 옮길 때마다 폭이 바뀌면 오히려 방해가 된다.
 */
const STORAGE_KEY = 'synq:ai-chat-panel-width'

/** 전사 영역 최소 폭. 회의 화면 전체 최소 폭(1024px)에서 이 값을 뺀 만큼이 AI Chat의 상한이다. */
export const TRANSCRIPT_MIN_WIDTH = 524
/** AI Chat 최소 폭. 입력창과 추천 질문이 무너지지 않는 하한이다. */
export const AI_CHAT_MIN_WIDTH = 360
export const AI_CHAT_DEFAULT_WIDTH = 500

export function clampAiChatWidth(width: number, containerWidth: number): number {
  // 컨테이너를 아직 못 쟀으면 하한만 지킨다.
  const max = containerWidth > 0 ? containerWidth - TRANSCRIPT_MIN_WIDTH : Number.POSITIVE_INFINITY
  return Math.round(Math.min(Math.max(width, AI_CHAT_MIN_WIDTH), Math.max(max, AI_CHAT_MIN_WIDTH)))
}

export function readAiChatPanelWidth(): number {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return AI_CHAT_DEFAULT_WIDTH
    const parsed = Number(stored)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : AI_CHAT_DEFAULT_WIDTH
  } catch {
    return AI_CHAT_DEFAULT_WIDTH
  }
}

export function writeAiChatPanelWidth(width: number): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(width))
  } catch {
    // 저장에 실패해도 이번 세션 동안의 조절은 그대로 동작한다.
  }
}
