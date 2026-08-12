import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * AI 답변 본문을 마크다운으로 표시한다.
 *
 * react-markdown은 원문을 HTML로 넣지 않고 React 엘리먼트로 만들기 때문에,
 * 서버 답변에 태그가 섞여 있어도 그대로 실행되지 않는다.
 * 링크는 새 창으로 열고 referrer를 넘기지 않는다.
 *
 * 말풍선 안이라 좁다. 표는 가로 스크롤로 감싸 말풍선을 밀지 않게 한다.
 */
export function AiChatMarkdown({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-xs [&_code]:break-words [&_p]:m-0">
      <Markdown
        components={{
          a: ({ children, href }) => (
            <a
              className="underline underline-offset-2"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded-xs bg-surface-muted px-[4px] py-[1px]">{children}</code>
          ),
          // 말풍선 안에서는 제목을 키우지 않는다. 태그는 유지해 문서 구조를 남긴다.
          h1: ({ children }) => <h1 className="m-0 font-bold typo-body-01">{children}</h1>,
          h2: ({ children }) => <h2 className="m-0 font-bold typo-body-01">{children}</h2>,
          h3: ({ children }) => <h3 className="m-0 font-bold typo-body-01">{children}</h3>,
          ol: ({ children }) => <ol className="m-0 list-decimal pl-[20px]">{children}</ol>,
          // 긴 코드 한 줄이 말풍선을 밀지 않도록 블록 안에서만 가로 스크롤한다.
          pre: ({ children }) => (
            <pre className="m-0 overflow-x-auto rounded-xs bg-surface-muted p-xs">{children}</pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          td: ({ children }) => <td className="border border-line-default px-xs">{children}</td>,
          th: ({ children }) => (
            <th className="border border-line-default px-xs text-left">{children}</th>
          ),
          ul: ({ children }) => <ul className="m-0 list-disc pl-[20px]">{children}</ul>,
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </Markdown>
    </div>
  )
}
