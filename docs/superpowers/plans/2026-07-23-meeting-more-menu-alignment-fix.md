# Meeting More Menu Alignment Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Figma node `1740:17638`과 동일하게 제목 수정 메뉴의 아이콘과 텍스트를 버튼 내부에 균형 있게 정렬한다.

**Architecture:** 기존 `MeetingMoreMenu` public API와 클릭 동작은 유지한다. 메뉴 버튼의 크기, 패딩, 아이콘 영역, 타이포그래피만 Figma 토큰에 맞춘다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest, React Testing Library

## Global Constraints

- 버튼 높이는 42px이다.
- 버튼 좌우 패딩은 16px이다.
- 아이콘 영역은 24px이고 텍스트와 간격은 8px이다.
- 텍스트는 `typo-body-01`, `text-fg-secondary`를 사용한다.
- 기존 프로젝트의 `edit.svg` 에셋과 callback 동작을 유지한다.

---

### Task 1: 제목 수정 메뉴 항목 정렬

**Files:**
- Modify: `src/features/meeting-controls/ui/MeetingMoreMenu.test.tsx`
- Modify: `src/features/meeting-controls/ui/MeetingMoreMenu.tsx`

**Interfaces:**
- Consumes: 기존 `MeetingMoreMenuProps`
- Produces: 기존 callback 동작을 유지하는 Figma 정렬 메뉴

- [ ] **Step 1: Write the failing test**

```tsx
const menuItem = screen.getByRole('menuitem', { name: '제목 수정하기' })
expect(menuItem).toHaveClass('h-[42px]', 'px-s', 'typo-body-01', 'text-fg-secondary')
expect(screen.getByTestId('meeting-more-menu-icon')).toHaveClass('size-[24px]')
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/features/meeting-controls/ui/MeetingMoreMenu.test.tsx
```

Expected: 기존 `h-[40px]`, `px-xs`, `typo-body-02`, 18px 아이콘 때문에 FAIL.

- [ ] **Step 3: Write minimal implementation**

```tsx
<button className="flex h-[42px] w-full items-center gap-xs px-s typo-body-01 text-fg-secondary">
  <span className="flex size-[24px] items-center justify-center">
    <img className="size-[24px]" src={editIcon} />
  </span>
  <span>제목 수정하기</span>
</button>
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

