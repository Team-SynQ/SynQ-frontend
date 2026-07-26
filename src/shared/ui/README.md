# Shared UI Components

Figma `DesignSystem > Component` 기준으로 2회 이상 재사용될 공통 UI를 `shared/ui`에 둡니다.

## Button

- Props: `variant`, `size`, `disabled`, `leftIcon`, `rightIcon`
- Variant: `primaryFill`, `primaryLine`, `fillGray100`, `basic`
- Size: `large`, `medium`, `small`
- State: 기본 CSS로 `hover`, `active`, `disabled` 처리

```tsx
<Button variant="primaryFill" size="large">
  저장
</Button>
```

## InputBox

- Props: `size`, `visualState`, `label`, `helperText`, `errorText`, `leftSlot`, `rightSlot`
- Size: `large`, `medium`, `default`
- State: `default`, `hover`, `active`, `error`, `disabled`, `filled`

```tsx
<InputBox label="프로젝트명" placeholder="프로젝트명을 입력하세요" />
```

## Modal

- Props: `type`, `title`, `description`, `children`, `confirmLabel`, `cancelLabel`
- Type: `confirm`, `form`
- 구성: Title, Description, Content, Button Group

```tsx
<Modal title="프로젝트를 삭제할까요?" description="삭제 후 되돌릴 수 없습니다." />
```

## Toast

- Props: `type`, `title`, `description`, `autoClose`, `position`
- Type: `success`, `error`
- Position: `topRight`, `bottomRight`, `topCenter`, `bottomCenter`

```tsx
<Toast type="success" title="저장되었습니다" />
```

## Panel / Sidebar

- Props: `type`, `header`, `footer`, `children`
- Type: `fold`, `unfolded`

## ProjectMenuItem

- Props: `visualState`, `icon`
- State: `default`, `hover`, `active`

## Segment

- Props: `Segment`, `SegmentItem`
- State: `default`, `hover`, `active`

## Checkbox / Radio

- Props: 기본 input props, `label`
- State: 브라우저 input의 `checked`, `disabled` 기반

## Badge

- Props: `size`
- Size: `small`, `extraSmall`

## EmptyState

- Props: `title`, `description`, `action`

```tsx
<EmptyState title="아직 프로젝트가 없습니다" />
```
