import { beforeEach, describe, expect, it } from 'vitest'

import {
  AI_CHAT_DEFAULT_WIDTH,
  AI_CHAT_MIN_WIDTH,
  clampAiChatWidth,
  readAiChatPanelWidth,
  TRANSCRIPT_MIN_WIDTH,
  writeAiChatPanelWidth,
} from './aiChatPanelWidth.storage'

describe('clampAiChatWidth', () => {
  it('최소 폭 아래로 줄지 않는다', () => {
    expect(clampAiChatWidth(100, 1440)).toBe(AI_CHAT_MIN_WIDTH)
  })

  // 전사 영역이 최소 폭을 잃으면 레이아웃이 깨진다.
  it('전사 최소 폭을 남기고 상한을 정한다', () => {
    expect(clampAiChatWidth(2000, 1440)).toBe(1440 - TRANSCRIPT_MIN_WIDTH)
  })

  it('컨테이너를 아직 재지 못했으면 하한만 지킨다', () => {
    expect(clampAiChatWidth(900, 0)).toBe(900)
  })

  // 창이 좁아 상한이 하한보다 작아지는 경우에도 값이 뒤집히지 않아야 한다.
  it('좁은 창에서는 최소 폭을 우선한다', () => {
    expect(clampAiChatWidth(500, 600)).toBe(AI_CHAT_MIN_WIDTH)
  })
})

describe('세션 저장', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('저장된 값이 없으면 기본 폭을 쓴다', () => {
    expect(readAiChatPanelWidth()).toBe(AI_CHAT_DEFAULT_WIDTH)
  })

  it('저장한 폭을 그대로 돌려준다', () => {
    writeAiChatPanelWidth(640)

    expect(readAiChatPanelWidth()).toBe(640)
  })

  it('값이 깨져 있으면 기본 폭으로 되돌린다', () => {
    window.sessionStorage.setItem('synq:ai-chat-panel-width', 'not-a-number')

    expect(readAiChatPanelWidth()).toBe(AI_CHAT_DEFAULT_WIDTH)
  })
})
