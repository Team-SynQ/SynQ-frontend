import type {
  MeetingAiChatMessageResponse,
  MeetingAiChatSuggestionResponse,
} from '../../../shared/api/contracts/meeting.contracts'
import { aiChatService } from '../../../shared/api/services/aiChat.service'
import { toAiChatMessages, toAiChatSuggestions } from './aiChat.adapter'

export type MeetingAiChatSendResult = {
  messages: MeetingAiChatMessageResponse[]
  /** 응답마다 서버가 주는 후속 추천 질문. 없으면 기존 추천을 유지한다. */
  suggestions: MeetingAiChatSuggestionResponse[] | null
}

export type MeetingAiChatWelcome = {
  messages: MeetingAiChatMessageResponse[]
  suggestions: MeetingAiChatSuggestionResponse[]
}

export type MeetingAiChatApi = {
  sendQuestion(
    meetingId: number,
    question: string,
    transcriptId: string | null,
  ): Promise<MeetingAiChatSendResult>
  loadWelcome(meetingId: number): Promise<MeetingAiChatWelcome>
  loadHistory(meetingId: number): Promise<MeetingAiChatMessageResponse[]>
}

/** 서버에 저장된 전사만 질문에 묶을 수 있다. 중간 인식 문장은 숫자 id가 아니다. */
function toLinkedSegmentId(transcriptId: string | null): number | undefined {
  if (!transcriptId) return undefined
  const segmentId = Number(transcriptId)
  return Number.isSafeInteger(segmentId) && segmentId > 0 ? segmentId : undefined
}

export const meetingAiChatApi: MeetingAiChatApi = {
  async sendQuestion(meetingId, question, transcriptId) {
    const dto = await aiChatService.sendQuestion(meetingId, {
      question,
      linkedSegmentId: toLinkedSegmentId(transcriptId),
      clientRequestId: crypto.randomUUID(),
    })

    return {
      messages: toAiChatMessages(dto),
      suggestions: dto.suggestedQuestions?.length
        ? toAiChatSuggestions(dto.suggestedQuestions)
        : null,
    }
  },

  async loadWelcome(meetingId) {
    const welcome = await aiChatService.getWelcome(meetingId)

    return {
      messages: welcome.welcomeMessage
        ? [
            {
              id: 'assistant-welcome',
              role: 'assistant',
              content: welcome.welcomeMessage,
              context: null,
            },
          ]
        : [],
      suggestions: toAiChatSuggestions(welcome.suggestedQuestions ?? []),
    }
  },

  async loadHistory(meetingId) {
    const history = await aiChatService.listMessages(meetingId)
    return (history.messages ?? []).flatMap(toAiChatMessages)
  },
}
