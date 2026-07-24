# Meeting More Menu Surface Size Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 제목 수정 메뉴 surface를 Figma node `1740:17638`의 `165×58px` 규격과 동일하게 맞춘다.

**Architecture:** 기존 메뉴 항목과 동작은 유지한다. 바깥 surface의 폭, padding, shadow만 조정해 내부 버튼이 `149×42px`이 되도록 한다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest, React Testing Library

## Global Constraints

- surface 크기는 `165×58px`이다.
- surface border는 1px이고 radius는 16px이다.
- CSS border를 포함해 내부 버튼을 149px로 만들기 위해 surface padding은 7px이다.
- shadow는 `0 4px 8px rgba(0,0,0,0.08)`이다.
- 기존 메뉴 항목 크기와 callback 동작을 변경하지 않는다.

---

### Task 1: 메뉴 surface 치수 수정

**Files:**
- Modify: `src/features/meeting-controls/ui/MeetingMoreMenu.test.tsx`
- Modify: `src/features/meeting-controls/ui/MeetingMoreMenu.tsx`

**Interfaces:**
- Consumes: 기존 `MeetingMoreMenuProps`
- Produces: 동일한 public API와 Figma surface 치수

- [ ] **Step 1: Write the failing test**

```tsx
const menu = screen.getByRole('menu', { name: '회의 메뉴' })
expect(menu).toHaveClass(
  'h-[58px]',
  'w-[165px]',
  'p-[7px]',
  'shadow-[0_4px_8px_rgb(0_0_0/0.08)]',
)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/features/meeting-controls/ui/MeetingMoreMenu.test.tsx
```

Expected: 기존 `w-[172px]`, `p-xs`, 12px blur shadow 때문에 FAIL.

- [ ] **Step 3: Write minimal implementation**

```tsx
className="h-[58px] w-[165px] p-[7px] shadow-[0_4px_8px_rgb(0_0_0/0.08)]"
```

- [ ] **Step 4: Run focused and full verification**

```bash
pnpm test src/features/meeting-controls/ui/MeetingMoreMenu.test.tsx
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: 모든 명령이 exit code 0.

