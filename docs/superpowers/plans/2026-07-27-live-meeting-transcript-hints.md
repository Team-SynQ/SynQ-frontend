# Live Meeting Transcript Hints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 회의 진행 화면에 Mock API 기반 전사 선택·수정, SynQ 힌트 상태, AI Chat 고정 컨텍스트 질문 흐름을 Figma와 동일하게 구현한다.

**Architecture:** `MeetingPage`는 `useLiveMeetingController`가 제공하는 도메인 상태와 액션만 조합한다. 컨트롤러는 `entities/meeting`의 `meetingApi`를 사용하고, 현재 구현은 같은 공개 계약을 만족하는 `shared/api/mock` service·DB·fixture·scenario로 연결한다. 전사와 AI Chat feature는 표시와 사용자 이벤트만 담당한다.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest 4, Testing Library, Tailwind CSS 4, FSD

## Global Constraints

- 작업 브랜치는 `feat#45/meeting-transcript-hints`이며 `develop` 기준이다.
- `pages`, `widgets`, `features`는 `src/shared/api/mock`을 직접 import하지 않는다.
- fixture는 읽기 전용이고 변경 가능한 성공 상태만 Mock DB에 저장한다.
- 수정 실패 초안은 화면 상태에 유지하지만 Mock DB에는 저장하지 않는다.
- AI Chat 고정 컨텍스트는 전달 시점의 전사 스냅샷이며 질문 draft를 자동 입력하지 않는다.
- 힌트 접기 아이콘은 실제 `button`으로 구현하고, 클릭하면 힌트 카드를 제거한다. 같은 전사를 다시 선택하면 성공한 힌트를 캐시에서 복원한다.
- 튜토리얼 화면의 고정값은 Mock으로 이관하지 않는다.
- AI 힌트와 AI Chat은 명세에 URL이 없으므로 의미 기반 mock-only 메서드만 제공한다.
- 실제 STT WebSocket과 백엔드 HTTP 연결은 구현하지 않는다.
- 1440×1024 및 1024×1024 레이아웃을 지원하고 1024px 미만 모바일은 범위에서 제외한다.
- 새 production 동작은 반드시 실패 테스트를 먼저 실행한 뒤 최소 구현한다.
- 무관한 파일의 CRLF/LF를 일괄 변경하지 않는다.

---

### Task 1: 회의 Mock 계약과 변경 가능한 데이터 계층

**Files:**
- Create: `src/shared/api/contracts/meeting.contracts.ts`
- Create: `src/shared/api/mock/fixtures/liveMeeting.fixture.ts`
- Create: `src/shared/api/mock/scenarios/liveMeeting.scenario.ts`
- Create: `src/shared/api/mock/db/liveMeeting.mockDb.ts`
- Create: `src/shared/api/mock/services/liveMeeting.mock.ts`
- Create: `src/shared/api/mock/services/liveMeeting.mock.test.ts`
- Create: `src/entities/meeting/api/meeting.api.ts`
- Modify: `src/entities/meeting/model/meeting.types.ts`
- Modify: `src/entities/meeting/index.ts`

**Interfaces:**
- Produces: `LiveMeetingResponse`, `TranscriptSegmentResponse`, `TranscriptHintResponse`, `AiChatPinnedContext`, `UpdateTranscriptRequest`, `SendMeetingAiQuestionRequest`
- Produces: `meetingApi.joinMeeting`, `meetingApi.listTranscripts`, `meetingApi.updateTranscript`
- Produces: `meetingAiMockGateway.getTranscriptHint`, `meetingAiMockGateway.sendMeetingAiQuestion`
- Produces: `resetLiveMeetingMockDb()` for test isolation
- Consumes: `waitForMockApi`, `MockApiError`

- [ ] **Step 1: Write failing Mock service tests**

Add behavior tests that independently assert:

```ts
it('loads a cloned meeting scenario with sorted transcripts', async () => {
  const first = await liveMeetingMockService.joinMeeting('demo')
  first.transcript.segments[0]!.text = 'mutated outside'
  const second = await liveMeetingMockService.joinMeeting('demo')

  expect(second.transcript.segments.map((segment) => segment.id)).toEqual(['segment-1'])
  expect(second.transcript.segments[0]!.text).toContain('지난주 유저 인터뷰 결과')
})

it('commits a successful transcript edit to the mock database', async () => {
  const edited = await liveMeetingMockService.updateTranscript({
    meetingId: 'demo',
    segmentId: 'segment-1',
    text: '수정된 전사 문장',
  })

  expect(edited).toMatchObject({ text: '수정된 전사 문장', isEdited: true })
  await expect(liveMeetingMockService.listTranscripts('demo')).resolves.toEqual([
    expect.objectContaining({ text: '수정된 전사 문장', isEdited: true }),
  ])
})

it('keeps committed text when an edit scenario fails', async () => {
  await expect(
    liveMeetingMockService.updateTranscript({
      meetingId: 'demo-edit-error',
      segmentId: 'segment-1',
      text: '실패한 전사 문장',
    }),
  ).rejects.toMatchObject({ code: 'TRANSCRIPT_UPDATE_FAILED' })

  await expect(liveMeetingMockService.listTranscripts('demo-edit-error')).resolves.toEqual([
    expect.objectContaining({ text: expect.stringContaining('지난주 유저 인터뷰 결과') }),
  ])
})

it('fails the first hint request and succeeds when retried', async () => {
  await expect(
    liveMeetingAiMockGateway.getTranscriptHint({
      meetingId: 'demo-hint-error',
      transcriptId: 'segment-1',
    }),
  ).rejects.toMatchObject({ code: 'TRANSCRIPT_HINT_LOAD_FAILED' })

  await expect(
    liveMeetingAiMockGateway.getTranscriptHint({
      meetingId: 'demo-hint-error',
      transcriptId: 'segment-1',
    }),
  ).resolves.toMatchObject({ transcriptId: 'segment-1' })
})

it('returns an AI response while preserving the supplied transcript snapshot', async () => {
  const response = await liveMeetingAiMockGateway.sendMeetingAiQuestion({
    meetingId: 'demo',
    question: '이 내용이 왜 중요해?',
    context: { transcriptId: 'segment-1', text: '질문 시점 문장' },
  })

  expect(response).toMatchObject({ role: 'assistant' })
  expect(response.context).toEqual({ transcriptId: 'segment-1', text: '질문 시점 문장' })
})
```

Use `beforeEach(resetLiveMeetingMockDb)`.

- [ ] **Step 2: Run the Mock tests and verify RED**

Run:

```bash
npm test -- src/shared/api/mock/services/liveMeeting.mock.test.ts
```

Expected: FAIL because the meeting contract, fixture, DB, and service do not exist.

- [ ] **Step 3: Implement the shared contract**

Define complete frontend transport contracts:

```ts
export type MeetingParticipantResponse = {
  id: string
  name: string
  role: string
  avatarKey: 'you' | 'design' | 'pm' | 'server'
  isCurrentUser: boolean
  isHost: boolean
  isMicrophoneOn: boolean
}

export type TranscriptSegmentResponse = {
  id: string
  sequenceIndex: number
  startedAtSeconds: number
  text: string
  isEdited: boolean
  editedAt: string | null
}

export type TranscriptHintResponse = {
  transcriptId: string
  notice: string | null
  meaning: string
  personalImpact: string
  teamQuestion: string
}

export type AiChatPinnedContext = {
  transcriptId: string
  text: string
}
```

Add meeting, chat message, suggestion, update, and send request/response types with the exact fields consumed by the page.

- [ ] **Step 4: Implement fixture, scenarios, DB, and service**

Move the existing `MeetingPage` meeting title, project title, participants, elapsed seconds, recording state, transcript, initial AI message, and suggestions into `liveMeeting.fixture.ts`.

Implement scenario flags:

```ts
type LiveMeetingScenario = {
  meeting: LiveMeetingResponse
  hintFailureCount: number
  transcriptEditFails: boolean
}
```

Provide `demo`, `demo-hint-error`, and `demo-edit-error`. Clone fixture records when initializing and returning data. Sort transcript list by `startedAtSeconds`, then `sequenceIndex`.

`updateTranscript` must validate non-empty text, throw `TRANSCRIPT_UPDATE_FAILED` before DB mutation for the edit-error scenario, and set `isEdited` plus ISO `editedAt` only after success.

- [ ] **Step 5: Expose the entity API boundary**

Add `MeetingApi` and export `meetingApi` backed by `liveMeetingMockService`. Re-export the domain-facing types from `entities/meeting` without exposing fixture, DB, or scenario modules.

- [ ] **Step 6: Run tests and verify GREEN**

Run:

```bash
npm test -- src/shared/api/mock/services/liveMeeting.mock.test.ts
npm run typecheck
```

Expected: both PASS.

- [ ] **Step 7: Commit the data layer**

```bash
git add src/shared/api/contracts/meeting.contracts.ts src/shared/api/mock/fixtures/liveMeeting.fixture.ts src/shared/api/mock/scenarios/liveMeeting.scenario.ts src/shared/api/mock/db/liveMeeting.mockDb.ts src/shared/api/mock/services/liveMeeting.mock.ts src/shared/api/mock/services/liveMeeting.mock.test.ts src/entities/meeting
git commit -m "feat/#45: 회의 진행 Mock API 구성"
```

---

### Task 2: AI Chat 고정 컨텍스트와 입력 포커스

**Files:**
- Create: `src/shared/ui/ChatInput/ChatInput.test.tsx`
- Modify: `src/shared/ui/ChatInput/ChatInput.tsx`
- Modify: `src/features/meeting-ai-chat/model/aiChat.types.ts`
- Create: `src/features/meeting-ai-chat/ui/AiChatPinnedContext.tsx`
- Modify: `src/features/meeting-ai-chat/ui/AiChatPanel.tsx`
- Modify: `src/features/meeting-ai-chat/ui/AiChatComposer.tsx`
- Modify: `src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx`
- Modify: `src/features/meeting-ai-chat/index.ts`

**Interfaces:**
- Consumes: `AiChatPinnedContext`
- Produces: `AiChatViewModel.pinnedContext`
- Produces: `AiChatActions.onClearContext`
- Produces: `AiChatContentProps.composerInputRef?: Ref<HTMLInputElement>`

- [ ] **Step 1: Write failing ref and pinned-context tests**

Add a `ChatInput` test that renders with a ref, calls `ref.current?.focus()`, and asserts the actual textbox has focus.

Add `AiChatPanel` tests:

```ts
it('renders and clears a pinned transcript above the message list', async () => {
  const user = userEvent.setup()
  const onClearContext = vi.fn()

  render(
    <AiChatPanel
      actions={{ ...createActions(), onClearContext }}
      model={{
        ...model,
        pinnedContext: { transcriptId: 'segment-1', text: '선택한 전사 문장' },
      }}
      onCollapse={vi.fn()}
      onMinimize={vi.fn()}
      variant="docked"
    />,
  )

  const context = screen.getByRole('region', { name: 'AI 질문 전사 컨텍스트' })
  expect(context).toHaveTextContent('선택한 전사 문장')
  expect(context.compareDocumentPosition(screen.getByRole('log'))).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  )

  await user.click(screen.getByRole('button', { name: '전사 컨텍스트 제거' }))
  expect(onClearContext).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- src/shared/ui/ChatInput/ChatInput.test.tsx src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
```

Expected: FAIL because `ChatInput` does not forward refs and AI Chat has no pinned context.

- [ ] **Step 3: Forward the ChatInput ref**

Convert `ChatInput` to `forwardRef<HTMLInputElement, ChatInputProps>` and pass the ref to its real `<input>`.

- [ ] **Step 4: Implement `AiChatPinnedContext`**

Render a 100px-minimum region immediately below the header using existing `pin.svg` and `close.svg`. The close action is a 32px icon button with `aria-label="전사 컨텍스트 제거"`.

- [ ] **Step 5: Wire the model and composer ref**

Add optional pinned context to `AiChatViewModel`, clear action to `AiChatActions`, and pass the input ref through `AiChatPanel` → `AiChatComposer` → `ChatInput`.

The panel grid must include an `auto` row only when context exists:

```ts
model.pinnedContext
  ? 'grid-rows-[60px_auto_minmax(0,1fr)_auto]'
  : 'grid-rows-[60px_minmax(0,1fr)_auto]'
```

- [ ] **Step 6: Run tests and verify GREEN**

Run:

```bash
npm test -- src/shared/ui/ChatInput/ChatInput.test.tsx src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit AI Chat UI**

```bash
git add src/shared/ui/ChatInput src/features/meeting-ai-chat
git commit -m "feat/#45: AI Chat 전사 컨텍스트 추가"
```

---

### Task 3: 전사 선택·힌트·수정 UI

**Files:**
- Modify: `src/features/live-transcription/model/transcript.types.ts`
- Create: `src/features/live-transcription/ui/TranscriptFeedback.tsx`
- Create: `src/features/live-transcription/ui/TranscriptHintCard.tsx`
- Create: `src/features/live-transcription/ui/TranscriptEditor.tsx`
- Modify: `src/features/live-transcription/ui/TranscriptItem.tsx`
- Modify: `src/features/live-transcription/ui/TranscriptPanel.tsx`
- Create: `src/features/live-transcription/ui/TranscriptPanel.test.tsx`
- Modify: `src/features/live-transcription/index.ts`

**Interfaces:**
- Consumes: `TranscriptSegmentResponse`, `TranscriptHintResponse`
- Produces: `TranscriptHintState`, `TranscriptEditState`
- Produces actions: `onSelectSegment`, `onAskAi`, `onStartEdit`, `onEditDraftChange`, `onCancelEdit`, `onCollapseHint`, `onSaveEdit`, `onRetryHint`

- [ ] **Step 1: Write failing component tests**

Use a real `TranscriptPanel` with literal state and assert:

1. clicking a segment exposes `전사 수정` and `AI에게 질문하기`;
2. ready hint renders `의미`, `나에게 미치는 영향`, `함께 확인할 질문`;
3. loading state exposes `SynQ 힌트를 불러오는 중입니다.`;
4. error state exposes an alert and `다시 시도`;
5. the hint collapse control removes the hint card, and selecting the transcript again restores a successful hint from cache;
6. editing starts with `확인` disabled;
7. changing to non-empty different text enables `확인`;
8. whitespace-only text keeps `확인` disabled;
9. edit error leaves the draft visible with an alert;
10. edited segment displays `수정됨`.

- [ ] **Step 2: Run the transcript test and verify RED**

Run:

```bash
npm test -- src/features/live-transcription/ui/TranscriptPanel.test.tsx
```

Expected: FAIL because the state and components do not exist.

- [ ] **Step 3: Expand transcript view types**

Add `sequenceIndex`, `isEdited`, and `editedAt` to segments. Model selected ID, hint state, and edit state explicitly; keep API request logic outside the feature.

- [ ] **Step 4: Implement feedback and hint card**

`TranscriptFeedback` renders a 42px-minimum `role="alert"` surface and optional retry button.

`TranscriptHintCard` renders:

- gray-200, 16px padding, 12px radius;
- title and optional notice;
- 81px gray-100 labels;
- a collapse button labeled `SynQ 힌트 접기` that removes the card;
- loading and error variants in the same card position.

Use a local 28px loader SVG/CSS asset with `motion-reduce:animate-none`; do not add a dependency.

- [ ] **Step 5: Implement the editor**

Use an auto-height textarea that focuses on mount. Render `취소` and `확인`; disable confirm when unchanged, blank, or saving. Keep the error and draft visible after a rejected save.

- [ ] **Step 6: Refactor `TranscriptItem` and `TranscriptPanel`**

Use `list`/`listitem` semantics because each transcript contains interactive controls. The segment body remains keyboard-selectable and exposes selection with `aria-pressed`. Render actions and hint only for the selected segment. While editing, hide selection actions and hint and prevent another selection callback.

- [ ] **Step 7: Run tests and verify GREEN**

Run:

```bash
npm test -- src/features/live-transcription/ui/TranscriptPanel.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit transcription UI**

```bash
git add src/features/live-transcription
git commit -m "feat/#45: 전사 선택 힌트 수정 UI 구현"
```

---

### Task 4: 회의 컨트롤러와 화면 통합

**Files:**
- Create: `src/pages/meeting/model/useLiveMeetingController.ts`
- Modify: `src/pages/MeetingPage.tsx`
- Modify: `src/pages/MeetingPage.test.tsx`

**Interfaces:**
- Consumes: `meetingApi`, `TranscriptPanelProps`, `AiChatContentProps`
- Produces: `meeting`, `transcript`, `aiChat`, and page action handlers

- [ ] **Step 1: Write failing page integration tests**

Update the render helper to wait for `참여자 4명 확인`, then add tests:

```ts
it('moves a selected transcript snapshot to AI Chat and focuses an empty draft', async () => {
  const user = userEvent.setup()
  await renderMeetingPage('/meetings/demo/live')

  await user.click(screen.getByText(/지난주 유저 인터뷰 결과/))
  await user.click(screen.getByRole('button', { name: 'AI에게 질문하기' }))

  expect(screen.getByRole('region', { name: 'AI 질문 전사 컨텍스트' })).toHaveTextContent(
    '지난주 유저 인터뷰 결과',
  )
  expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveValue('')
  expect(screen.getByRole('textbox', { name: 'AI Chat 질문' })).toHaveFocus()
})

it('commits a successful edit and shows the edited marker', async () => {
  const user = userEvent.setup()
  await renderMeetingPage('/meetings/demo/live')

  await user.click(screen.getByText(/지난주 유저 인터뷰 결과/))
  await user.click(screen.getByRole('button', { name: '전사 수정' }))
  const editor = screen.getByRole('textbox', { name: '전사 내용' })
  await user.clear(editor)
  await user.type(editor, '수정된 전사 문장')
  await user.click(screen.getByRole('button', { name: '확인' }))

  expect(await screen.findByText('수정된 전사 문장')).toBeInTheDocument()
  expect(screen.getByText('수정됨')).toBeInTheDocument()
})

it('keeps a failed draft visible without committing it', async () => {
  const user = userEvent.setup()
  await renderMeetingPage('/meetings/demo-edit-error/live')

  await user.click(screen.getByText(/지난주 유저 인터뷰 결과/))
  await user.click(screen.getByRole('button', { name: '전사 수정' }))
  const editor = screen.getByRole('textbox', { name: '전사 내용' })
  await user.clear(editor)
  await user.type(editor, '저장에 실패할 초안')
  await user.click(screen.getByRole('button', { name: '확인' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('전사 내용을 수정하지 못했습니다.')
  expect(screen.getByRole('textbox', { name: '전사 내용' })).toHaveValue('저장에 실패할 초안')
})

it('retries a failed hint request', async () => {
  const user = userEvent.setup()
  await renderMeetingPage('/meetings/demo-hint-error/live')

  await user.click(screen.getByText(/지난주 유저 인터뷰 결과/))
  expect(await screen.findByRole('alert')).toHaveTextContent('SynQ 힌트를 불러오지 못했습니다.')

  await user.click(screen.getByRole('button', { name: '다시 시도' }))
  expect(await screen.findByText('함께 확인할 질문')).toBeInTheDocument()
})
```

Retain the existing participants, title edit, end dialog, and AI display-mode regression tests.

- [ ] **Step 2: Run the MeetingPage tests and verify RED**

Run:

```bash
npm test -- src/pages/MeetingPage.test.tsx
```

Expected: new integration tests FAIL because the page does not use the meeting API or new feature actions.

- [ ] **Step 3: Implement `useLiveMeetingController`**

The hook must:

- load `meetingApi.joinMeeting(meetingId)`;
- tick elapsed seconds from the loaded value;
- keep one selected transcript ID;
- ignore stale hint responses by comparing a request sequence ref and selected ID;
- cache successful hints by transcript ID;
- keep edit draft/error locally and replace segments only on successful service response;
- create a pinned context snapshot and open launcher mode to its stored return mode;
- clear the AI draft and focus the composer after pinning;
- submit `question` plus pinned context and append user/assistant messages;
- retain draft/context on send failure;
- preserve existing title, participant popover, recording, end, and AI display-mode state.

- [ ] **Step 4: Replace page constants with controller data**

Delete `activeTranscriptState`, `initialMessages`, `suggestions`, and `participants` from `MeetingPage.tsx`. Map `avatarKey` to `meetingParticipantAvatars` at the page/display boundary. Keep only interaction-local `lastAction` and dialog refs in the page if the controller does not need them.

Do not modify tutorial components or move their constants.

- [ ] **Step 5: Run page and regression tests**

Run:

```bash
npm test -- src/pages/MeetingPage.test.tsx src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit page integration**

```bash
git add src/pages/MeetingPage.tsx src/pages/MeetingPage.test.tsx src/pages/meeting
git commit -m "feat/#45: 회의 전사 힌트 흐름 연동"
```

---

### Task 5: 디자인 토큰, 반응형 및 전체 검증

**Files:**
- Modify: `src/shared/styles/tokens.css`
- Modify: `tailwind.config.js`
- Modify only if visual comparison requires it: files created or changed in Tasks 2–4

**Interfaces:**
- Consumes: existing Tailwind utilities and design tokens
- Produces: synchronized `gray-800: #242426`

- [ ] **Step 1: Add a token regression assertion where behavior depends on the token**

Extend a real component test to assert the hint/selected surfaces use semantic classes (`bg-surface-muted`, `text-gray-800`, `border-line-default`) rather than arbitrary hex classes. Do not test the CSS source text.

- [ ] **Step 2: Run the focused test and verify RED if arbitrary styles remain**

Run:

```bash
npm test -- src/features/live-transcription/ui/TranscriptPanel.test.tsx
```

Expected: FAIL only if the implementation used non-token classes; otherwise proceed without inventing a change-detector test.

- [ ] **Step 3: Synchronize the confirmed token**

Change `gray-800` to `#242426` in both active `tokens.css` and `tailwind.config.js`. Do not alter unrelated gray values unless a rendered Figma comparison demonstrates a mismatch.

- [ ] **Step 4: Format only changed source files**

Run Prettier against the explicit changed-file list. Do not run `format --write` across the repository.

- [ ] **Step 5: Run full automated verification**

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

Expected: all commands PASS. Record any pre-existing `format:check` CRLF behavior separately rather than changing unrelated files.

- [ ] **Step 6: Inspect the rendered screen**

Run the Vite app and inspect:

- `/meetings/demo/live`
- `/meetings/demo-hint-error/live`
- `/meetings/demo-edit-error/live`

At 1440×1024 and 1024×1024 verify:

- selected transcript frame and action placement;
- hint label width and wrapping;
- editor wrapping and feedback width;
- pinned AI context location;
- no overflow outside the 524px transcript and 500px AI Chat columns;
- focus-visible states and no-op hint collapse control.

- [ ] **Step 7: Commit final design alignment**

Inspect `git status --short`, then stage only the explicit visual files changed in this task:

```bash
git add src/shared/styles/tokens.css tailwind.config.js src/features/live-transcription/ui/TranscriptHintCard.tsx src/features/live-transcription/ui/TranscriptEditor.tsx src/features/live-transcription/ui/TranscriptFeedback.tsx src/features/live-transcription/ui/TranscriptItem.tsx src/features/live-transcription/ui/TranscriptPanel.tsx src/features/meeting-ai-chat/ui/AiChatPinnedContext.tsx src/features/meeting-ai-chat/ui/AiChatPanel.tsx
git commit -m "style/#45: 회의 전사 힌트 디자인 정렬"
```

- [ ] **Step 8: Final branch verification**

Confirm:

```bash
git status --short
git log --oneline origin/develop..HEAD
```

Expected: clean worktree and only issue #45 commits above `origin/develop`.
