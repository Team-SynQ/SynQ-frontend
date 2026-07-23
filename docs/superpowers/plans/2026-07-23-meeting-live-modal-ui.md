# Meeting Live Modal UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Figma에 정의된 회의 진행 연결 상태, 참여자, 제목 수정, 이탈·종료·저장 UI를 재사용 가능한 컴포넌트로 구현하고 기존 `/meetings/demo/live` 헤더 동작에 지정된 흐름만 연결한다.

**Architecture:** 공통 접근성 동작은 `shared/ui/OverlayDialog`와 `shared/lib/useDismissableLayer`에 둔다. 연결 상태는 `features/meeting-connection`, 헤더 제어는 `features/meeting-controls`로 분리하고, `MeetingPage`가 demo layer union과 회의 제목 상태를 소유한다. `MeetingHeader`는 feature를 직접 알지 않고 popover `ReactNode` slot만 렌더링한다.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 4, Vite 8, Vitest, React Testing Library

## Global Constraints

- Figma file key는 `FHZ49MS3HLNgs6JOIv13HX`이며 설계 노드 매핑은 `docs/superpowers/specs/2026-07-23-meeting-live-modal-ui-design.md`를 따른다.
- 별도 preview route, query parameter, demo control panel을 추가하지 않는다.
- demo에는 참여자, 제목 수정, 진행자 종료, 저장 중 흐름만 연결한다.
- 연결, 일반 참가자 이탈, 제목 결과, 저장 결과 UI는 export하되 demo에 노출하지 않는다.
- 기존 `MeetingEntryModal`, 전사, AI Chat 동작을 변경하지 않는다.
- Figma 임시 asset URL을 소스에 남기지 않는다.
- 생산 코드보다 실패하는 테스트를 먼저 작성한다.

---

### Task 1: 테스트 기반과 제목 검증 함수

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/features/meeting-controls/lib/validateMeetingTitle.test.ts`
- Create: `src/features/meeting-controls/lib/validateMeetingTitle.ts`

**Interfaces:**
- Produces: `validateMeetingTitle(draft: string, currentTitle: string, maxLength?: number): boolean`
- Produces: `pnpm test` command using jsdom

- [ ] **Step 1: Install the test runtime**

Run:

```powershell
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Configure Vitest**

Add the script:

```json
"test": "vitest run"
```

Configure `vitest.config.ts` with `environment: 'jsdom'`, `globals: true`, and `setupFiles: ['./src/test/setup.ts']`. Import `@testing-library/jest-dom/vitest` from the setup file.

- [ ] **Step 3: Write the failing title validation tests**

Cover these exact cases:

```ts
expect(validateMeetingTitle('', '2차 대면회의')).toBe(false)
expect(validateMeetingTitle('   ', '2차 대면회의')).toBe(false)
expect(validateMeetingTitle(' 2차 대면회의 ', '2차 대면회의')).toBe(false)
expect(validateMeetingTitle('2차 회의', '2차 대면회의')).toBe(true)
expect(validateMeetingTitle('가'.repeat(51), '2차 대면회의')).toBe(false)
```

- [ ] **Step 4: Run the test and verify RED**

Run:

```powershell
pnpm test -- src/features/meeting-controls/lib/validateMeetingTitle.test.ts
```

Expected: FAIL because `validateMeetingTitle.ts` does not exist.

- [ ] **Step 5: Implement the validator**

Implementation contract:

```ts
export function validateMeetingTitle(
  draft: string,
  currentTitle: string,
  maxLength = 50,
) {
  const normalizedDraft = draft.trim()
  return normalizedDraft.length > 0
    && normalizedDraft.length <= maxLength
    && normalizedDraft !== currentTitle.trim()
}
```

- [ ] **Step 6: Run the test and verify GREEN**

Run the focused test, then `pnpm test`.

---

### Task 2: 접근 가능한 OverlayDialog와 dismissable layer

**Files:**
- Create: `src/shared/ui/OverlayDialog/OverlayDialog.test.tsx`
- Create: `src/shared/ui/OverlayDialog/OverlayDialog.tsx`
- Create: `src/shared/ui/OverlayDialog/index.ts`
- Create: `src/shared/lib/useDismissableLayer.test.tsx`
- Create: `src/shared/lib/useDismissableLayer.ts`
- Modify: `src/shared/ui/index.ts`

**Interfaces:**
- Produces: `OverlayDialogProps` from the design spec
- Produces: `useDismissableLayer<T extends HTMLElement>()`

- [ ] **Step 1: Write failing OverlayDialog behavior tests**

Verify:

- `open=false` renders nothing.
- `open=true` renders `role="dialog"` and `aria-modal="true"`.
- opening moves focus to the first enabled control.
- Tab and Shift+Tab stay inside the dialog.
- Escape calls `onClose` only when `closeOnEscape=true`.
- unmount restores focus to the previously focused trigger.

- [ ] **Step 2: Run focused tests and verify RED**

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement OverlayDialog**

Use a fixed `z-[60]` overlay, `rgba(0,0,0,0.6)` background, centered 440px surface, and `max-w-[calc(100vw-32px)]`. Store the previous focused element, focus the first focusable child, trap Tab, restore focus, and disable body scrolling while open.

- [ ] **Step 4: Write and verify failing dismissable layer tests**

Render a trigger and layer. Verify outside `pointerdown` and Escape invoke `onDismiss`, while inside pointerdown does not.

- [ ] **Step 5: Implement useDismissableLayer and verify GREEN**

Attach document listeners only while `open=true`, remove them on cleanup, and return the layer ref.

---

### Task 3: 연결 상태 UI와 Toast 시각 보정

**Files:**
- Create: `src/features/meeting-connection/model/meetingConnection.types.ts`
- Create: `src/features/meeting-connection/ui/MeetingConnectionToast.test.tsx`
- Create: `src/features/meeting-connection/ui/MeetingConnectionToast.tsx`
- Create: `src/features/meeting-connection/ui/TranscriptionInterruptedDialog.test.tsx`
- Create: `src/features/meeting-connection/ui/TranscriptionInterruptedDialog.tsx`
- Create: `src/features/meeting-connection/index.ts`
- Modify: `src/shared/ui/Toast/Toast.tsx`
- Modify: `src/shared/styles/tokens.css`

**Interfaces:**
- Produces: `MeetingConnectionToast({ status: 'unstable' | 'restored' })`
- Produces: `TranscriptionInterruptedDialog({ open, onClose })`

- [ ] **Step 1: Write failing connection UI tests**

Verify exact Korean copy for both toast variants and the interruption dialog. Verify unstable uses an assertive region and restored uses a polite region. Verify the dialog close button calls `onClose`.

- [ ] **Step 2: Run tests and verify RED**

Expected: FAIL because the feature files do not exist.

- [ ] **Step 3: Implement connection UI**

Compose existing `Toast` with `size="compact"` and `position="topCenter"`. Compose `OverlayDialog` and existing `Button` for the interruption dialog.

- [ ] **Step 4: Match Figma toast shadows**

Add success/error shadow tokens:

```css
--shadow-toast-error: 0 8px 24px rgb(216 45 45 / 0.08);
--shadow-toast-success: 0 8px 24px rgb(45 216 82 / 0.08);
```

Apply them by Toast type without changing the public props.

- [ ] **Step 5: Run focused and full tests**

---

### Task 4: 참여자 Popover와 제목 수정 UI

**Files:**
- Create: `src/features/meeting-controls/model/meetingControls.types.ts`
- Create: `src/features/meeting-controls/ui/MeetingParticipantsPopover.test.tsx`
- Create: `src/features/meeting-controls/ui/MeetingParticipantsPopover.tsx`
- Create: `src/features/meeting-controls/ui/MeetingMoreMenu.test.tsx`
- Create: `src/features/meeting-controls/ui/MeetingMoreMenu.tsx`
- Create: `src/features/meeting-controls/ui/MeetingTitleEditDialog.test.tsx`
- Create: `src/features/meeting-controls/ui/MeetingTitleEditDialog.tsx`
- Create: `src/features/meeting-controls/ui/MeetingTitleResultToast.test.tsx`
- Create: `src/features/meeting-controls/ui/MeetingTitleResultToast.tsx`
- Create: `src/features/meeting-controls/index.ts`
- Create: `src/features/meeting-controls/assets/clipboard.svg`
- Create: `src/features/meeting-controls/assets/microphone.svg`
- Create: `src/features/meeting-controls/assets/participant-you.png`
- Create: `src/features/meeting-controls/assets/participant-design.png`
- Create: `src/features/meeting-controls/assets/participant-pm.png`
- Create: `src/features/meeting-controls/assets/participant-server.png`

**Interfaces:**
- Produces: `MeetingParticipant`
- Produces: `MeetingParticipantsPopover`, `MeetingMoreMenu`, `MeetingTitleEditDialog`, `MeetingTitleResultToast`

- [ ] **Step 1: Download exact Figma assets**

Use the asset URLs returned by `get_design_context` for nodes `1869:18326` and `1961:25874`. Save the exact bytes under the paths above; do not author replacement glyphs.

- [ ] **Step 2: Write failing participant and menu tests**

Verify participant order, `(you)`, host badge, microphone icon, outside/Escape dismissal, and `제목 수정하기` callback.

- [ ] **Step 3: Implement participant and menu components**

Use 42px rows, 8px container padding, 16px radius, gray-300 border, `0 4px 8px rgba(0,0,0,0.08)` shadow. Anchor participants with `left-0 top-[calc(100%+8px)]` and more menu with `right-0 top-[calc(100%+8px)]`.

- [ ] **Step 4: Write failing title dialog tests**

Verify current title initialization, unchanged title disabled, changed title enabled, 50 character limit, trimmed submit, cancel, and reset on reopen.

- [ ] **Step 5: Implement title dialog**

Use `validateMeetingTitle`, existing `InputBox` and `Button`, centered dialog title, and submit through a form so Enter works.

- [ ] **Step 6: Write failing title result toast tests**

Verify success requires and displays `nextTitle`; failure displays the exact failure copy.

- [ ] **Step 7: Implement result toast and verify all Task 4 tests**

Do not connect result toasts to demo state.

---

### Task 5: 이탈·종료·저장 Dialog

**Files:**
- Create: `src/features/meeting-controls/ui/MeetingExitDialog.test.tsx`
- Create: `src/features/meeting-controls/ui/MeetingExitDialog.tsx`
- Create: `src/features/meeting-controls/ui/MeetingSaveDialog.test.tsx`
- Create: `src/features/meeting-controls/ui/MeetingSaveDialog.tsx`
- Modify: `src/features/meeting-controls/index.ts`

**Interfaces:**
- Produces: `MeetingExitDialog({ mode: 'leave' | 'end', ...callbacks })`
- Produces: discriminated `MeetingSaveDialogProps`

- [ ] **Step 1: Write failing exit dialog tests**

Verify mode-specific titles, shared description, cancel callback, and confirm callback.

- [ ] **Step 2: Implement MeetingExitDialog and verify GREEN**

Use one component for both Figma variants.

- [ ] **Step 3: Write failing save dialog tests**

Verify:

- saving has no button and cannot dismiss.
- success renders project title, meeting title, clipboard asset, and close callback.
- failure renders retry copy and callback.

- [ ] **Step 4: Implement MeetingSaveDialog and verify GREEN**

Use the exact copy and 440px surface geometry from nodes `1961:25867`, `1961:25874`, and `1961:25899`.

---

### Task 6: MeetingHeader와 MeetingPage demo 통합

**Files:**
- Create: `src/pages/MeetingPage.test.tsx`
- Modify: `src/pages/MeetingPage.tsx`
- Modify: `src/widgets/meeting-room/ui/MeetingHeader.tsx`
- Modify: `src/widgets/meeting-room/ui/MeetingRoom.tsx` only if prop forwarding requires it

**Interfaces:**
- Consumes: all Task 4 and Task 5 components
- Produces: interactive `/meetings/demo/live` demo flow

- [ ] **Step 1: Write failing integration tests**

Verify:

- participant button opens the participant popover.
- more button opens the menu.
- selecting title edit opens the dialog.
- valid submit updates the header title.
- meeting end opens the host confirmation dialog.
- confirm transitions to saving.
- connection/result UI text is absent from the default demo.

- [ ] **Step 2: Run integration test and verify RED**

- [ ] **Step 3: Add popover slots to MeetingHeader**

Add:

```ts
participantsPopover?: ReactNode
moreMenuPopover?: ReactNode
```

Render each slot in a relative wrapper next to its trigger and add `aria-expanded`.

- [ ] **Step 4: Implement MeetingPage layer orchestration**

Use:

```ts
type MeetingDemoLayer =
  | { kind: 'none' }
  | { kind: 'participants' }
  | { kind: 'moreMenu' }
  | { kind: 'editTitle' }
  | { kind: 'confirmEnd' }
  | { kind: 'saving' }
```

Store `meetingTitle` in local state, initialize the Figma participant sample list, and render only the approved demo flow.

- [ ] **Step 5: Run integration and full tests**

---

### Task 7: Figma QA and repository verification

**Files:**
- Modify only files required by verified visual discrepancies.

- [ ] **Step 1: Run automated verification**

```powershell
pnpm test
pnpm run lint
pnpm run typecheck
pnpm run build
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 2: Run local visual QA**

Inspect:

- `1440 × 1024`
- `1024 × 1024`
- `480 × 800` for dialog max width only

Compare participants popover, more menu, title dialog disabled/enabled states, end dialog, and saving dialog to their mapped Figma nodes.

- [ ] **Step 3: Verify scope**

Confirm no preview route, query scenario, Figma temporary URL, connection demo state, result demo state, or participant role-detection logic was added.

- [ ] **Step 4: Review git diff**

Confirm only issue #25 design docs, test setup, meeting features, shared overlay utilities, and meeting demo integration changed.

