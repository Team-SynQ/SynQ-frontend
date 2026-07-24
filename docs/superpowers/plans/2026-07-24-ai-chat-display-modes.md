# AI Chat Display Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 회의 진행 화면의 AI Chat을 `docked`, `floating`, `launcher` 세 표시 상태로 렌더링하고, 확정된 demo 전환과 반응형 배치를 Figma 기준으로 구현한다.

**Architecture:** `MeetingPage`가 `AiChatDisplayMode`를 소유하고 `MeetingRoom`을 통해 `MeetingContentLayout`에 전달한다. `MeetingContentLayout`은 상태별 배치와 포커스를 담당하고, `AiChatPanel`은 docked/floating 표현만, `AiChatLauncher`는 launcher 표현만 담당한다. AI 메시지와 draft는 표시 상태와 분리해 이후 실제 API 데이터로 교체할 수 있게 유지한다.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Vitest 4, Testing Library, FSD

**Reference Spec:** `docs/superpowers/specs/2026-07-24-ai-chat-display-modes-design.md`

## Global Constraints

- 초기 AI Chat 표시 상태는 `docked`다.
- `docked -> floating`, `floating -> docked`, `launcher -> floating`만 demo에 연결한다.
- `floating -> launcher`를 발생시키는 버튼, 단축키, query parameter, 타이머, 개발용 selector를 만들지 않는다.
- launcher 상태와 복귀 동작은 구현하고 `MeetingContentLayout` 단위 테스트로 검증한다.
- floating은 `400px × 618px`, 콘텐츠 영역 우측·하단 `24px`을 기준으로 한다.
- 세로 공간이 부족하면 floating 높이는 `min(618px, calc(100% - 48px))`를 사용한다.
- launcher wrapper는 `100px`, 시각 surface는 `80px`이다.
- launcher surface는 `gray-800`, shadow는 `0 0 25px rgb(0 0 0 / 0.15)`다.
- floating shadow는 `0 0 12.5px rgb(0 0 0 / 0.15)`다.
- floating과 launcher는 `z-20`, 기존 popover는 `z-30`, toast는 `z-50`, modal은 `z-60`을 유지한다.
- Figma asset의 만료되는 원격 URL을 코드에 남기지 않는다.
- 전체 launcher PNG를 만들지 않고 symbol, surface, shadow를 조립한다.
- 신규 package를 설치하지 않는다.
- 상태 전환 morph animation, drag, resize, 모바일 전용 UI는 구현하지 않는다.
- 기존 회의 참가자, 제목 수정, 회의 종료 및 저장 demo 동작을 변경하지 않는다.
- Git add, commit, push, Pull Request 명령은 사용자가 직접 실행한다. 각 Task의 commit 단계는 제안 명령만 제공한다.

## File Structure

### 신규 파일

```text
src/shared/assets/icons/maximize.svg
src/shared/assets/logos/synq-symbol-inverse.svg
src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
src/features/meeting-ai-chat/ui/AiChatLauncher.tsx
src/features/meeting-ai-chat/ui/AiChatLauncher.test.tsx
src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx
```

### 수정 파일

```text
src/shared/styles/tokens.css
src/shared/config/theme/tokens.ts
src/features/meeting-ai-chat/model/aiChat.types.ts
src/features/meeting-ai-chat/ui/AiChatPanel.tsx
src/features/meeting-ai-chat/ui/AiChatMessageList.tsx
src/features/meeting-ai-chat/index.ts
src/widgets/meeting-room/ui/MeetingContentLayout.tsx
src/widgets/meeting-room/ui/MeetingRoom.tsx
src/pages/MeetingPage.tsx
src/pages/MeetingPage.test.tsx
```

### 파일별 책임

- `aiChat.types.ts`: 서버 데이터 타입과 표시 상태 타입을 정의한다. React ref 타입은 두지 않는다.
- `AiChatPanel.tsx`: docked/floating variant, 상태별 header action, 기존 메시지/composer 조립을 담당한다.
- `AiChatMessageList.tsx`: panel variant에 따른 padding과 bubble 최대 폭만 결정한다.
- `AiChatLauncher.tsx`: 100px hit area, 80px surface, SynQ symbol, `onOpen`만 담당한다.
- `MeetingContentLayout.tsx`: 표시 상태별 grid/overlay 배치, mode callback, 포커스 이동을 담당한다.
- `MeetingRoom.tsx`: `aiChat`과 `aiChatDisplay` props를 전달만 한다.
- `MeetingPage.tsx`: demo mode state와 상태 변경 안내를 소유한다.

---

### Task 1: AI Chat 표시 타입과 docked/floating Panel 계약

**Files:**
- Create: `src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx`
- Create: `src/shared/assets/icons/maximize.svg`
- Modify: `src/features/meeting-ai-chat/model/aiChat.types.ts:1-25`
- Modify: `src/features/meeting-ai-chat/ui/AiChatMessageList.tsx:1-36`
- Modify: `src/features/meeting-ai-chat/ui/AiChatPanel.tsx:1-39`
- Modify: `src/features/meeting-ai-chat/index.ts:1-9`

**Interfaces:**
- Consumes: 기존 `AiChatViewModel`, `AiChatActions`, `Button`, `AiChatComposer`, `AiChatMessageList`
- Produces: `AiChatDisplayMode`, `AiChatContentProps`, discriminated `AiChatPanelProps`, `AiChatPanel variant="docked" | "floating"`

- [ ] **Step 1: docked/floating 공개 계약을 검증하는 실패 테스트 작성**

`src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx`를 다음 내용으로 생성한다.

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type {
  AiChatActions,
  AiChatViewModel,
} from '../model/aiChat.types'
import { AiChatPanel } from './AiChatPanel'

const model: AiChatViewModel = {
  draft: '작성 중인 질문',
  isSending: false,
  messages: [
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: '회의가 시작되었습니다.',
    },
  ],
  suggestions: [
    {
      id: 'previous-scope',
      label: '지난 회의 범위는?',
    },
  ],
}

function createActions(): AiChatActions {
  return {
    onDraftChange: vi.fn(),
    onSelectSuggestion: vi.fn(),
    onSend: vi.fn(),
  }
}

describe('AiChatPanel', () => {
  it('renders docked content and requests floating mode', async () => {
    const user = userEvent.setup()
    const onMinimize = vi.fn()

    render(
      <AiChatPanel
        actions={createActions()}
        model={model}
        onMinimize={onMinimize}
        variant="docked"
      />,
    )

    expect(screen.getByRole('complementary', { name: 'AI Chat' })).toBeInTheDocument()
    expect(screen.getByText('회의가 시작되었습니다.').closest('article')).toHaveClass(
      'max-w-[400px]',
      'border-surface-muted',
    )
    expect(screen.getByRole('button', { name: '지난 회의 범위는?' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('작성 중인 질문')

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 축소' }))

    expect(onMinimize).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'AI Chat 창 확장' })).not.toBeInTheDocument()
  })

  it('renders floating content and requests docked mode', async () => {
    const user = userEvent.setup()
    const onMaximize = vi.fn()

    render(
      <AiChatPanel
        actions={createActions()}
        model={model}
        onMaximize={onMaximize}
        variant="floating"
      />,
    )

    const panel = screen.getByRole('complementary', { name: 'AI Chat' })
    expect(panel).toHaveClass('overflow-hidden', 'rounded-m')
    expect(screen.getByText('회의가 시작되었습니다.').closest('article')).toHaveClass(
      'max-w-[300px]',
      'border-line-default',
    )

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 확장' }))

    expect(onMaximize).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'AI Chat 창 축소' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 새 Panel 테스트가 현재 구현에서 실패하는지 확인**

Run:

```bash
pnpm test -- src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
```

Expected:

- `AI Chat 창 축소` 또는 `AI Chat 창 확장` 버튼을 찾지 못해 FAIL
- 현재 `AiChatActions`에 남아 있는 `onMinimize`와 새 테스트 계약의 차이가 드러남

- [ ] **Step 3: 메시지 액션에서 표시 액션을 분리하고 표시 상태 타입 추가**

`src/features/meeting-ai-chat/model/aiChat.types.ts`의 전체 공개 타입을 다음 형태로 맞춘다.

```ts
export type AiChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export type AiChatSuggestion = {
  id: string
  label: string
}

export type AiChatViewModel = {
  messages: AiChatMessage[]
  suggestions: AiChatSuggestion[]
  draft: string
  isSending: boolean
}

export type AiChatActions = {
  onDraftChange: (value: string) => void
  onSend: () => void
  onSelectSuggestion: (suggestionId: string) => void
}

export type AiChatDisplayMode =
  | 'docked'
  | 'floating'
  | 'launcher'
```

- [ ] **Step 4: floating header의 실제 maximize asset 저장**

Figma file `FHZ49MS3HLNgs6JOIv13HX`, node `971:4951`의 `Ic/maximize-24`를 SVG로 추출해 다음 경로에 저장한다.

```text
src/shared/assets/icons/maximize.svg
```

검증 조건:

- SVG의 `viewBox`가 24px icon 좌표계를 유지한다.
- vector stroke/fill을 사람이 다시 그리지 않는다.
- `https://www.figma.com/api/mcp/asset/...` URL이 파일이나 코드에 남지 않는다.

- [ ] **Step 5: variant별 MessageList 간격 구현**

`src/features/meeting-ai-chat/ui/AiChatMessageList.tsx`를 다음 형태로 변경한다.

```tsx
import { cn } from '../../../shared/lib/cn'
import type { AiChatMessage } from '../model/aiChat.types'

export type AiChatMessageListProps = {
  messages: AiChatMessage[]
  variant: 'docked' | 'floating'
}

export function AiChatMessageList({
  messages,
  variant,
}: AiChatMessageListProps) {
  return (
    <div
      aria-label="AI Chat 메시지"
      aria-live="polite"
      aria-relevant="additions text"
      className={cn(
        'flex min-h-0 flex-col gap-m overflow-y-auto border-x border-line-default bg-surface-muted',
        variant === 'floating' ? 'px-m py-[28px]' : 'p-m',
      )}
      role="log"
      tabIndex={0}
    >
      {messages.map((message) => (
        <article
          className={cn(
            'rounded-m p-s typo-transcription-body-01',
            variant === 'floating' ? 'max-w-[300px]' : 'max-w-[400px]',
            message.role === 'assistant'
              ? cn(
                  'self-start rounded-bl-none border bg-surface-elevated text-gray-700',
                  variant === 'floating'
                    ? 'border-line-default'
                    : 'border-surface-muted',
                )
              : 'self-end rounded-br-none bg-gray-700 text-fg-inverse',
          )}
          key={message.id}
        >
          {message.content}
        </article>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: discriminated Panel props와 상태별 header action 구현**

`src/features/meeting-ai-chat/ui/AiChatPanel.tsx`를 다음 형태로 변경한다.

```tsx
import type { Ref } from 'react'

import maximizeIcon from '../../../shared/assets/icons/maximize.svg'
import minimizeIcon from '../../../shared/assets/icons/minimize.svg'
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/ui'
import type { AiChatActions, AiChatViewModel } from '../model/aiChat.types'
import { AiChatComposer } from './AiChatComposer'
import { AiChatMessageList } from './AiChatMessageList'

export type AiChatContentProps = {
  model: AiChatViewModel
  actions: AiChatActions
}

export type AiChatPanelProps = AiChatContentProps & (
  | {
      variant: 'docked'
      onMinimize: () => void
      actionButtonRef?: Ref<HTMLButtonElement>
    }
  | {
      variant: 'floating'
      onMaximize: () => void
      actionButtonRef?: Ref<HTMLButtonElement>
    }
)

export function AiChatPanel(props: AiChatPanelProps) {
  const {
    model,
    actions,
    variant,
    actionButtonRef,
  } = props
  const floating = variant === 'floating'
  const resizeLabel = floating ? 'AI Chat 창 확장' : 'AI Chat 창 축소'
  const resizeIcon = floating ? maximizeIcon : minimizeIcon
  const onResize = floating ? props.onMaximize : props.onMinimize

  return (
    <aside
      aria-labelledby="meeting-ai-chat-title"
      className={cn(
        'grid h-full min-h-0 grid-rows-[60px_minmax(0,1fr)_auto] bg-surface-elevated',
        floating && 'overflow-hidden rounded-m',
      )}
    >
      <header className="flex items-center justify-between border border-line-default px-m">
        <h2 className="m-0 typo-title-02 text-gray-700" id="meeting-ai-chat-title">
          AI Chat
        </h2>
        <Button
          aria-label={resizeLabel}
          className="size-[32px] px-0!"
          onClick={onResize}
          ref={actionButtonRef}
          size="small"
          variant="basic"
        >
          <img alt="" aria-hidden="true" className="size-[24px]" src={resizeIcon} />
        </Button>
      </header>

      <AiChatMessageList messages={model.messages} variant={variant} />
      <AiChatComposer actions={actions} model={model} />
    </aside>
  )
}
```

- [ ] **Step 7: feature barrel export 갱신**

`src/features/meeting-ai-chat/index.ts`를 다음 공개 계약으로 맞춘다.

```ts
export { AiChatPanel } from './ui/AiChatPanel'
export type {
  AiChatContentProps,
  AiChatPanelProps,
} from './ui/AiChatPanel'
export type {
  AiChatActions,
  AiChatDisplayMode,
  AiChatMessage,
  AiChatSuggestion,
  AiChatViewModel,
} from './model/aiChat.types'
```

- [ ] **Step 8: Panel 테스트와 typecheck 통과 확인**

Run:

```bash
pnpm test -- src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
pnpm typecheck
```

Expected:

- `AiChatPanel.test.tsx`: 2 tests PASS
- TypeScript: exit code 0

- [ ] **Step 9: 사용자 실행용 커밋 제안**

```bash
git add src/features/meeting-ai-chat src/shared/assets/icons/maximize.svg
git commit -m "feat: AI Chat 패널 표시 variant 추가"
```

---

### Task 2: Launcher asset, shadow token, Launcher 컴포넌트

**Files:**
- Create: `src/shared/assets/logos/synq-symbol-inverse.svg`
- Create: `src/features/meeting-ai-chat/ui/AiChatLauncher.tsx`
- Create: `src/features/meeting-ai-chat/ui/AiChatLauncher.test.tsx`
- Modify: `src/shared/styles/tokens.css:1-69`
- Modify: `src/shared/config/theme/tokens.ts:74-79`
- Modify: `src/features/meeting-ai-chat/index.ts`

**Interfaces:**
- Consumes: `gray-800`, `spacing.m`, Figma nodes `971:5129`, `971:5130`, `971:5131`
- Produces: `AiChatLauncher({ onOpen, buttonRef })`, `shadow-ai-chat-floating`, `shadow-ai-chat-launcher`

- [ ] **Step 1: Launcher 동작과 치수를 검증하는 실패 테스트 작성**

`src/features/meeting-ai-chat/ui/AiChatLauncher.test.tsx`를 생성한다.

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AiChatLauncher } from './AiChatLauncher'

describe('AiChatLauncher', () => {
  it('opens AI Chat from the 100px launcher control', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()

    render(<AiChatLauncher onOpen={onOpen} />)

    const launcher = screen.getByRole('button', { name: 'AI Chat 열기' })
    const surface = screen.getByTestId('ai-chat-launcher-surface')

    expect(launcher).toHaveClass('size-[100px]')
    expect(surface).toHaveClass(
      'size-[80px]',
      'bg-gray-800',
      'shadow-ai-chat-launcher',
    )
    expect(screen.getByTestId('ai-chat-launcher-symbol')).toHaveAttribute(
      'aria-hidden',
      'true',
    )

    await user.click(launcher)

    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Launcher 테스트가 컴포넌트 부재로 실패하는지 확인**

Run:

```bash
pnpm test -- src/features/meeting-ai-chat/ui/AiChatLauncher.test.tsx
```

Expected:

- `AiChatLauncher.tsx` 또는 export를 찾지 못해 FAIL

- [ ] **Step 3: Figma SynQ symbol asset 저장**

Figma file `FHZ49MS3HLNgs6JOIv13HX`, node `971:5131`의 실제 vector를 다음 경로에 SVG로 저장한다.

```text
src/shared/assets/logos/synq-symbol-inverse.svg
```

검증 조건:

- 흰색 `S`와 파란 점을 모두 포함한다.
- viewBox가 심볼 원본 비율 약 `26.7 × 46`을 유지한다.
- launcher 원형 배경과 shadow를 SVG 안에 합치지 않는다.
- 만료되는 Figma URL을 남기지 않는다.

- [ ] **Step 4: CSS shadow token과 utility 추가**

`src/shared/styles/tokens.css`의 `@theme` shadow 영역에 추가한다.

```css
  --shadow-ai-chat-floating: 0 0 12.5px rgb(0 0 0 / 0.15);
  --shadow-ai-chat-launcher: 0 0 25px rgb(0 0 0 / 0.15);
```

기존 shadow utility 아래에 추가한다.

```css
@utility shadow-ai-chat-floating {
  box-shadow: var(--shadow-ai-chat-floating);
}

@utility shadow-ai-chat-launcher {
  box-shadow: var(--shadow-ai-chat-launcher);
}
```

- [ ] **Step 5: TypeScript shadow token 동기화**

`src/shared/config/theme/tokens.ts`의 `shadow`를 다음처럼 확장한다.

```ts
export const shadow = {
  panel: '12px 0 16px rgb(0 0 0 / 0.02)',
  floating: '0 4px 24px rgb(0 0 0 / 0.08)',
  toast: '8px 8px 24px rgb(0 0 0 / 0.08)',
  aiChatFloating: '0 0 12.5px rgb(0 0 0 / 0.15)',
  aiChatLauncher: '0 0 25px rgb(0 0 0 / 0.15)',
} as const
```

- [ ] **Step 6: Launcher 컴포넌트 구현**

`src/features/meeting-ai-chat/ui/AiChatLauncher.tsx`를 생성한다.

```tsx
import type { Ref } from 'react'

import synqSymbolInverse from '../../../shared/assets/logos/synq-symbol-inverse.svg'

export type AiChatLauncherProps = {
  onOpen: () => void
  buttonRef?: Ref<HTMLButtonElement>
}

export function AiChatLauncher({
  onOpen,
  buttonRef,
}: AiChatLauncherProps) {
  return (
    <button
      aria-label="AI Chat 열기"
      className="flex size-[100px] items-center justify-center rounded-full bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      onClick={onOpen}
      ref={buttonRef}
      type="button"
    >
      <span
        className="pointer-events-none flex size-[80px] items-center justify-center rounded-full bg-gray-800 shadow-ai-chat-launcher"
        data-testid="ai-chat-launcher-surface"
      >
        <img
          alt=""
          aria-hidden="true"
          className="h-[46px] w-[27px]"
          data-testid="ai-chat-launcher-symbol"
          src={synqSymbolInverse}
        />
      </span>
    </button>
  )
}
```

- [ ] **Step 7: Launcher export 추가**

`src/features/meeting-ai-chat/index.ts`에 추가한다.

```ts
export { AiChatLauncher } from './ui/AiChatLauncher'
export type { AiChatLauncherProps } from './ui/AiChatLauncher'
```

- [ ] **Step 8: Launcher 테스트와 전체 style build 확인**

Run:

```bash
pnpm test -- src/features/meeting-ai-chat/ui/AiChatLauncher.test.tsx
pnpm build
```

Expected:

- `AiChatLauncher.test.tsx`: 1 test PASS
- Tailwind가 두 신규 utility를 생성
- production build exit code 0

- [ ] **Step 9: 원격 Figma URL이 남지 않았는지 확인**

Run:

```bash
rg -n "figma.com/api/mcp/asset" src
```

Expected:

- 출력 없음

- [ ] **Step 10: 사용자 실행용 커밋 제안**

```bash
git add src/shared/assets src/shared/styles/tokens.css src/shared/config/theme/tokens.ts src/features/meeting-ai-chat
git commit -m "feat: AI Chat launcher UI와 shadow token 추가"
```

---

### Task 3: MeetingContentLayout 표시 상태와 포커스 전환

**Files:**
- Create: `src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx`
- Modify: `src/widgets/meeting-room/ui/MeetingContentLayout.tsx:1-18`

**Interfaces:**
- Consumes: `AiChatContentProps`, `AiChatDisplayMode`, `AiChatPanel`, `AiChatLauncher`, `TranscriptPanelProps`
- Produces: `MeetingAiChatDisplayProps`, 상태별 grid/overlay 배치, `onModeChange`, launcher 복귀 포커스

- [ ] **Step 1: 상태별 레이아웃과 전환을 검증하는 실패 테스트 작성**

`src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx`를 생성한다.

```tsx
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type {
  AiChatContentProps,
  AiChatDisplayMode,
} from '../../../features/meeting-ai-chat'
import type { TranscriptPanelProps } from '../../../features/live-transcription'
import { MeetingContentLayout } from './MeetingContentLayout'

const aiChat: AiChatContentProps = {
  actions: {
    onDraftChange: vi.fn(),
    onSelectSuggestion: vi.fn(),
    onSend: vi.fn(),
  },
  model: {
    draft: '',
    isSending: false,
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '회의가 시작되었습니다.',
      },
    ],
    suggestions: [],
  },
}

const transcript: TranscriptPanelProps = {
  actions: {
    onRefresh: vi.fn(),
    onSelectSegment: vi.fn(),
  },
  state: {
    kind: 'waiting',
  },
}

function LayoutHarness({
  initialMode,
}: {
  initialMode: AiChatDisplayMode
}) {
  const [mode, setMode] = useState(initialMode)

  return (
    <MeetingContentLayout
      aiChat={aiChat}
      aiChatDisplay={{
        mode,
        onModeChange: setMode,
      }}
      transcript={transcript}
    />
  )
}

describe('MeetingContentLayout', () => {
  it('moves between docked and floating while preserving the panel control', async () => {
    const user = userEvent.setup()
    const { container } = render(<LayoutHarness initialMode="docked" />)

    const root = container.querySelector('[data-ai-chat-mode]')
    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')
    expect(root).toHaveClass('grid-cols-[minmax(524px,1fr)_500px]')

    const minimize = screen.getByRole('button', { name: 'AI Chat 창 축소' })
    minimize.focus()
    await user.click(minimize)

    expect(root).toHaveAttribute('data-ai-chat-mode', 'floating')
    expect(root).toHaveClass('grid-cols-[minmax(0,1fr)]')

    const maximize = screen.getByRole('button', { name: 'AI Chat 창 확장' })
    expect(maximize).toHaveFocus()
    expect(screen.getByRole('complementary', { name: 'AI Chat' })).toHaveClass(
      'overflow-hidden',
      'rounded-m',
    )
    expect(screen.getByRole('complementary', { name: 'AI Chat' }).parentElement).toHaveClass(
      'absolute',
      'bottom-m',
      'right-m',
      'z-20',
      'h-[min(618px,calc(100%_-_48px))]',
      'w-[400px]',
      'shadow-ai-chat-floating',
    )

    await user.click(maximize)

    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')
    expect(screen.getByRole('button', { name: 'AI Chat 창 축소' })).toHaveFocus()
  })

  it('renders launcher without panel content and returns focus to floating', async () => {
    const user = userEvent.setup()
    const { container } = render(<LayoutHarness initialMode="launcher" />)

    const root = container.querySelector('[data-ai-chat-mode]')
    expect(root).toHaveAttribute('data-ai-chat-mode', 'launcher')
    expect(screen.queryByRole('complementary', { name: 'AI Chat' })).not.toBeInTheDocument()

    const launcher = screen.getByRole('button', { name: 'AI Chat 열기' })
    await user.click(launcher)

    expect(root).toHaveAttribute('data-ai-chat-mode', 'floating')
    expect(screen.getByRole('button', { name: 'AI Chat 창 확장' })).toHaveFocus()
  })

  it('focuses the launcher when an external control requests launcher mode', () => {
    const onModeChange = vi.fn()
    const { rerender } = render(
      <MeetingContentLayout
        aiChat={aiChat}
        aiChatDisplay={{
          mode: 'floating',
          onModeChange,
        }}
        transcript={transcript}
      />,
    )

    rerender(
      <MeetingContentLayout
        aiChat={aiChat}
        aiChatDisplay={{
          mode: 'launcher',
          onModeChange,
        }}
        transcript={transcript}
      />,
    )

    expect(screen.getByRole('button', { name: 'AI Chat 열기' })).toHaveFocus()
  })
})
```

- [ ] **Step 2: 레이아웃 테스트가 기존 고정 2열 구현에서 실패하는지 확인**

Run:

```bash
pnpm test -- src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx
```

Expected:

- `aiChatDisplay` props와 launcher가 없어 FAIL
- `data-ai-chat-mode`를 찾지 못해 FAIL

- [ ] **Step 3: 표시 props와 상태별 배치 구현**

`src/widgets/meeting-room/ui/MeetingContentLayout.tsx`를 다음 형태로 변경한다.

```tsx
import { useEffect, useRef } from 'react'

import {
  AiChatLauncher,
  AiChatPanel,
  type AiChatContentProps,
  type AiChatDisplayMode,
} from '../../../features/meeting-ai-chat'
import { TranscriptPanel } from '../../../features/live-transcription'
import type { TranscriptPanelProps } from '../../../features/live-transcription'
import { cn } from '../../../shared/lib/cn'

export type MeetingAiChatDisplayProps = {
  mode: AiChatDisplayMode
  onModeChange: (mode: AiChatDisplayMode) => void
}

export type MeetingContentLayoutProps = {
  transcript: TranscriptPanelProps
  aiChat: AiChatContentProps
  aiChatDisplay: MeetingAiChatDisplayProps
}

export function MeetingContentLayout({
  transcript,
  aiChat,
  aiChatDisplay,
}: MeetingContentLayoutProps) {
  const panelActionRef = useRef<HTMLButtonElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const previousModeRef = useRef(aiChatDisplay.mode)
  const mode = aiChatDisplay.mode

  useEffect(() => {
    const previousMode = previousModeRef.current

    if (previousMode === 'launcher' && mode === 'floating') {
      panelActionRef.current?.focus()
    }

    if (previousMode !== 'launcher' && mode === 'launcher') {
      launcherRef.current?.focus()
    }

    previousModeRef.current = mode
  }, [mode])

  return (
    <div
      className={cn(
        'relative grid min-h-0 overflow-hidden',
        mode === 'docked'
          ? 'grid-cols-[minmax(524px,1fr)_500px]'
          : 'grid-cols-[minmax(0,1fr)]',
      )}
      data-ai-chat-mode={mode}
    >
      <TranscriptPanel {...transcript} />

      {mode !== 'launcher' ? (
        <div
          className={cn(
            'min-h-0',
            mode === 'floating'
              && 'absolute bottom-m right-m z-20 h-[min(618px,calc(100%_-_48px))] w-[400px] rounded-m shadow-ai-chat-floating',
          )}
        >
          {mode === 'docked' ? (
            <AiChatPanel
              {...aiChat}
              actionButtonRef={panelActionRef}
              onMinimize={() => aiChatDisplay.onModeChange('floating')}
              variant="docked"
            />
          ) : (
            <AiChatPanel
              {...aiChat}
              actionButtonRef={panelActionRef}
              onMaximize={() => aiChatDisplay.onModeChange('docked')}
              variant="floating"
            />
          )}
        </div>
      ) : (
        <div className="absolute bottom-m right-m z-20 size-[100px]">
          <AiChatLauncher
            buttonRef={launcherRef}
            onOpen={() => aiChatDisplay.onModeChange('floating')}
          />
        </div>
      )}
    </div>
  )
}
```

구현 시 `mode !== 'launcher'` 바깥 wrapper에 `key`를 추가하지 않는다. docked/floating 간 같은 wrapper와 button DOM을 유지하기 위한 제약이다.

- [ ] **Step 4: 상태별 레이아웃 테스트 통과 확인**

Run:

```bash
pnpm test -- src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx
```

Expected:

- 3 tests PASS
- docked/floating action button focus 유지 PASS
- launcher 복귀 focus PASS

- [ ] **Step 5: Panel과 Layout 회귀 테스트 함께 실행**

Run:

```bash
pnpm test -- src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx src/features/meeting-ai-chat/ui/AiChatLauncher.test.tsx src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx
```

Expected:

- 3 test files PASS

- [ ] **Step 6: 사용자 실행용 커밋 제안**

```bash
git add src/widgets/meeting-room/ui/MeetingContentLayout.tsx src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx
git commit -m "feat: 회의 AI Chat 표시 상태별 레이아웃 추가"
```

---

### Task 4: MeetingRoom 전달 계약과 MeetingPage demo 통합

**Files:**
- Modify: `src/widgets/meeting-room/ui/MeetingRoom.tsx:1-20`
- Modify: `src/pages/MeetingPage.tsx:1-199`
- Modify: `src/pages/MeetingPage.test.tsx:1-83`

**Interfaces:**
- Consumes: `AiChatContentProps`, `MeetingAiChatDisplayProps`, `AiChatDisplayMode`, `MeetingContentLayout`
- Produces: 초기 docked demo, docked/floating 왕복, draft 보존, 기존 meeting control과 독립된 표시 상태

- [ ] **Step 1: MeetingPage 전환과 상태 보존 실패 테스트 추가**

`src/pages/MeetingPage.test.tsx`의 기존 `describe('MeetingPage controls')` 안에 다음 테스트를 추가한다.

```tsx
  it('moves between docked and floating while preserving the draft', async () => {
    const user = userEvent.setup()
    const { container } = renderMeetingPage()

    const root = container.querySelector('[data-ai-chat-mode]')
    const input = screen.getByRole('textbox', { name: 'AI Chat 질문' })

    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')

    await user.type(input, '회의 범위 질문')
    await user.click(screen.getByRole('button', { name: 'AI Chat 창 축소' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'floating')
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('회의 범위 질문')

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 확장' }))

    expect(root).toHaveAttribute('data-ai-chat-mode', 'docked')
    expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('회의 범위 질문')
  })

  it('keeps floating mode while existing meeting controls open and close', async () => {
    const user = userEvent.setup()
    const { container } = renderMeetingPage()

    await user.click(screen.getByRole('button', { name: 'AI Chat 창 축소' }))
    expect(container.querySelector('[data-ai-chat-mode]')).toHaveAttribute(
      'data-ai-chat-mode',
      'floating',
    )

    await user.click(screen.getByRole('button', { name: '참여자 4명 확인' }))
    expect(screen.getByRole('list', { name: '회의 참여자' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(container.querySelector('[data-ai-chat-mode]')).toHaveAttribute(
      'data-ai-chat-mode',
      'floating',
    )
  })
```

- [ ] **Step 2: MeetingPage 테스트가 mode 미연결 상태에서 실패하는지 확인**

Run:

```bash
pnpm test -- src/pages/MeetingPage.test.tsx
```

Expected:

- `AI Chat 창 축소` 버튼 또는 `data-ai-chat-mode`를 찾지 못해 신규 테스트 FAIL
- 기존 4 tests는 계속 PASS

- [ ] **Step 3: MeetingRoom 전달 계약 확장**

`src/widgets/meeting-room/ui/MeetingRoom.tsx`를 다음 형태로 변경한다.

```tsx
import type { AiChatContentProps } from '../../../features/meeting-ai-chat'
import type { TranscriptPanelProps } from '../../../features/live-transcription'
import {
  MeetingContentLayout,
  type MeetingAiChatDisplayProps,
} from './MeetingContentLayout'
import { MeetingHeader } from './MeetingHeader'
import type { MeetingHeaderProps } from './MeetingHeader'

export type MeetingRoomProps = {
  header: MeetingHeaderProps
  transcript: TranscriptPanelProps
  aiChat: AiChatContentProps
  aiChatDisplay: MeetingAiChatDisplayProps
}

export function MeetingRoom({
  header,
  transcript,
  aiChat,
  aiChatDisplay,
}: MeetingRoomProps) {
  return (
    <main className="grid h-dvh min-h-[720px] min-w-[1024px] grid-rows-[90px_minmax(0,1fr)] overflow-hidden bg-surface-default text-fg-primary">
      <MeetingHeader {...header} />
      <MeetingContentLayout
        aiChat={aiChat}
        aiChatDisplay={aiChatDisplay}
        transcript={transcript}
      />
    </main>
  )
}
```

- [ ] **Step 4: MeetingPage에 표시 상태와 명시적 변경 handler 추가**

`src/pages/MeetingPage.tsx`의 AI Chat type import를 다음처럼 확장한다.

```ts
import type {
  AiChatDisplayMode,
  AiChatMessage,
} from '../features/meeting-ai-chat'
```

`MeetingPage`의 다른 로컬 상태와 함께 추가한다.

```ts
const [aiChatDisplayMode, setAiChatDisplayMode] =
  useState<AiChatDisplayMode>('docked')
```

`sendMessage` 아래에 표시 handler를 추가한다.

```ts
const changeAiChatDisplayMode = (mode: AiChatDisplayMode) => {
  setAiChatDisplayMode(mode)

  const announcement: Record<AiChatDisplayMode, string> = {
    docked: 'AI Chat을 기본 크기로 확장했습니다.',
    floating: 'AI Chat을 작은 창으로 전환했습니다.',
    launcher: 'AI Chat을 완전히 축소했습니다.',
  }

  setLastAction(announcement[mode])
}
```

`MeetingRoom`의 기존 `aiChat.actions`에서 아래 코드를 제거한다.

```ts
onMinimize: () => setLastAction('AI Chat 최소화 요청'),
```

`aiChat` prop과 같은 수준에 다음 prop을 추가한다.

```tsx
aiChatDisplay={{
  mode: aiChatDisplayMode,
  onModeChange: changeAiChatDisplayMode,
}}
```

`MeetingPage` demo에서 `changeAiChatDisplayMode('launcher')`를 호출하는 UI는 추가하지 않는다.

- [ ] **Step 5: MeetingPage 전환 및 기존 controls 테스트 통과 확인**

Run:

```bash
pnpm test -- src/pages/MeetingPage.test.tsx
```

Expected:

- 기존 4 tests PASS
- 신규 2 tests PASS
- 총 6 tests PASS

- [ ] **Step 6: 전체 typecheck와 meeting 관련 테스트 실행**

Run:

```bash
pnpm typecheck
pnpm test -- src/pages/MeetingPage.test.tsx src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx src/widgets/meeting-room/ui/MeetingHeader.test.tsx
```

Expected:

- TypeScript exit code 0
- 3 test files PASS

- [ ] **Step 7: 사용자 실행용 커밋 제안**

```bash
git add src/widgets/meeting-room/ui/MeetingRoom.tsx src/pages/MeetingPage.tsx src/pages/MeetingPage.test.tsx
git commit -m "feat: 회의 demo에 AI Chat 크기 전환 연결"
```

---

### Task 5: Figma 시각 QA와 전체 저장소 검증

**Files:**
- Verify: `src/features/meeting-ai-chat/ui/AiChatPanel.tsx`
- Verify: `src/features/meeting-ai-chat/ui/AiChatLauncher.tsx`
- Verify: `src/widgets/meeting-room/ui/MeetingContentLayout.tsx`
- Verify: `src/shared/styles/tokens.css`
- Verify: `src/shared/assets/icons/maximize.svg`
- Verify: `src/shared/assets/logos/synq-symbol-inverse.svg`

**Interfaces:**
- Consumes: Task 1~4의 완료 결과
- Produces: 지정 viewport 시각 확인 결과와 전체 test/lint/build 통과 증거

- [ ] **Step 1: 개발 서버 실행**

Run:

```bash
pnpm dev --host 127.0.0.1
```

Expected:

- Vite 개발 서버가 로컬 URL을 출력
- `/meetings/demo/live` 접근 가능

- [ ] **Step 2: 1440 × 1024 docked 상태 확인**

URL:

```text
http://127.0.0.1:5173/meetings/demo/live
```

포트 `5173`이 이미 사용 중이면 Vite가 출력한 다음 포트의 동일 경로를 사용한다.

Viewport:

```text
1440 × 1024
```

확인 목록:

- 전사 영역과 AI Chat이 2열
- AI Chat 우측 폭 `500px`
- header 높이 `60px`
- 축소 버튼 접근성 이름 `AI Chat 창 축소`
- 기존 메시지, 추천 질문, 입력 표시
- Figma node `603:2045`와 구조 일치

- [ ] **Step 3: 1440 × 1024 floating 상태 확인**

축소 버튼을 클릭하고 확인한다.

확인 목록:

- 전사 영역이 전체 폭
- floating panel 폭 `400px`
- floating panel 높이 `618px`
- 우측·하단 간격 각각 `24px`
- radius `12px`
- shadow `0 0 12.5px rgb(0 0 0 / 15%)`
- assistant bubble 최대 폭 `300px`
- 확장 아이콘이 Figma node `971:4951`과 일치
- Figma nodes `971:4903`, `971:4946`과 구조 일치

- [ ] **Step 4: 1024 × 1024 반응형 확인**

Viewport:

```text
1024 × 1024
```

확인 목록:

- floating panel은 계속 `400 × 618px`
- 우측·하단 `24px`
- 전사 콘텐츠가 floating 아래로 흐르며 전체 폭 사용
- Figma node `603:2498`과 구조 일치

- [ ] **Step 5: 1280 × 800과 1024 × 720 세로 대응 확인**

Viewports:

```text
1280 × 800
1024 × 720
```

확인 목록:

- floating panel이 회의 header를 침범하지 않음
- 상하 최소 `24px` 여백 유지
- header와 composer 높이 유지
- 줄어드는 영역은 message list
- 내부 message list scroll 가능

- [ ] **Step 6: Launcher 단독 렌더링 시각 확인**

launcher 진입용 production UI는 만들지 않는다. 시각 확인 직전에 `src/pages/MeetingPage.tsx`의 초기 상태 한 줄만 임시로 다음과 같이 바꾼다.

```ts
const [aiChatDisplayMode, setAiChatDisplayMode] =
  useState<AiChatDisplayMode>('launcher')
```

브라우저에서 `/meetings/demo/live`를 확인한 직후 반드시 원래 값으로 복원한다.

```ts
const [aiChatDisplayMode, setAiChatDisplayMode] =
  useState<AiChatDisplayMode>('docked')
```

확인 목록:

- wrapper `100 × 100px`
- 내부 원 `80 × 80px`
- 원 배경 `gray-800`
- 심볼 약 `27 × 46px`
- shadow `0 0 25px rgb(0 0 0 / 15%)`
- 콘텐츠 영역 우측·하단 `24px`
- 클릭 시 floating panel 복귀
- Figma nodes `971:5087`, `971:5129`와 일치

복원 확인:

```bash
rg -n "useState<AiChatDisplayMode>\\('docked'\\)" src/pages/MeetingPage.tsx
```

Expected:

- `docked` 초기화 line 1개 출력
- `launcher` 초기화 line 출력 없음

- [ ] **Step 7: 레이어 우선순위 확인**

floating 상태에서 다음을 차례로 연다.

1. 참가자 popover
2. 더보기 menu
3. 제목 수정 dialog
4. 회의 종료 dialog

Expected:

- popover와 menu가 floating panel보다 위에 표시
- modal overlay가 floating panel보다 위에 표시
- control을 닫아도 AI Chat은 floating 상태 유지

- [ ] **Step 8: 전체 자동 검증 실행**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected:

- 모든 Vitest test file PASS
- ESLint exit code 0
- `tsc -b && vite build` exit code 0

- [ ] **Step 9: 범위 외 구현과 만료 URL이 없는지 확인**

Run:

```bash
rg -n "figma.com/api/mcp/asset|localStorage|searchParams|setTimeout" src/features/meeting-ai-chat src/widgets/meeting-room src/pages/MeetingPage.tsx
```

Expected:

- Figma asset URL 출력 없음
- AI Chat mode를 저장하거나 자동 변경하는 신규 코드 출력 없음
- 기존 unrelated `setTimeout`이 이 검색 범위에 나타나면 AI Chat mode와 무관한지 확인

- [ ] **Step 10: 변경 범위 확인**

Run:

```bash
git status --short
git diff --check
```

Expected:

- 이 계획의 신규/수정 파일만 표시
- whitespace error 없음
- `docs/superpowers/specs/2026-07-24-ai-chat-display-modes-design.md`와 이 plan 문서는 문서 변경으로 함께 표시될 수 있음

- [ ] **Step 11: 사용자 실행용 최종 커밋 제안**

시각 QA에서 추가 보정이 발생한 경우에만 사용한다.

```bash
git add src
git commit -m "fix: AI Chat 크기 전환 Figma 시각 보정"
```

## Final Completion Checklist

- [ ] `AiChatDisplayMode`가 `docked | floating | launcher`를 포함한다.
- [ ] `AiChatActions`에는 콘텐츠 액션만 남는다.
- [ ] docked에서 floating으로 전환된다.
- [ ] floating에서 docked로 전환된다.
- [ ] launcher 클릭으로 floating이 열린다.
- [ ] production demo에는 floating에서 launcher로 가는 트리거가 없다.
- [ ] floating과 launcher에서 전사 영역이 전체 폭을 사용한다.
- [ ] docked/floating 전환 중 draft, 메시지, focus가 유지된다.
- [ ] launcher 복귀 후 floating 확장 버튼에 focus가 간다.
- [ ] 기존 meeting popover/dialog와 AI Chat mode가 독립적이다.
- [ ] Figma asset이 로컬 shared asset으로 저장된다.
- [ ] CSS와 TypeScript shadow token이 일치한다.
- [ ] 지정 viewport 시각 QA를 완료한다.
- [ ] 전체 test, lint, build가 통과한다.
- [ ] agent는 Git add, commit, push, PR을 실행하지 않는다.
