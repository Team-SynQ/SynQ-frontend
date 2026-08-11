import type { AiChatMessageDto } from '../../../shared/api/contracts/aiChat.contracts'
import type {
  MeetingAiChatMessageResponse,
  MeetingAiChatSuggestionResponse,
} from '../../../shared/api/contracts/meeting.contracts'

/**
 * 서버는 질문과 답변을 한 레코드로 주고, 화면은 메시지 목록으로 다룬다.
 * 레코드 하나를 user·assistant 두 메시지로 펼친다.
 *
 * 답변이 아직 없으면(GENERATING) assistant 메시지를 만들지 않는다. 빈 말풍선을 띄우지 않고,
 * 답변이 채워진 뒤 다시 펼치면 그때 붙는다.
 */
export function toAiChatMessages(dto: AiChatMessageDto): MeetingAiChatMessageResponse[] {
  const context =
    dto.linkedSegmentId === undefined || dto.linkedSegmentId === null
      ? null
      : { transcriptId: String(dto.linkedSegmentId), text: '' }

  const messages: MeetingAiChatMessageResponse[] = [
    {
      id: `user-${dto.id}`,
      role: 'user',
      content: dto.question,
      context,
    },
  ]

  const answer = answerTextOf(dto)
  if (answer) {
    messages.push({
      id: `assistant-${dto.id}`,
      role: 'assistant',
      content: answer,
      context,
    })
  }

  return messages
}

/** 실패한 응답은 서버 문구를 그대로 보여준다. 생성 중이면 아직 보여줄 답변이 없다. */
function answerTextOf(dto: AiChatMessageDto): string | null {
  if (dto.status === 'FAILED') {
    return dto.errorMessage || 'AI 답변을 생성하지 못했습니다.'
  }
  return dto.answer?.trim() ? dto.answer : null
}

/** 서버는 추천 질문을 문자열 배열로 준다. 화면은 id를 가진 항목을 쓴다. */
export function toAiChatSuggestions(questions: string[]): MeetingAiChatSuggestionResponse[] {
  return questions.map((label, index) => ({ id: `suggestion-${index}`, label }))
}
