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
  /** 서버가 아직 답변을 만드는 중이라 이 응답에는 답변이 없다. */
  isAnswerPending: boolean
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

/** 응답이 hasNext를 계속 참으로 주더라도 멈추기 위한 상한. */
const HISTORY_PAGE_LIMIT = 20

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
      // 빈 배열은 "추천을 비워라"는 뜻이다. 필드가 아예 없을 때만 기존 추천을 유지한다.
      suggestions:
        dto.suggestedQuestions === undefined ? null : toAiChatSuggestions(dto.suggestedQuestions),
      isAnswerPending: dto.status === 'GENERATING',
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

  /**
   * 대화 내역은 페이지네이션이다. 첫 페이지만 읽으면 새로고침 후 앞부분이 사라지므로
   * hasNext가 끝날 때까지 이어 읽는다. 응답이 이상해 hasNext가 계속 참이어도
   * 무한히 돌지 않도록 상한을 둔다.
   */
  async loadHistory(meetingId) {
    const messages: MeetingAiChatMessageResponse[] = []

    for (let page = 0; page < HISTORY_PAGE_LIMIT; page += 1) {
      const history = await aiChatService.listMessages(meetingId, page)
      messages.push(...(history.messages ?? []).flatMap(toAiChatMessages))
      if (!history.hasNext) break
    }

    return messages
  },
}
