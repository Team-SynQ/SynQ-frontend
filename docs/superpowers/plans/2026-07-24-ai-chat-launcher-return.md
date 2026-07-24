# AI Chat Launcher Return Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docked와 floating AI Chat에서 launcher로 진입하고, launcher 클릭 시 진입 직전 표시 상태로 복귀하도록 구현한다.

**Architecture:** `MeetingPage`는 현재 표시 mode만 계속 소유한다. `MeetingContentLayout`은 마지막 non-launcher mode를 ref로 기억하고 launcher의 복귀 목적지와 포커스 복원을 담당한다. `AiChatPanel`은 두 variant 모두 공용 collapse 버튼을 렌더링하며 기존 resize 버튼과 역할을 분리한다.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4, Vitest 4, Testing Library

## Global Constraints

- docked와 floating 모두 Figma의 동일한 `Ic/Minimize-24` 가로선 SVG를 사용한다.
- 가로선 아이콘은 `src/shared/assets/icons/collapse.svg`에 저장하고 원격 Figma URL을 코드에 남기지 않는다.
- docked header action 순서는 collapse, minimize이다.
- floating header action 순서는 collapse, maximize이다.
- launcher는 진입 직전 docked 또는 floating으로 복귀한다.
- 초기 mode가 launcher인 독립 렌더링은 기존 호환성을 위해 floating으로 복귀한다.
- collapse 버튼과 resize 버튼은 각각 32px 클릭 영역, 24px 아이콘을 사용한다.
- 두 버튼 wrapper는 `gap-xs`를 사용해 아이콘 사이의 시각 간격을 16px로 맞춘다.
- 신규 package를 설치하지 않는다.
- Git add, commit, push, Pull Request는 사용자가 직접 실행한다.

---

### Task 1: Panel launcher action

**Files:**
- Create: `src/shared/assets/icons/collapse.svg`
- Modify: `src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx`
- Modify: `src/features/meeting-ai-chat/ui/AiChatPanel.tsx`

**Interfaces:**
- Consumes: Figma node `2254:35777`, shared `Button`
- Produces: `onCollapse: () => void`, `collapseButtonRef?: Ref<HTMLButtonElement>`

- [ ] **Step 1: Write failing panel tests**

각 variant 테스트에서 `AI Chat 런처로 축소` 버튼을 클릭하고 `onCollapse`가 한 번 호출되는지 확인한다. docked에서는 `AI Chat 창 축소`, floating에서는 `AI Chat 창 확장` 버튼도 함께 렌더링되어야 한다.

- [ ] **Step 2: Verify RED**

Run:

```bash
.\node_modules\.bin\vitest.cmd run src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
```

Expected: `AI Chat 런처로 축소` 버튼을 찾지 못해 FAIL

- [ ] **Step 3: Download and implement**

Figma node `2254:35777`을 `src/shared/assets/icons/collapse.svg`로 다운로드한다. `AiChatPanelProps` 공통 영역에 다음 계약을 추가한다.

```ts
onCollapse: () => void
collapseButtonRef?: Ref<HTMLButtonElement>
```

header action wrapper를 추가한다.

```tsx
<div className="flex items-center gap-xs">
  <Button aria-label="AI Chat 런처로 축소" ref={collapseButtonRef}>
    <img alt="" aria-hidden="true" className="size-[24px]" src={collapseIcon} />
  </Button>
  <Button aria-label={resizeLabel} ref={actionButtonRef}>
    <img alt="" aria-hidden="true" className="size-[24px]" src={resizeIcon} />
  </Button>
</div>
```

- [ ] **Step 4: Verify GREEN**

Run:

```bash
.\node_modules\.bin\vitest.cmd run src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
pnpm typecheck
```

Expected: panel tests PASS, typecheck may remain red until Task 2 callers provide `onCollapse`

---

### Task 2: Origin-aware launcher return

**Files:**
- Modify: `src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx`
- Modify: `src/widgets/meeting-room/ui/MeetingContentLayout.tsx`
- Modify: `src/pages/MeetingPage.test.tsx`

**Interfaces:**
- Consumes: `AiChatDisplayMode`, `AiChatPanel.onCollapse`
- Produces: docked → launcher → docked, floating → launcher → floating

- [ ] **Step 1: Write failing layout and page tests**

Layout harness에서 다음 두 흐름을 검증한다.

```text
docked -> collapse click -> launcher -> launcher click -> docked
floating -> collapse click -> launcher -> launcher click -> floating
```

각 launcher 전환 후 launcher 버튼에 focus가 있고, 복귀 후 `AI Chat 런처로 축소` 버튼에 focus가 있는지 확인한다. MeetingPage 테스트에서는 draft가 launcher 왕복 뒤에도 유지되는지 확인한다.

- [ ] **Step 2: Verify RED**

Run:

```bash
.\node_modules\.bin\vitest.cmd run src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx src/pages/MeetingPage.test.tsx
```

Expected: collapse 버튼 또는 직전 mode 복귀 assertion에서 FAIL

- [ ] **Step 3: Implement return memory**

`MeetingContentLayout`에 마지막 non-launcher mode를 저장한다.

```ts
type RestorableAiChatMode = Exclude<AiChatDisplayMode, 'launcher'>

const launcherReturnModeRef = useRef<RestorableAiChatMode>(
  aiChatDisplay.mode === 'launcher' ? 'floating' : aiChatDisplay.mode,
)
```

mode가 non-launcher일 때 ref를 갱신한다. 양쪽 panel의 `onCollapse`는 launcher로 전환하고 launcher의 `onOpen`은 `launcherReturnModeRef.current`로 복귀한다. `collapseButtonRef`를 사용해 launcher 왕복 포커스를 복원한다.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
.\node_modules\.bin\vitest.cmd run src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx src/pages/MeetingPage.test.tsx
pnpm typecheck
```

Expected: targeted tests and typecheck PASS

---

### Task 3: Full verification

**Files:**
- Verify all modified files

- [ ] **Step 1: Run automated checks**

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all commands exit 0

- [ ] **Step 2: Visual QA**

`/meetings/demo/live`에서 docked와 floating header의 두 액션 순서, launcher 왕복 목적지, focus, draft 보존을 확인한다.

- [ ] **Step 3: Scope check**

```bash
git diff --check
rg -n "figma.com/api/mcp/asset|localStorage|searchParams" src/features/meeting-ai-chat src/widgets/meeting-room src/pages/MeetingPage.tsx
```

Expected: whitespace error와 만료되는 Figma URL, 임시 상태 저장 코드가 없음
