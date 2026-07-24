# 회의 진행 모달·팝오버 UI 구현 설계

## 1. 문서 목적

이 문서는 SynQ 회의 진행 화면에서 사용할 연결 상태 안내, 참여자 확인, 회의 제목 수정, 회의 이탈·종료·저장 상태 UI를 구현하기 위한 기준을 정의한다.

구현의 우선순위는 다음과 같다.

1. 제공된 Figma 노드의 시각 규격과 문구를 따른다.
2. 현재 `/meetings/:meetingId/live` 화면의 `MeetingPage → MeetingRoom → MeetingHeader` 구조를 유지한다.
3. 별도 프리뷰 페이지나 개발용 상태 선택 UI를 만들지 않는다.
4. 현재 demo에서 자연스럽게 실행할 수 있는 기능만 기존 헤더 버튼에 연결한다.
5. 연결 상태 및 성공·실패 결과처럼 실제 API·WebSocket 상태가 필요한 UI는 재사용 가능한 컴포넌트만 구현하고 demo에는 노출하지 않는다.

## 2. 현재 코드 기준선

현재 회의 진행 화면은 다음 파일을 중심으로 구성되어 있다.

- `src/pages/MeetingPage.tsx`
  - 회의 진행 화면의 목 데이터와 로컬 상태를 소유한다.
  - 헤더, 전사, AI Chat에 전달할 model/action 객체를 조립한다.
- `src/widgets/meeting-room/ui/MeetingRoom.tsx`
  - 회의 헤더와 본문 레이아웃을 조립한다.
- `src/widgets/meeting-room/ui/MeetingHeader.tsx`
  - 참여자 버튼, 녹음 버튼, 회의 종료 버튼, 더보기 버튼을 렌더링한다.
- `src/shared/ui/Modal/Modal.tsx`
  - 제목, 설명, 버튼 조합을 제공하는 공통 모달 surface다.
  - 전체 화면 overlay, 포커스 트랩, Escape 처리 기능은 제공하지 않는다.
- `src/shared/ui/Toast/Toast.tsx`
  - success/error, default/compact 스타일을 제공한다.
  - 컴포넌트가 스스로 노출 시간을 관리하지 않고 부모가 mount/unmount를 관리한다.

회의 화면은 현재 최소 `1024 × 720`을 기준으로 한다. 이번 작업에서는 기존 회의 화면의 최소 해상도 정책을 변경하지 않는다.

## 3. 범위

### 3.1 demo 화면에서 실제 연결하는 UI

다음 항목은 기존 `/meetings/demo/live` 화면의 헤더 버튼으로 확인할 수 있어야 한다.

1. 참여자 버튼
   - 참여자 목록 popover 열기
   - 바깥 영역 클릭 또는 Escape로 닫기
2. 더보기 버튼
   - `제목 수정하기` 메뉴 열기
   - 메뉴 선택 시 회의 제목 수정 dialog 열기
3. 회의 제목 수정 dialog
   - 현재 제목을 초기값으로 표시
   - 제목 유효성에 따른 버튼 활성화
   - 제출 시 `MeetingPage`의 로컬 제목 갱신
4. 회의 종료 버튼
   - 진행자용 종료 확인 dialog 열기
   - `종료하기` 선택 시 저장 중 dialog로 전환

### 3.2 컴포넌트만 구현하고 demo에 노출하지 않는 UI

다음 항목은 UI와 public props를 완성하지만 `MeetingPage`의 demo 상태에는 연결하지 않는다.

1. 연결 상태 불안정 toast
2. 연결 복구 완료 toast
3. 연결 불안 지속에 따른 전사 중단 dialog
4. 일반 참가자용 회의 이탈 확인 dialog
5. 회의 제목 변경 성공 toast
6. 회의 제목 변경 실패 toast
7. 회의 저장 완료 dialog
8. 회의 저장 실패 dialog

이 컴포넌트들은 이후 WebSocket 연결 상태, 제목 수정 mutation, 회의 종료 mutation과 직접 연결할 수 있는 callback 기반 API를 제공한다.

### 3.3 제외 범위

- 실제 네트워크 연결 감지
- 마이크 권한 확인
- WebSocket/SSE 연결과 재연결
- 실제 회의 제목 수정 API
- 실제 회의 종료 및 저장 API
- 진행자와 일반 참가자의 권한 판별
- 연결/성공/실패 상태를 선택하는 query parameter
- 별도 preview route 또는 demo control panel
- 회의 종료 후 프로젝트/회의 기록 페이지 이동

## 4. Figma 노드와 구현 대상 매핑

### 4.1 연결 상태

| 목적 | Figma node | 구현 대상 |
| --- | --- | --- |
| 연결 불안정 전체 화면 | `1089:4992` | 배치 기준 |
| 연결 불안정 toast | `1091:4930` | `MeetingConnectionToast status="unstable"` |
| 연결 복구 toast | `1089:6546` | `MeetingConnectionToast status="restored"` |
| 전사 중단 dialog | `1961:23948` | `TranscriptionInterruptedDialog` |
| 전사 중단 전체 화면 | `1961:23846` | overlay 및 중앙 정렬 기준 |

### 4.2 일반 참가자 이탈

| 목적 | Figma node | 구현 대상 |
| --- | --- | --- |
| 일반 참가자 회의 이탈 확인 | `1961:24072` | `MeetingExitDialog mode="leave"` |

### 4.3 참여자 목록

| 목적 | Figma node | 구현 대상 |
| --- | --- | --- |
| 참여자 버튼이 포함된 회의 화면 | `1740:14898` | 헤더 배치 기준 |
| 참여자 목록 popover | `1869:18326` | `MeetingParticipantsPopover` |
| 참여자 버튼 | `1740:14904` | 기존 `MeetingHeader` 버튼 재사용 |
| 1024px 화면 배치 | `1961:26974` | popover 위치 반응형 기준 |

### 4.4 회의 제목 수정

| 목적 | Figma node | 구현 대상 |
| --- | --- | --- |
| 더보기 버튼이 포함된 화면 | `1740:17520` | 헤더 배치 기준 |
| 더보기 버튼 | `1740:17627` | 기존 `MeetingHeader` 버튼 재사용 |
| 제목 수정하기 메뉴 | `1740:17638` | `MeetingMoreMenu` |
| 1024px 메뉴 배치 | `1961:26713` | 메뉴 위치 반응형 기준 |
| 제목 수정 dialog 전체 화면 | `1961:23144` | overlay 기준 |
| 변경 버튼 비활성 dialog | `1961:23249` | dialog 초기 상태 |
| 변경 버튼 활성 dialog | `1961:23618` | 유효한 수정 상태 |
| 변경 성공 전체 화면 | `1740:18174` | toast 배치 기준 |
| 변경 성공 toast | `1740:18310` | `MeetingTitleResultToast result="success"` |
| 변경 성공 1024px 배치 | `1961:26778` | toast 반응형 기준 |
| 변경 실패 전체 화면 | `1964:32353` | toast 배치 기준 |
| 변경 실패 toast | `1964:32463` | `MeetingTitleResultToast result="failure"` |

### 4.5 회의 종료와 저장

| 목적 | Figma node | 구현 대상 |
| --- | --- | --- |
| 진행자 종료 확인 전체 화면 | `1961:25851` | overlay 기준 |
| 진행자 종료 확인 dialog | `1961:25852` | `MeetingExitDialog mode="end"` |
| 저장 중 전체 화면 | `1961:25479` | overlay 기준 |
| 저장 중 dialog | `1961:25867` | `MeetingSaveDialog state="saving"` |
| 저장 완료 전체 화면 | `1961:25603` | overlay 기준 |
| 저장 완료 dialog | `1961:25874` | `MeetingSaveDialog state="success"` |
| 저장 실패 전체 화면 | `1961:25727` | overlay 기준 |
| 저장 실패 dialog | `1961:25899` | `MeetingSaveDialog state="failure"` |

## 5. 아키텍처

회의 관련 UI를 한 파일에 모으지 않고 사용자 기능을 기준으로 두 개의 feature slice로 분리한다.

```text
src/
├─ features/
│  ├─ meeting-connection/
│  │  ├─ model/
│  │  │  └─ meetingConnection.types.ts
│  │  ├─ ui/
│  │  │  ├─ MeetingConnectionToast.tsx
│  │  │  └─ TranscriptionInterruptedDialog.tsx
│  │  └─ index.ts
│  └─ meeting-controls/
│     ├─ assets/
│     │  ├─ clipboard.svg
│     │  ├─ microphone.svg
│     │  └─ participant-*.png
│     ├─ lib/
│     │  └─ validateMeetingTitle.ts
│     ├─ model/
│     │  └─ meetingControls.types.ts
│     ├─ ui/
│     │  ├─ MeetingParticipantsPopover.tsx
│     │  ├─ MeetingMoreMenu.tsx
│     │  ├─ MeetingTitleEditDialog.tsx
│     │  ├─ MeetingTitleResultToast.tsx
│     │  ├─ MeetingExitDialog.tsx
│     │  └─ MeetingSaveDialog.tsx
│     └─ index.ts
├─ shared/
│  ├─ lib/
│  │  └─ useDismissableLayer.ts
│  └─ ui/
│     └─ OverlayDialog/
│        ├─ OverlayDialog.tsx
│        └─ index.ts
├─ pages/
│  └─ MeetingPage.tsx
└─ widgets/
   └─ meeting-room/
      └─ ui/
         └─ MeetingHeader.tsx
```

### 5.1 분리 원칙

- `meeting-connection`
  - 연결 품질과 전사 중단 상태만 표현한다.
  - 회의 헤더 버튼 상태를 알지 않는다.
- `meeting-controls`
  - 헤더에서 실행하는 참여자, 제목, 이탈, 종료, 저장 UI를 제공한다.
  - API 호출을 직접 수행하지 않는다.
- `OverlayDialog`
  - feature 문구를 알지 않는 공통 접근성 overlay다.
  - focus trap, Escape, 포커스 복귀, 배경 dim 처리를 담당한다.
- `MeetingPage`
  - demo에서 활성화할 layer와 로컬 회의 제목을 관리한다.
- `MeetingHeader`
  - 참여자 버튼과 더보기 버튼을 popover anchor로 제공한다.
  - feature 구현을 직접 알지 않도록 `ReactNode` slot을 받는다.

## 6. 공통 타입과 인터페이스

### 6.1 MeetingPage의 demo layer

동시에 둘 이상의 dialog/popover가 열리지 않도록 단일 discriminated union을 사용한다.

```ts
export type MeetingDemoLayer =
  | { kind: 'none' }
  | { kind: 'participants' }
  | { kind: 'moreMenu' }
  | { kind: 'editTitle' }
  | { kind: 'confirmEnd' }
  | { kind: 'saving' }
```

연결 상태와 성공/실패 결과는 demo layer union에 포함하지 않는다.

### 6.2 참여자 모델

```ts
export type MeetingParticipant = {
  id: string
  name: string
  role: string
  avatarSrc?: string
  isCurrentUser?: boolean
  isHost?: boolean
  isMicrophoneOn?: boolean
}
```

demo 데이터는 Figma와 같은 네 명을 사용한다.

```ts
[
  {
    id: 'participant-you',
    name: '윤금서',
    role: 'Design',
    isCurrentUser: true,
    isHost: true,
    isMicrophoneOn: true,
  },
  { id: 'participant-2', name: '이동희', role: 'Design' },
  { id: 'participant-3', name: '이소미', role: 'PM' },
  { id: 'participant-4', name: '김도진', role: 'Server' },
]
```

### 6.3 컴포넌트 API

#### OverlayDialog

```ts
export type OverlayDialogProps = {
  open: boolean
  titleId: string
  descriptionId?: string
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  onClose?: () => void
  className?: string
  children: ReactNode
}
```

- `closeOnEscape`와 `closeOnBackdrop`의 기본값은 `false`다.
- 두 옵션 중 하나를 활성화할 때는 `onClose`를 필수로 전달한다.
- `open=false`이면 DOM을 렌더링하지 않는다.
- surface의 구조와 문구는 feature 컴포넌트가 소유한다.
- overlay dim, 접근성 role, focus trap, body scroll 차단과 포커스 복귀를 담당한다.

#### useDismissableLayer

```ts
export function useDismissableLayer<T extends HTMLElement>(options: {
  open: boolean
  onDismiss: () => void
  restoreFocusRef?: RefObject<HTMLElement | null>
}): RefObject<T | null>
```

- 반환 ref 바깥에서 발생한 pointer down에 `onDismiss`를 호출한다.
- Escape 입력에 `onDismiss`를 호출한다.
- 닫힐 때 `restoreFocusRef`가 있으면 해당 trigger로 포커스를 돌려준다.

#### MeetingConnectionToast

```ts
export type MeetingConnectionToastProps = {
  status: 'unstable' | 'restored'
  className?: string
}
```

- `unstable`
  - 제목: `연결 상태 불안정`
  - 설명: `연결 상태가 불안정합니다. 다시 시도해주세요.`
  - error compact toast
- `restored`
  - 제목: `연결 완료`
  - 설명: `정상적으로 연결되었습니다.`
  - success compact toast

toast는 자체 타이머를 만들지 않는다. 이후 연결 상태 orchestration이 렌더링 수명을 결정한다.

#### TranscriptionInterruptedDialog

```ts
export type TranscriptionInterruptedDialogProps = {
  open: boolean
  onClose: () => void
}
```

- 제목:
  - `전사가 일시 중단되었습니다.`
  - `연결 상태와 마이크 권한을 확인해 주세요.`
- 단일 `닫기` 버튼

#### MeetingParticipantsPopover

```ts
export type MeetingParticipantsPopoverProps = {
  open: boolean
  participants: MeetingParticipant[]
  onClose: () => void
}
```

- current user에는 `(you)`를 표시한다.
- host에는 `진행자` badge를 표시한다.
- 마이크가 켜진 current user에는 microphone 아이콘을 표시한다.
- 참가자 배열 순서를 그대로 유지한다.
- 바깥 영역 pointer down 및 Escape에서 `onClose`를 호출한다.

#### MeetingMoreMenu

```ts
export type MeetingMoreMenuProps = {
  open: boolean
  onEditTitle: () => void
  onClose: () => void
}
```

- 메뉴 항목은 `제목 수정하기` 한 개만 제공한다.
- 메뉴 선택 시 먼저 popover를 닫고 제목 수정 dialog를 연다.

#### MeetingTitleEditDialog

```ts
export type MeetingTitleEditDialogProps = {
  open: boolean
  currentTitle: string
  maxLength?: number
  onCancel: () => void
  onSubmit: (nextTitle: string) => void
}
```

- `maxLength` 기본값은 `50`이다.
- dialog를 열 때 input을 `currentTitle`로 초기화한다.
- dialog를 닫았다가 다시 열면 이전 draft가 아니라 최신 `currentTitle`을 사용한다.
- input에는 `maxLength={50}`을 적용한다.
- `제목 변경하기` 버튼 활성 조건:
  1. `draft.trim().length > 0`
  2. `draft.trim() !== currentTitle.trim()`
  3. `draft.length <= 50`
- 제출 값은 앞뒤 공백을 제거한 문자열이다.
- demo의 `onSubmit`은 `MeetingPage`의 회의 제목 상태를 갱신하고 dialog를 닫는다.
- demo에서는 성공/실패 toast를 표시하지 않는다.

#### MeetingTitleResultToast

```ts
export type MeetingTitleResultToastProps =
  | {
      result: 'success'
      nextTitle: string
      className?: string
    }
  | {
      result: 'failure'
      className?: string
    }
```

- 성공
  - 제목: `회의 기록 제목 변경 성공`
  - 설명: `'<nextTitle>' 으로 제목이 변경됐습니다.`
- 실패
  - 제목: `회의 기록 제목 변경 실패`
  - 설명: `오류가 발생했습니다. 다시 시도해 주세요.`

#### MeetingExitDialog

```ts
export type MeetingExitDialogProps = {
  open: boolean
  mode: 'leave' | 'end'
  onCancel: () => void
  onConfirm: () => void
}
```

- `leave`
  - 제목: `회의를 나가시겠어요?`
- `end`
  - 제목: `회의를 종료할까요?`
- 공통 설명:
  - `회의 내용은 프로젝트에 저장됩니다.`
  - `상세 회의 정리 기능은 추후 제공될 예정입니다.`
- 버튼: `취소`, `종료하기`

role 판별은 컴포넌트가 수행하지 않는다. 상위 orchestration이 `mode`를 결정한다.

#### MeetingSaveDialog

```ts
export type MeetingSaveDialogProps =
  | {
      open: boolean
      state: 'saving'
    }
  | {
      open: boolean
      state: 'success'
      projectTitle: string
      meetingTitle: string
      onClose: () => void
    }
  | {
      open: boolean
      state: 'failure'
      onRetry: () => void
    }
```

- `saving`
  - 제목: `회의 내용을 저장하고 있습니다.`
  - 진행 상태 문구: `...`
  - 사용자 닫기 동작 없음
- `success`
  - 제목: `회의가 종료되었습니다.`
  - 프로젝트명과 회의명을 요약 카드에 표시
  - `닫기` 버튼
- `failure`
  - 제목:
    - `회의 내용을 저장하지 못했습니다.`
    - `다시 시도해 주세요.`
  - `다시 시도하기` 버튼

## 7. MeetingHeader 변경 설계

기존 헤더는 feature를 직접 import하지 않고 popover slot을 받는다.

```ts
export type MeetingHeaderProps = {
  model: MeetingHeaderViewModel
  actions: MeetingHeaderActions
  participantsPopover?: ReactNode
  moreMenuPopover?: ReactNode
}
```

참여자 버튼과 더보기 버튼을 각각 `relative` wrapper로 감싼다.

```tsx
<div className="relative">
  <Button onClick={actions.onOpenParticipants}>...</Button>
  {participantsPopover}
</div>
```

```tsx
<div className="relative">
  <Button onClick={actions.onOpenMoreMenu}>...</Button>
  {moreMenuPopover}
</div>
```

이 구조로 `MeetingHeader`는 popover의 데이터와 동작을 알지 않고 위치 기준점만 제공한다.

## 8. demo 상태 흐름

### 8.1 참여자 확인

```text
none
  → 참여자 버튼
participants
  → 바깥 클릭 또는 Escape
none
```

### 8.2 제목 수정

```text
none
  → 더보기 버튼
moreMenu
  → 제목 수정하기
editTitle
  → 취소
none

editTitle
  → 유효한 제목 제출
MeetingPage.meetingTitle 갱신
  → dialog 닫기
none
```

제목 수정 성공·실패 toast는 이 demo 흐름에 포함하지 않는다.

### 8.3 회의 종료

```text
none
  → 회의 종료 버튼
confirmEnd
  → 취소
none

confirmEnd
  → 종료하기
saving
```

demo의 저장 중 dialog는 실제 네트워크 결과가 없으므로 자동으로 success/failure로 전환하지 않는다. 저장 완료·실패 컴포넌트는 이후 mutation 연동 시 사용한다.

## 9. 시각 규격

### 9.1 Overlay dialog

- overlay: `fixed inset-0`
- 배경: `rgba(0, 0, 0, 0.6)`
- z-index: popover와 toast보다 높은 modal layer
- 기본 surface:
  - 폭: `440px`
  - 최대 폭: `calc(100vw - 32px)`
  - padding: `32px`
  - border radius: `20px`
  - border: gray-300, 1px
  - background: gray-100/surface-default
  - shadow: `0 4px 12px rgba(0,0,0,0.08)`
- content gap: `32px`
- 제목: `typo-title-02`
- 설명: `typo-body-01`, fg-secondary
- 주요 버튼 높이: `52px`

제목 수정 dialog만 Figma에 맞춰 다음 차이를 둔다.

- 제목 중앙 정렬
- surface padding: 상하 `32px`, 좌우 `24px`
- 내부 content gap: `24px`
- input과 button group 사이 gap: `32px`

### 9.2 Toast

- 화면 상단 중앙 배치
- top: `20px`
- 연결 toast:
  - 폭: `380px`
  - 최대 폭: `calc(100vw - 32px)`
  - 아이콘: `48px`
  - title: Title02
  - description: Body02
- 제목 변경 toast:
  - 폭: `460px`
  - 최대 폭: `calc(100vw - 32px)`
  - 아이콘: `70px`
  - title: Title01
  - description: Body01
- error shadow: `0 8px 24px rgba(216,45,45,0.08)`
- success shadow: `0 8px 24px rgba(45,216,82,0.08)`

### 9.3 참여자 popover

- 폭: content 기준 약 `330px`
- anchor: 참여자 버튼 아래
- top offset: `8px`
- Figma 1024px 화면에서는 왼쪽 헤더 그룹 안에서 화면을 벗어나지 않도록 `left: 0`
- padding: `8px`
- radius: `16px`
- border: gray-300, 1px
- shadow: `0 4px 8px rgba(0,0,0,0.08)`
- row 높이: `42px`
- row 좌우 padding: `16px`
- 마지막 row를 제외하고 bottom border 표시

### 9.4 더보기 메뉴

- anchor: 더보기 버튼 아래
- top offset: `8px`
- 오른쪽 정렬: `right: 0`
- 화면 오른쪽 여백을 유지한다.
- padding: `8px`
- radius: `16px`
- row 높이: `42px`

## 10. 반응형 규칙

현재 회의 화면은 `min-width: 1024px`이므로 모바일 전용 레이아웃은 만들지 않는다.

이번 구현에서 지켜야 할 반응형 기준은 다음과 같다.

1. 1440px와 1024px 너비에서 popover가 viewport 밖으로 잘리지 않는다.
2. 참여자 popover는 참여자 버튼의 왼쪽을 기준으로 열린다.
3. 더보기 메뉴는 더보기 버튼의 오른쪽을 기준으로 열린다.
4. dialog는 화면 중앙에 고정한다.
5. viewport가 472px보다 작아도 dialog에 `16px` 좌우 여백이 남도록 `max-width`를 적용한다.
6. toast는 화면 중앙에 배치하고 16px 좌우 여백을 유지한다.

## 11. 접근성 및 상호작용

### 11.1 Dialog

`OverlayDialog`는 다음 동작을 제공한다.

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby`
- 설명이 있으면 `aria-describedby`
- 열릴 때 첫 번째 활성 control로 포커스 이동
- Tab/Shift+Tab 포커스 순환
- 닫힐 때 dialog를 연 control로 포커스 복귀
- 취소 가능한 dialog는 Escape로 닫기
- 저장 중 dialog는 Escape와 backdrop click으로 닫히지 않음

### 11.2 Popover

- trigger에 `aria-expanded`, `aria-controls` 제공
- menu는 `role="menu"`
- menu item은 `role="menuitem"`
- 참여자 목록은 `role="list"`와 `role="listitem"` 사용
- Escape 및 바깥 영역 클릭으로 닫기
- 닫힐 때 trigger에 포커스 복귀

### 11.3 Toast

- error: `aria-live="assertive"`
- success: `aria-live="polite"`
- toast는 포커스를 가져가지 않는다.

### 11.4 입력

- 제목 label과 input을 명시적으로 연결한다.
- 최대 50자 안내는 input 설명으로 연결한다.
- 버튼 활성 여부는 색상뿐 아니라 실제 `disabled` 속성으로 표현한다.
- Enter 제출을 지원한다.

## 12. 레이어 우선순위

```text
meeting content
  < popover
  < toast
  < modal overlay
```

권장 z-index:

- popover: `z-30`
- toast: 기존 `z-50`
- modal overlay: `z-60`

modal이 열릴 때 기존 popover는 먼저 닫는다. toast와 modal을 동시에 표시하는 상태는 현재 demo에서 만들지 않는다.

## 13. 기존 공통 컴포넌트 재사용과 변경

### 13.1 재사용

- `Button`
- `InputBox`
- `Badge`
- `Toast`
- 기존 `edit.svg`, `members.svg`, `more-vertical.svg`
- `cn`

### 13.2 확장

`Toast`는 Figma의 type별 shadow를 표현할 수 있도록 success/error surface shadow를 분리한다. public API는 변경하지 않는다.

### 13.3 신규 공통 UI

`OverlayDialog`를 추가한다. 기존 `Modal`의 API와 동작은 변경하지 않는다. `MeetingEntryModal` 등 기존 사용처에 회귀를 만들지 않기 위해 기존 `Modal`을 overlay 컴포넌트로 전환하지 않는다.

## 14. Figma asset 처리

Figma MCP가 반환하는 asset URL은 만료되므로 구현 시 URL을 코드에 직접 남기지 않는다.

다음 asset은 Figma에서 내려받아 저장소에 포함한다.

- 저장 완료 dialog의 clipboard 아이콘
- 참여자 popover의 microphone 아이콘
- demo 참여자 avatar 이미지

기존 저장소 아이콘과 glyph가 동일한 edit, members, more-vertical 아이콘은 기존 asset을 재사용한다.

모든 이미지에는 고정된 width/height를 지정한다. 장식용 아이콘은 빈 `alt`와 `aria-hidden="true"`를 사용한다.

## 15. 테스트 전략

현재 저장소에는 UI 테스트 환경이 없으므로 구현 작업에서 Vitest와 React Testing Library를 추가한다.

### 15.1 단위/컴포넌트 테스트

`validateMeetingTitle`

- 빈 문자열은 invalid
- 공백만 있는 문자열은 invalid
- 현재 제목과 trim 후 같으면 invalid
- 다른 1~50자 제목은 valid
- 51자 제목은 invalid

`MeetingTitleEditDialog`

- 열릴 때 current title을 표시
- 제목이 변경되지 않으면 제출 버튼 disabled
- 유효한 제목을 입력하면 제출 버튼 enabled
- 제출 시 trim된 제목으로 `onSubmit` 호출
- 취소 후 다시 열면 current title로 초기화

`MeetingParticipantsPopover`

- participant 순서와 이름/role 표시
- current user `(you)` 표시
- host badge 표시
- Escape에서 `onClose` 호출

`MeetingExitDialog`

- `leave`와 `end`의 제목 차이
- 취소/종료 callback 호출

`MeetingSaveDialog`

- saving 상태에는 버튼 없음
- success 상태에는 프로젝트명/회의명과 닫기 버튼 표시
- failure 상태에는 다시 시도하기 버튼 표시

`MeetingConnectionToast`와 `MeetingTitleResultToast`

- variant별 정확한 제목과 설명
- error/success live region 확인

### 15.2 MeetingPage 통합 테스트

- 참여자 버튼 → popover 표시 → Escape로 닫힘
- 더보기 → 제목 수정하기 → dialog 표시
- 유효한 제목 제출 → 헤더 제목 변경
- 회의 종료 → 종료 확인 dialog
- 종료하기 → 저장 중 dialog
- 연결/결과 컴포넌트가 기본 demo 화면에는 렌더링되지 않음

### 15.3 시각 확인

다음 viewport에서 Figma와 비교한다.

- `1440 × 1024`
- `1024 × 1024`
- dialog 최대 폭 확인용 `480 × 800`

확인 항목:

- dialog 크기, 여백, overlay 명도
- toast 너비와 상단 중앙 위치
- 참여자 popover anchor 위치
- 더보기 메뉴의 오른쪽 정렬
- 제목 수정 버튼 disabled/enabled 스타일
- 텍스트 줄바꿈과 Figma 문구 일치

## 16. 완료 조건

1. 제공된 1~8번 UI가 각각 독립 컴포넌트 또는 명시된 variant로 구현되어 있다.
2. `/meetings/demo/live`에 별도 preview UI나 query parameter가 추가되지 않는다.
3. 참여자, 제목 수정, 진행자 종료, 저장 중 흐름은 기존 회의 화면에서 확인할 수 있다.
4. 연결, 일반 참가자 이탈, 제목 결과, 저장 결과 UI는 export되지만 demo에 노출되지 않는다.
5. 제목 변경 버튼이 빈 값, 동일 값, 50자 초과에서 비활성화된다.
6. 모든 dialog가 포커스 트랩, Escape 정책, 포커스 복귀를 지킨다.
7. 1440px와 1024px에서 popover가 화면 밖으로 잘리지 않는다.
8. Figma 임시 asset URL이 소스에 남지 않는다.
9. lint, typecheck, test, build가 모두 통과한다.
10. 기존 회의 전사/AI Chat 동작과 기존 `MeetingEntryModal`에 회귀가 없다.
