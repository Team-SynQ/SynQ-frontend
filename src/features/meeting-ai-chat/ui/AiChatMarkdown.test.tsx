import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AiChatMarkdown } from './AiChatMarkdown'

describe('AiChatMarkdown', () => {
  it('강조를 서식으로 표시하고 별표를 노출하지 않는다', () => {
    render(<AiChatMarkdown content="**문제 범위 확인**을 먼저 합니다." />)

    expect(screen.getByText('문제 범위 확인').tagName).toBe('STRONG')
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument()
  })

  it('번호 목록을 목록으로 표시한다', () => {
    render(<AiChatMarkdown content={'1. 근거 수집\n2. 접근성 점검'} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('근거 수집')
  })

  it('표를 가로 스크롤 안에 넣는다', () => {
    render(<AiChatMarkdown content={'| 항목 | 값 |\n| --- | --- |\n| 일정 | 2주 |'} />)

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    expect(table.parentElement).toHaveClass('overflow-x-auto')
  })

  it('링크는 새 창으로 열고 referrer를 넘기지 않는다', () => {
    render(<AiChatMarkdown content="[문서](https://example.com)" />)

    const link = screen.getByRole('link', { name: '문서' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('제목 태그를 유지해 문서 구조를 남긴다', () => {
    render(<AiChatMarkdown content="## 결정 사항" />)

    expect(screen.getByRole('heading', { level: 2, name: '결정 사항' })).toBeInTheDocument()
  })

  // 긴 코드 한 줄이 말풍선을 밀면 안 된다.
  it('코드 블록 안에서만 가로 스크롤한다', () => {
    const { container } = render(<AiChatMarkdown content={'```\nnpm run build\n```'} />)

    expect(container.querySelector('pre')).toHaveClass('overflow-x-auto')
  })

  // 서버 답변에 태그가 섞여 와도 실행되면 안 된다.
  it('원문의 HTML을 실행하지 않는다', () => {
    const { container } = render(
      <AiChatMarkdown content={'<img src="x" onerror="alert(1)"> 뒤 문장'} />,
    )

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(/뒤 문장/)).toBeInTheDocument()
  })
})
