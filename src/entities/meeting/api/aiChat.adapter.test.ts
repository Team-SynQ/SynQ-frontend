import { describe, expect, it } from 'vitest'

import type { AiChatMessageDto } from '../../../shared/api/contracts/aiChat.contracts'
import { toAiChatMessages, toAiChatSuggestions } from './aiChat.adapter'

function messageDto(overrides: Partial<AiChatMessageDto> = {}): AiChatMessageDto {
  return {
    id: 5,
    meetingId: 7,
    clientRequestId: '0b9c1d2e-0000-4000-8000-000000000000',
    question: '이번 결정의 완료 기준은?',
    answer: '온보딩 이탈률 기준으로 합의했습니다.',
    status: 'COMPLETED',
    createdAt: '2026-08-11T05:00:00Z',
    ...overrides,
  }
}

describe('AI Chat 어댑터', () => {
  it('레코드 하나를 질문·답변 두 메시지로 펼친다', () => {
    expect(toAiChatMessages(messageDto())).toEqual([
      {
        id: 'user-5',
        role: 'user',
        content: '이번 결정의 완료 기준은?',
        context: null,
      },
      {
        id: 'assistant-5',
        role: 'assistant',
        content: '온보딩 이탈률 기준으로 합의했습니다.',
        context: null,
      },
    ])
  })

  it('linkedSegmentId를 화면 컨텍스트의 transcriptId로 옮긴다', () => {
    const [userMessage] = toAiChatMessages(messageDto({ linkedSegmentId: 34 }))

    expect(userMessage?.context).toEqual({ transcriptId: '34', text: '' })
  })

  // 생성 중에는 빈 말풍선을 만들지 않는다. 답변이 채워진 뒤 다시 펼치면 붙는다.
  it('생성 중이면 질문만 남긴다', () => {
    const messages = toAiChatMessages(messageDto({ status: 'GENERATING', answer: null }))

    expect(messages).toHaveLength(1)
    expect(messages[0]?.role).toBe('user')
  })

  it('실패한 응답은 서버 오류 문구를 답변 자리에 보여준다', () => {
    const messages = toAiChatMessages(
      messageDto({ status: 'FAILED', answer: null, errorMessage: '컨텍스트가 부족합니다.' }),
    )

    expect(messages[1]).toMatchObject({ role: 'assistant', content: '컨텍스트가 부족합니다.' })
  })

  it('실패 문구가 없으면 기본 안내를 쓴다', () => {
    const messages = toAiChatMessages(messageDto({ status: 'FAILED', answer: null }))

    expect(messages[1]?.content).toBe('AI 답변을 생성하지 못했습니다.')
  })

  it('추천 질문 문자열에 id를 붙인다', () => {
    expect(toAiChatSuggestions(['첫 질문', '둘째 질문'])).toEqual([
      { id: 'suggestion-0', label: '첫 질문' },
      { id: 'suggestion-1', label: '둘째 질문' },
    ])
  })
})
