# Participant Popover Alignment Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Figma node `1869:18326`과 동일하게 진행자 배지는 참가자 이름 바로 뒤에, 마이크 아이콘은 행 오른쪽 끝에 배치한다.

**Architecture:** `MeetingParticipantsPopover`의 각 행을 Figma의 두 그룹 구조로 변경한다. 왼쪽 참가자 정보 그룹은 226px, 오른쪽 마이크 영역은 24px로 유지하고 두 그룹 사이에 32px 간격을 둔다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest, React Testing Library

## Global Constraints

- 팝오버 전체 폭은 330px, 내부 행 콘텐츠 폭은 282px을 유지한다.
- 프로필은 24px, 참가자 정보 그룹은 226px, 마이크 영역은 24px이다.
- 진행자 배지는 참가자 이름 바로 뒤에 8px 간격으로 배치한다.
- 마이크 아이콘은 참가자 정보 그룹과 32px 간격을 둔다.
- Figma에서 받은 기존 마이크 에셋을 그대로 사용한다.

---

### Task 1: 참가자 행 정렬 수정

**Files:**
- Modify: `src/features/meeting-controls/ui/MeetingParticipantsPopover.test.tsx`
- Modify: `src/features/meeting-controls/ui/MeetingParticipantsPopover.tsx`

**Interfaces:**
- Consumes: `MeetingParticipant`
- Produces: 기존 `MeetingParticipantsPopover` public API를 유지한 Figma 정렬

- [ ] **Step 1: Write the failing test**

첫 번째 참가자 행에서 참가자 정보 그룹과 마이크 영역을 조회해 다음 클래스를 검증한다.

```tsx
expect(screen.getByTestId('participant-info-you')).toHaveClass('w-[226px]')
expect(screen.getByTestId('participant-microphone-you')).toHaveClass('size-[24px]')
expect(items[0]).toHaveClass('gap-l')
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/features/meeting-controls/ui/MeetingParticipantsPopover.test.tsx
```

Expected: `participant-info-you` 요소를 찾지 못해 FAIL.

- [ ] **Step 3: Write minimal implementation**

행 내부를 다음 구조로 변경한다.

```tsx
<div className="flex h-[42px] items-center gap-l px-s">
  <div className="flex w-[226px] shrink-0 items-center gap-xs">
    <Profile />
    <span>participant name</span>
    <HostBadge />
  </div>
  <Microphone className="size-[24px]" />
</div>
```

프로필과 fallback 프로필은 모두 `size-[24px]`로 변경하고, 이름의 `flex-1`을 제거한다.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
pnpm test src/features/meeting-controls/ui/MeetingParticipantsPopover.test.tsx
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: 모든 명령이 exit code 0.

