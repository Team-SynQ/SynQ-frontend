# Transcript Hint Visual and Collapse Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Figma 기준으로 선택 전사와 SynQ 힌트를 분리하고, 네 모서리 radius와 위쪽 화살표를 맞추며, 힌트 접기·재선택 복원 동작을 구현한다.

**Architecture:** `TranscriptItem`은 선택 전사 surface와 힌트 surface를 형제 컨테이너로 렌더링한다. `TranscriptHintCard`는 접기 이벤트만 상위로 전달하고, `useLiveMeetingController`가 힌트 상태와 요청 무효화를 관리하여 기존 캐시 흐름으로 재선택 시 복원한다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4 design tokens, Vitest, Testing Library

## Global Constraints

- Figma `1167:11727`의 선택 전사·힌트 사이 `8px` 간격과 각 카드 `12px` radius를 사용한다.
- Figma `1167:12029`, `1167:12033`, `1167:12037`의 라벨은 공통 `--radius-s` (`8px`)로 네 모서리를 동일하게 처리한다.
- Figma `2380:37029`의 `chevron-up` 자산을 사용한다.
- 접으면 힌트 카드 전체를 제거하고, 같은 전사 재선택 시 캐시된 힌트를 복원한다.
- 새로운 색상·spacing·radius 값을 하드코딩하지 않고 기존 디자인 토큰을 사용한다.

---

### Task 1: 전사·힌트 surface와 Figma 시각 요소 수정

**Files:**
- Create: `src/shared/assets/icons/chevron-up.svg`
- Modify: `src/features/live-transcription/ui/TranscriptItem.tsx`
- Modify: `src/features/live-transcription/ui/TranscriptHintCard.tsx`
- Test: `src/features/live-transcription/ui/TranscriptPanel.test.tsx`

**Interfaces:**
- Consumes: `TranscriptHintState`, `--radius-s`, `gap-xs`, `rounded-m`
- Produces: `TranscriptHintCardProps.onCollapse?: (transcriptId: string) => void`

- [ ] **Step 1: Write the failing visual and collapse-event tests**

```tsx
expect(selectedSurface).toHaveClass('rounded-m', 'bg-surface-muted', 'p-s')
expect(hintSurface).toHaveClass('rounded-m', 'bg-surface-muted', 'p-s')
expect(selectedSurface.parentElement).toHaveClass('gap-xs')
expect(label).toHaveClass('rounded-[var(--radius-s)]')

await user.click(screen.getByRole('button', { name: 'SynQ 힌트 접기' }))
expect(actions.onCollapseHint).toHaveBeenCalledWith('segment-1')
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm.cmd test -- src/features/live-transcription/ui/TranscriptPanel.test.tsx --run`

Expected: FAIL because the selected surface currently wraps the hint, the label uses logical-side `rounded-s`, and no collapse callback exists.

- [ ] **Step 3: Implement the minimal Figma structure**

```tsx
<article className="flex w-full flex-col gap-xs" role="option">
  <div className={cn('rounded-m p-s', isSelected && 'bg-surface-muted')}>
    {/* transcript content */}
  </div>
  {isSelected && segmentHintState ? (
    <TranscriptHintCard
      onCollapse={onCollapseHint}
      onRetry={onRetryHint}
      state={segmentHintState}
    />
  ) : null}
</article>
```

Use `rounded-[var(--radius-s)]` for each hint label and the committed Figma `chevron-up.svg` for the collapse button.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm.cmd test -- src/features/live-transcription/ui/TranscriptPanel.test.tsx --run`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/assets/icons/chevron-up.svg src/features/live-transcription/ui/TranscriptItem.tsx src/features/live-transcription/ui/TranscriptHintCard.tsx src/features/live-transcription/ui/TranscriptPanel.test.tsx
git commit -m "fix/#45: 전사 힌트 Figma 스타일 정렬"
```

### Task 2: 힌트 접기와 재선택 캐시 복원

**Files:**
- Modify: `src/features/live-transcription/model/transcript.types.ts`
- Modify: `src/features/live-transcription/ui/TranscriptPanel.tsx`
- Modify: `src/pages/meeting/model/useLiveMeetingController.ts`
- Test: `src/pages/MeetingPage.test.tsx`

**Interfaces:**
- Consumes: `hintRequestSequenceRef`, `hintCacheRef`, `loadHint(transcriptId, true)`
- Produces: `TranscriptPanelActions.onCollapseHint?: (segmentId: string) => void`

- [ ] **Step 1: Write the failing integration test**

```tsx
await user.click(await screen.findByText(/지난주 유저 인터뷰 결과/))
expect(await screen.findByRole('article', { name: 'SynQ 힌트' })).toBeInTheDocument()

await user.click(screen.getByRole('button', { name: 'SynQ 힌트 접기' }))
expect(screen.queryByRole('article', { name: 'SynQ 힌트' })).not.toBeInTheDocument()

await user.click(screen.getByText(/지난주 유저 인터뷰 결과/))
expect(await screen.findByRole('article', { name: 'SynQ 힌트' })).toBeInTheDocument()
```

- [ ] **Step 2: Run the integration test and verify RED**

Run: `npm.cmd test -- src/pages/MeetingPage.test.tsx --run`

Expected: FAIL because the collapse button does not change controller state.

- [ ] **Step 3: Implement controller-owned collapse**

```ts
onCollapseHint: (transcriptId) => {
  if (hintState.status === 'idle' || hintState.transcriptId !== transcriptId) return
  hintRequestSequenceRef.current += 1
  setHintState({ status: 'idle' })
}
```

Keep `selectSegment` calling `loadHint(segmentId, true)` so the same transcript restores a successful hint from `hintCacheRef`.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
npm.cmd test -- src/pages/MeetingPage.test.tsx src/features/live-transcription/ui/TranscriptPanel.test.tsx --run
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
git diff --check
```

Expected: all commands PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/live-transcription/model/transcript.types.ts src/features/live-transcription/ui/TranscriptPanel.tsx src/pages/meeting/model/useLiveMeetingController.ts src/pages/MeetingPage.test.tsx
git commit -m "fix/#45: 전사 힌트 접기 흐름 구현"
```
