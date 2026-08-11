import { beforeEach, describe, expect, it, vi } from 'vitest'

import { aiChatService } from '../../../shared/api/services/aiChat.service'
import { meetingAiChatApi } from './meeting-ai-chat.api'

function sendResponse(overrides = {}) {
  return {
    id: 5,
    meetingId: 7,
    clientRequestId: '0b9c1d2e-0000-4000-8000-000000000000',
    question: '결정된 게 뭔가요?',
    answer: '아직 없습니다.',
    status: 'COMPLETED' as const,
    createdAt: '2026-08-11T05:00:00Z',
    ...overrides,
  }
}

describe('meetingAiChatApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('질문마다 clientRequestId를 새로 부여한다', async () => {
    const sendQuestion = vi.spyOn(aiChatService, 'sendQuestion').mockResolvedValue(sendResponse())

    await meetingAiChatApi.sendQuestion(7, '결정된 게 뭔가요?', null)
    await meetingAiChatApi.sendQuestion(7, '결정된 게 뭔가요?', null)

    const [first, second] = sendQuestion.mock.calls.map(([, request]) => request.clientRequestId)
    expect(first).toBeTruthy()
    expect(second).not.toBe(first)
  })

  it('고정한 전사를 linkedSegmentId로 보낸다', async () => {
    const sendQuestion = vi.spyOn(aiChatService, 'sendQuestion').mockResolvedValue(sendResponse())

    await meetingAiChatApi.sendQuestion(7, '질문', '34')

    expect(sendQuestion.mock.calls[0]?.[1].linkedSegmentId).toBe(34)
  })

  // 중간 인식 문장은 서버에 저장 전이라 숫자 id가 없다. NaN을 보내면 안 된다.
  it('숫자가 아닌 전사 id는 linkedSegmentId에서 뺀다', async () => {
    const sendQuestion = vi.spyOn(aiChatService, 'sendQuestion').mockResolvedValue(sendResponse())

    await meetingAiChatApi.sendQuestion(7, '질문', 'interim')

    expect(sendQuestion.mock.calls[0]?.[1].linkedSegmentId).toBeUndefined()
  })

  it('응답에 후속 추천 질문이 있으면 함께 돌려준다', async () => {
    vi.spyOn(aiChatService, 'sendQuestion').mockResolvedValue(
      sendResponse({ suggestedQuestions: ['다음 질문은?'] }),
    )

    await expect(meetingAiChatApi.sendQuestion(7, '질문', null)).resolves.toMatchObject({
      suggestions: [{ id: 'suggestion-0', label: '다음 질문은?' }],
    })
  })

  it('추천 질문 필드가 없으면 null을 돌려 기존 추천을 유지하게 한다', async () => {
    vi.spyOn(aiChatService, 'sendQuestion').mockResolvedValue(sendResponse())

    await expect(meetingAiChatApi.sendQuestion(7, '질문', null)).resolves.toMatchObject({
      suggestions: null,
    })
  })

  // 빈 배열은 "추천을 비워라"는 뜻이다. 유지로 바꾸면 지난 추천이 계속 남는다.
  it('추천 질문이 빈 배열이면 빈 목록으로 갱신한다', async () => {
    vi.spyOn(aiChatService, 'sendQuestion').mockResolvedValue(
      sendResponse({ suggestedQuestions: [] }),
    )

    await expect(meetingAiChatApi.sendQuestion(7, '질문', null)).resolves.toMatchObject({
      suggestions: [],
    })
  })

  it('환영 문구를 assistant 메시지로 만든다', async () => {
    vi.spyOn(aiChatService, 'getWelcome').mockResolvedValue({
      welcomeMessage: '회의가 시작되었습니다.',
      suggestedQuestions: ['핵심 의사결정은?'],
    })

    await expect(meetingAiChatApi.loadWelcome(7)).resolves.toEqual({
      messages: [
        {
          id: 'assistant-welcome',
          role: 'assistant',
          content: '회의가 시작되었습니다.',
          context: null,
        },
      ],
      suggestions: [{ id: 'suggestion-0', label: '핵심 의사결정은?' }],
    })
  })

  it('대화 내역을 메시지 목록으로 펼친다', async () => {
    vi.spyOn(aiChatService, 'listMessages').mockResolvedValue({
      messages: [sendResponse(), sendResponse({ id: 6 })],
      page: 0,
      size: 20,
      hasNext: false,
    })

    await expect(meetingAiChatApi.loadHistory(7)).resolves.toHaveLength(4)
  })

  // 첫 페이지만 읽으면 새로고침 후 앞선 대화가 사라진다.
  it('hasNext가 끝날 때까지 다음 페이지를 이어 읽는다', async () => {
    const listMessages = vi
      .spyOn(aiChatService, 'listMessages')
      .mockResolvedValueOnce({ messages: [sendResponse()], page: 0, size: 20, hasNext: true })
      .mockResolvedValueOnce({
        messages: [sendResponse({ id: 6 })],
        page: 1,
        size: 20,
        hasNext: false,
      })

    await expect(meetingAiChatApi.loadHistory(7)).resolves.toHaveLength(4)
    expect(listMessages).toHaveBeenNthCalledWith(1, 7, 0)
    expect(listMessages).toHaveBeenNthCalledWith(2, 7, 1)
  })

  it('hasNext가 계속 참이어도 무한히 돌지 않는다', async () => {
    const listMessages = vi
      .spyOn(aiChatService, 'listMessages')
      .mockResolvedValue({ messages: [sendResponse()], page: 0, size: 20, hasNext: true })

    await meetingAiChatApi.loadHistory(7)

    expect(listMessages).toHaveBeenCalledTimes(20)
  })
})
