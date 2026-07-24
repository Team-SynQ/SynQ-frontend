# AI Chat 표시 크기 전환 UI 설계

## 1. 문서 목적

이 문서는 SynQ 회의 진행 화면의 AI Chat을 다음 세 가지 표시 상태로 전환하기 위한 구현 기준을 정의한다.

1. 전사 영역 오른쪽에 고정된 `docked`
2. 전사 영역 위에 떠 있는 `floating`
3. 우측 하단의 원형 진입 버튼만 남는 `launcher`

이번 작업은 UI와 로컬 demo 상태 전환을 구현하는 범위다. 메시지, 추천 질문, 입력값은 현재 `MeetingPage`의 샘플 데이터를 계속 사용한다. 이후 API 또는 WebSocket을 연결할 때에는 샘플 데이터만 실제 데이터로 교체하고, 이 문서에서 정의한 표시 상태와 레이아웃 코드는 유지할 수 있어야 한다.

## 2. 확정 사항

- AI Chat 표시 상태는 `MeetingPage`가 소유한다.
- 초기 표시 상태는 `docked`다.
- `docked`의 축소 버튼은 `floating`으로 전환한다.
- `floating`의 확장 버튼은 `docked`로 전환한다.
- docked와 floating의 가로선 아이콘을 클릭하면 `launcher`로 전환한다.
- `launcher`를 클릭하면 launcher 진입 직전 상태로 복귀한다.
- docked에서 launcher로 진입했다면 docked로, floating에서 진입했다면 floating으로 복귀한다.
- `launcher` 컴포넌트와 렌더링 분기, 직전 상태 복귀 동작, 단위 테스트를 범위에 포함한다.
- 표시 상태는 URL 또는 localStorage에 저장하지 않는다.
- Figma에 motion 규격이 없으므로 상태 변경은 별도 morph 애니메이션 없이 즉시 반영한다.
- Git push와 Pull Request 생성은 구현 범위에 포함하지 않는다.

## 3. 현재 코드 기준선

### 3.1 현재 조립 구조

```text
MeetingPage
  -> MeetingRoom
    -> MeetingContentLayout
      -> TranscriptPanel
      -> AiChatPanel
        -> AiChatMessageList
        -> AiChatComposer
```

현재 관련 파일:

- `src/pages/MeetingPage.tsx`
  - 회의 demo 데이터와 로컬 상태를 소유한다.
  - `onMinimize`는 실제 상태 변경 없이 스크린 리더용 안내 문구만 갱신한다.
- `src/widgets/meeting-room/ui/MeetingRoom.tsx`
  - 회의 헤더와 콘텐츠 레이아웃을 조립한다.
- `src/widgets/meeting-room/ui/MeetingContentLayout.tsx`
  - `minmax(524px, 1fr) 500px` 2열 grid를 고정으로 사용한다.
- `src/features/meeting-ai-chat/ui/AiChatPanel.tsx`
  - docked 형태만 렌더링한다.
- `src/features/meeting-ai-chat/model/aiChat.types.ts`
  - 메시지, 추천 질문, 입력 및 전송 액션 타입을 정의한다.
  - 표시 액션인 `onMinimize`가 메시지 액션과 섞여 있다.

### 3.2 재사용할 기존 자산과 토큰

- `src/shared/assets/icons/minimize.svg`
- `src/shared/assets/icons/send.svg`
- `src/shared/styles/tokens.css`
- `src/shared/config/theme/tokens.ts`
- `radius.m = 12px`
- `spacing.m = 24px`
- `gray.800 = #242424`
- `line.default = gray.300`
- `stroke.md = 1px`

## 4. Figma 기준

| 목적 | Figma node | 구현 매핑 |
| --- | --- | --- |
| 현재 docked 전체 화면 | `603:2045` | `MeetingContentLayout`의 docked 분기 |
| docked 축소 버튼 | `673:4376` | 기존 `minimize.svg`와 축소 callback |
| floating 전체 화면 | `971:4903` | 전체 폭 전사와 floating panel |
| floating AI Chat | `971:4946` | `AiChatPanel variant="floating"` |
| 1024~1439 반응형 | `603:2498` | 고정 400px floating panel과 전체 폭 전사 |
| launcher 전체 화면 | `971:5087` | 전체 폭 전사와 launcher |
| launcher | `971:5129` | `AiChatLauncher` |
| launcher 브랜드 심볼 | `971:5131` | `synq-symbol-inverse.svg` |

Figma에서 확인한 launcher 내부 규격:

- 외부 클릭 영역: `100px × 100px`
- 내부 원형 surface: `80px × 80px`
- 내부 원형 fill: `gray-800`
- 심볼: 약 `26.7px × 46px`
- 원형 shadow: `0 0 25px rgb(0 0 0 / 15%)`

## 5. 범위

### 5.1 포함 범위

- `docked`, `floating`, `launcher` 표시 상태 타입
- `MeetingPage`의 demo 표시 상태
- docked에서 floating으로 축소
- floating에서 docked로 확장
- launcher에서 floating으로 열기
- floating 및 launcher 상태에서 전사 영역 전체 폭 확장
- floating panel의 Figma 크기, 위치, radius, shadow
- 낮은 viewport 높이에 대한 floating 최대 높이 제한
- launcher UI와 브랜드 심볼 자산
- maximize 아이콘 자산
- 상태별 접근성 이름과 포커스 복구
- 컴포넌트, 레이아웃, 페이지 통합 테스트
- CSS 및 TypeScript shadow token 동기화

### 5.2 제외 범위

- floating에서 launcher로 전환하는 실제 버튼 또는 제스처
- 드래그를 통한 floating panel 이동
- 사용자의 직접 panel 크기 조절
- 상태 전환 motion
- 표시 상태의 localStorage 저장
- 표시 상태의 query parameter
- 모바일 레이아웃
- AI Chat API, streaming, WebSocket 연결
- AI 응답 loading/error UI 변경
- 기존 디자인 토큰의 전면 정리

## 6. 상태 모델

### 6.1 타입

`src/features/meeting-ai-chat/model/aiChat.types.ts`에 다음 타입을 추가한다.

```ts
export type AiChatDisplayMode =
  | 'docked'
  | 'floating'
  | 'launcher'
```

이 타입은 AI 응답이나 server state가 아니라 클라이언트 표시 상태다.

### 6.2 전환표

| 현재 상태 | 사용자 액션 | 다음 상태 | 이번 demo 연결 |
| --- | --- | --- | --- |
| `docked` | 헤더 축소 버튼 클릭 | `floating` | 연결 |
| `floating` | 헤더 확장 버튼 클릭 | `docked` | 연결 |
| `docked` | 가로선 아이콘 클릭 | `launcher` | 연결 |
| `floating` | 가로선 아이콘 클릭 | `launcher` | 연결 |
| `launcher` | launcher 클릭 | 진입 직전 `docked` 또는 `floating` | 연결 |

초기 상태:

```ts
const [aiChatDisplayMode, setAiChatDisplayMode] =
  useState<AiChatDisplayMode>('docked')
```

### 6.3 미확정 트리거 처리

`docked -> launcher`와 `floating -> launcher` 전환은 각 panel header의 가로선 아이콘 버튼으로 노출한다.

다음 임시 수단을 만들지 않는다.

- 숨겨진 버튼
- 개발용 상태 선택기
- query parameter
- 키보드 단축키
- 일정 시간 후 자동 축소

후속 디자인에서 트리거가 확정되면 해당 이벤트에서 다음 상태 변경만 호출한다.

```ts
setAiChatDisplayMode('launcher')
```

`launcher` 렌더링과 동작은 `MeetingContentLayout` 단위 테스트에서 독립적으로 검증한다.

## 7. 아키텍처

### 7.1 책임 분리

#### `MeetingPage`

- `aiChatDisplayMode`를 소유한다.
- demo용 상태 전환 callback을 만든다.
- 기존 메시지, 추천 질문, draft, `isSending` 상태를 계속 소유한다.
- 표시 상태를 AI 데이터 상태와 합치지 않는다.

#### `MeetingRoom`

- `aiChat` 콘텐츠 props와 `aiChatDisplay` props를 `MeetingContentLayout`에 전달한다.
- 표시 상태를 해석하거나 변경하지 않는다.

#### `MeetingContentLayout`

- 표시 상태에 따른 grid 및 overlay 배치를 결정한다.
- `docked`와 `floating`에 필요한 `AiChatPanel` variant props를 조립한다.
- `launcher` 상태에서 `AiChatLauncher`를 렌더링한다.
- 상태를 소유하지 않고 `onModeChange` callback만 호출한다.
- 표시 상태가 바뀔 때 포커스를 적절한 제어 버튼으로 이동한다.

#### `AiChatPanel`

- `docked`와 `floating` 두 variant를 지원한다.
- 기존 `AiChatMessageList`와 `AiChatComposer`를 재사용한다.
- variant에 따라 header 아이콘, 접근성 이름, 외곽 스타일을 바꾼다.
- 메시지나 표시 상태를 소유하지 않는다.

#### `AiChatLauncher`

- launcher 버튼의 시각 표현과 `onOpen` 호출만 담당한다.
- 메시지, draft, 추천 질문을 전달받지 않는다.

### 7.2 의존성 방향

```text
pages
  -> widgets/meeting-room
    -> features/meeting-ai-chat
      -> shared
```

`features/meeting-ai-chat`는 `MeetingPage`나 `MeetingContentLayout`을 import하지 않는다.

## 8. Public 타입과 Props

### 8.1 콘텐츠 액션 분리

기존 `AiChatActions.onMinimize`를 제거한다.

```ts
export type AiChatActions = {
  onDraftChange: (value: string) => void
  onSend: () => void
  onSelectSuggestion: (suggestionId: string) => void
}
```

표시 액션은 메시지 액션에 포함하지 않는다.

### 8.2 콘텐츠 props

```ts
export type AiChatContentProps = {
  model: AiChatViewModel
  actions: AiChatActions
}
```

### 8.3 Panel props

잘못된 callback 조합을 컴파일 단계에서 막기 위해 discriminated union을 사용한다.

```ts
export type AiChatPanelProps =
  & AiChatContentProps
  & (
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
```

`variant="docked"`에 `onMaximize`를 전달하거나 `variant="floating"`에 `onMinimize`를 전달하는 사용법은 허용하지 않는다.

### 8.4 Launcher props

```ts
export type AiChatLauncherProps = {
  onOpen: () => void
  buttonRef?: Ref<HTMLButtonElement>
}
```

### 8.5 Meeting layout props

```ts
export type MeetingAiChatDisplayProps = {
  mode: AiChatDisplayMode
  onModeChange: (mode: AiChatDisplayMode) => void
}

export type MeetingContentLayoutProps = {
  transcript: TranscriptPanelProps
  aiChat: AiChatContentProps
  aiChatDisplay: MeetingAiChatDisplayProps
}
```

`MeetingRoomProps`도 같은 `aiChat`과 `aiChatDisplay` 구조를 사용한다.

## 9. 레이아웃 설계

### 9.1 공통 container

`MeetingContentLayout` root는 모든 상태에서 회의 콘텐츠 영역 전체를 차지한다.

```text
position: relative
min-height: 0
overflow: hidden
```

디버깅과 테스트를 위해 root에 현재 상태를 표현한다.

```tsx
data-ai-chat-mode={aiChatDisplay.mode}
```

### 9.2 Docked

Figma node `603:2045`를 기준으로 한다.

```css
grid-template-columns: minmax(524px, 1fr) 500px;
```

- 전사 영역은 첫 번째 열을 사용한다.
- AI Chat wrapper는 두 번째 열을 사용한다.
- panel은 wrapper의 전체 너비와 높이를 사용한다.
- header 높이는 `60px`다.
- panel 외곽 radius와 shadow는 없다.
- 기존 `minimize.svg`를 사용한다.

축소 버튼:

```text
aria-label: AI Chat 창 축소
action: onModeChange('floating')
```

### 9.3 Floating

Figma nodes `971:4903`, `971:4946`, `603:2498`을 기준으로 한다.

전사 영역:

```css
grid-template-columns: minmax(0, 1fr);
```

floating wrapper:

```text
position: absolute
right: 24px
bottom: 24px
z-index: 20
width: 400px
height: min(618px, calc(100% - 48px))
border-radius: 12px
box-shadow: var(--shadow-ai-chat-floating)
```

panel:

- wrapper의 전체 크기를 사용한다.
- overflow를 숨겨 radius 밖으로 header/body/footer가 나오지 않게 한다.
- header 높이는 `60px`다.
- body는 남은 높이를 사용하며 세로 scroll을 허용한다.
- body padding은 가로 `24px`, 세로 `28px`다.
- composer padding은 `24px`다.
- assistant 메시지 최대 폭은 `300px`다.
- 추천 질문과 입력 컴포넌트는 기존 기능을 유지한다.

확장 버튼:

```text
aria-label: AI Chat 창 확장
asset: maximize.svg
action: onModeChange('docked')
```

### 9.4 Launcher

Figma nodes `971:5087`, `971:5129`, `971:5131`을 기준으로 한다.

전사 영역은 floating과 동일하게 전체 폭을 사용한다.

launcher wrapper:

```text
position: absolute
right: 24px
bottom: 24px
z-index: 20
width: 100px
height: 100px
```

button surface:

```text
width: 80px
height: 80px
background: gray-800
border-radius: full
box-shadow: var(--shadow-ai-chat-launcher)
```

100px wrapper 가운데에 80px 원형 button을 배치한다. 클릭 가능 영역은 100px 전체로 유지하되 시각 surface만 80px로 표현한다.

launcher 버튼:

```text
aria-label: AI Chat 열기
action: onModeChange('floating')
```

심볼 이미지는 장식 요소이므로 `alt=""`, `aria-hidden="true"`를 사용한다.

## 10. 동일 Panel 유지와 데이터 보존

`docked`와 `floating`은 서로 다른 Panel 컴포넌트를 만들지 않는다.

`MeetingContentLayout`은 `mode !== 'launcher'`일 때 하나의 wrapper와 하나의 `AiChatPanel`을 렌더링하고, mode에 따라 wrapper 배치와 panel variant만 변경한다. 별도 `key`를 부여하지 않는다.

이 방식으로 `docked <-> floating` 전환 시 다음 상태를 불필요하게 초기화하지 않는다.

- 입력 focus
- message list DOM
- 내부 scroll 위치
- composer DOM

`launcher`에서는 panel을 접근성 트리와 DOM에서 제거한다. 메시지, draft, 추천 질문은 `MeetingPage`가 소유하므로 launcher에서 다시 열어도 데이터는 유지된다.

## 11. 반응형 규칙

### 11.1 가로

현재 `MeetingRoom`의 최소 너비 `1024px` 정책을 유지한다.

| viewport width | docked | floating | launcher |
| --- | --- | --- | --- |
| `1440px 이상` | 우측 500px | 400px, 우측 24px | 100px wrapper, 우측 24px |
| `1024~1439px` | 우측 500px | 400px, 우측 24px | 100px wrapper, 우측 24px |
| `1024px 미만` | 기존 min-width 정책으로 가로 scroll | 별도 모바일 대응 없음 | 별도 모바일 대응 없음 |

floating과 launcher는 viewport 너비에 따라 축소하지 않는다.

### 11.2 세로

Figma 기준 화면 높이에서는 floating 높이 `618px`을 사용한다.

낮은 viewport에서는 회의 header를 침범하지 않도록 다음 값을 사용한다.

```css
height: min(618px, calc(100% - 48px));
```

- 콘텐츠 영역 높이가 충분하면 `618px`
- 부족하면 상하 `24px` 여백을 뺀 높이
- header와 composer 높이는 유지
- 줄어드는 영역은 message list

## 12. 디자인 토큰

### 12.1 CSS token

`src/shared/styles/tokens.css`의 `@theme`에 추가한다.

```css
--shadow-ai-chat-floating: 0 0 12.5px rgb(0 0 0 / 0.15);
--shadow-ai-chat-launcher: 0 0 25px rgb(0 0 0 / 0.15);
```

필요한 Tailwind utility를 같은 파일에 추가한다.

```css
@utility shadow-ai-chat-floating {
  box-shadow: var(--shadow-ai-chat-floating);
}

@utility shadow-ai-chat-launcher {
  box-shadow: var(--shadow-ai-chat-launcher);
}
```

### 12.2 TypeScript token

`src/shared/config/theme/tokens.ts`의 `shadow`에 동일한 값을 추가한다.

```ts
export const shadow = {
  panel: '12px 0 16px rgb(0 0 0 / 0.02)',
  floating: '0 4px 24px rgb(0 0 0 / 0.08)',
  toast: '8px 8px 24px rgb(0 0 0 / 0.08)',
  aiChatFloating: '0 0 12.5px rgb(0 0 0 / 0.15)',
  aiChatLauncher: '0 0 25px rgb(0 0 0 / 0.15)',
} as const
```

기존 CSS와 TypeScript 토큰 사이의 다른 차이는 이번 작업에서 수정하지 않는다.

### 12.3 Stroke 매핑

Figma export의 panel border는 `0.7px`로 노출되지만, 현재 회의 화면은 이를 공통 `stroke.md = 1px`로 매핑하고 있다.

이번 기능도 기존 회의 화면과의 일관성을 위해 다음 토큰을 사용한다.

```text
border-stroke-md
border-line-default
```

별도의 `0.7px` 토큰은 추가하지 않는다.

## 13. Asset 설계

### 13.1 배치

```text
src/shared/assets/
├─ icons/
│  ├─ minimize.svg
│  └─ maximize.svg
└─ logos/
   ├─ synq-logo.svg
   ├─ synq-logo-inverse.svg
   └─ synq-symbol-inverse.svg
```

### 13.2 규칙

- `minimize.svg`는 기존 파일을 재사용한다.
- `maximize.svg`는 Figma floating header의 `Ic/maximize-24`에서 추출한 실제 vector asset을 사용한다.
- `synq-symbol-inverse.svg`는 Figma node `971:5131`에서 추출한다.
- Figma MCP의 만료되는 원격 URL을 코드에 남기지 않는다.
- launcher 전체를 PNG로 저장하지 않는다.
- launcher 원형 surface와 shadow는 CSS와 token으로 구현한다.
- SVG path를 사람이 새로 그리거나 유사 아이콘으로 대체하지 않는다.

## 14. 레이어 우선순위

기존 회의 modal 설계의 레이어 정책을 유지한다.

```text
meeting content
  < floating AI Chat / launcher: z-20
  < popover: z-30
  < toast: z-50
  < modal overlay: z-60
```

floating AI Chat과 launcher는 popover, toast, modal을 가리지 않는다.

## 15. 접근성 및 포커스

### 15.1 접근성 이름

| 상태 | control | 접근성 이름 |
| --- | --- | --- |
| `docked` | 축소 icon button | `AI Chat 창 축소` |
| `floating` | 확장 icon button | `AI Chat 창 확장` |
| `launcher` | 원형 launcher button | `AI Chat 열기` |

icon과 logo 이미지는 장식 요소로 처리한다.

```tsx
alt=""
aria-hidden="true"
```

### 15.2 Panel semantic

- `AiChatPanel`은 기존 `<aside>`를 유지한다.
- heading과 `aria-labelledby` 연결을 유지한다.
- 상태와 관계없이 panel 제목은 `AI Chat`이다.
- launcher 상태에서는 panel을 DOM과 접근성 트리에서 제거한다.

### 15.3 포커스

- `docked -> floating`: 동일한 header action button DOM을 유지해 focus를 보존한다.
- `floating -> docked`: 동일한 header action button DOM을 유지해 focus를 보존한다.
- `launcher -> floating`: 새로 렌더링된 floating header의 확장 버튼으로 focus를 이동한다.
- 후속 `floating -> launcher`: mode가 외부에서 launcher로 바뀌면 launcher button으로 focus를 이동할 수 있도록 ref를 준비한다.

`MeetingContentLayout`은 이전 mode를 ref로 기억하고 `actionButtonRef`, `buttonRef`를 사용해 mode 변경 후 focus를 조정한다.

### 15.4 키보드

- 모든 전환은 native `button`으로 실행한다.
- Enter와 Space 기본 동작을 유지한다.
- floating은 modal이 아니므로 focus trap과 Escape dismiss를 추가하지 않는다.

## 16. Demo 통합

`MeetingPage`의 기존 AI Chat demo 데이터를 그대로 사용한다.

```text
initialMessages
suggestions
draft
isSending
```

추가되는 demo 상태:

```ts
const [aiChatDisplayMode, setAiChatDisplayMode] =
  useState<AiChatDisplayMode>('docked')
```

`MeetingRoom` 전달 구조:

```tsx
<MeetingRoom
  aiChat={{
    model: {
      draft,
      isSending: false,
      messages,
      suggestions,
    },
    actions: {
      onDraftChange: setDraft,
      onSelectSuggestion,
      onSend: sendMessage,
    },
  }}
  aiChatDisplay={{
    mode: aiChatDisplayMode,
    onModeChange: setAiChatDisplayMode,
  }}
  header={...}
  transcript={...}
/>
```

기존 `lastAction` 접근성 안내는 전환 결과를 설명하도록 갱신할 수 있지만, 상태의 source of truth로 사용하지 않는다.

참가자 popover, 더보기 메뉴, 제목 수정 dialog, 회의 종료 및 저장 dialog가 열리거나 닫혀도 `aiChatDisplayMode`는 변경하지 않는다. AI Chat 표시 상태와 기존 회의 control 상태는 서로 독립적으로 유지한다.

## 17. 향후 실제 기능 연결

표시 상태와 AI 데이터 상태를 분리하므로 다음 실제 기능을 독립적으로 연결할 수 있다.

- React Query로 이전 AI Chat 기록 조회
- mutation 또는 streaming을 통한 질문 전송
- WebSocket/SSE 응답 추가
- `isSending` 실제 상태
- AI 요청 실패 표시

실제 기능 연결 시 제거하거나 교체할 샘플 영역:

- `initialMessages`
- `suggestions`
- `isSending: false`
- 로컬 `sendMessage`의 샘플 메시지 추가 로직

유지할 영역:

- `AiChatDisplayMode`
- `aiChatDisplayMode`
- `MeetingContentLayout`의 상태별 배치
- `AiChatPanel` variant
- `AiChatLauncher`
- 표시 상태 접근성과 테스트

## 18. 파일 변경 계획

### 18.1 신규 파일

```text
src/shared/assets/icons/maximize.svg
src/shared/assets/logos/synq-symbol-inverse.svg
src/features/meeting-ai-chat/ui/AiChatLauncher.tsx
src/features/meeting-ai-chat/ui/AiChatLauncher.test.tsx
src/features/meeting-ai-chat/ui/AiChatPanel.test.tsx
src/widgets/meeting-room/ui/MeetingContentLayout.test.tsx
```

### 18.2 수정 파일

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

`AiChatComposer.tsx`는 기존 콘텐츠 동작을 유지한다. 타입 이름 변경에 따른 import 수정이 필요한 경우에만 변경한다.

## 19. 테스트 전략

### 19.1 `AiChatPanel.test.tsx`

- docked에서 `AI Chat 창 축소` 버튼을 찾을 수 있다.
- docked 축소 버튼 클릭 시 `onMinimize`를 한 번 호출한다.
- floating에서 `AI Chat 창 확장` 버튼을 찾을 수 있다.
- floating 확장 버튼 클릭 시 `onMaximize`를 한 번 호출한다.
- docked와 floating 모두 기존 메시지를 표시한다.
- docked와 floating 모두 추천 질문과 입력을 표시한다.
- variant에 맞지 않는 반대 action button을 표시하지 않는다.

### 19.2 `AiChatLauncher.test.tsx`

- `AI Chat 열기` 버튼을 찾을 수 있다.
- 버튼 클릭 시 `onOpen`을 한 번 호출한다.
- 브랜드 심볼은 접근성 이름을 중복 생성하지 않는다.

### 19.3 `MeetingContentLayout.test.tsx`

- `docked` root에 `data-ai-chat-mode="docked"`가 설정된다.
- docked에서 전사와 inline AI Chat을 렌더링한다.
- 축소 버튼 클릭 시 `onModeChange('floating')`을 호출한다.
- floating에서 전사와 floating AI Chat을 렌더링한다.
- 확장 버튼 클릭 시 `onModeChange('docked')`를 호출한다.
- launcher에서 AI Chat panel을 렌더링하지 않는다.
- launcher에서 `AI Chat 열기` 버튼을 렌더링한다.
- launcher 클릭 시 진입 직전 non-launcher mode로 복귀한다.
- docked와 floating의 가로선 버튼은 `onModeChange('launcher')`를 호출한다.
- docked와 floating 전환 시 header action button focus가 유지된다.
- launcher 클릭 후 floating header의 확장 버튼으로 focus가 이동한다.
- 외부에서 mode가 launcher로 변경되면 launcher button으로 focus가 이동한다.

jsdom은 실제 레이아웃 치수를 계산하지 않으므로, px 치수 자체를 DOM 단위 테스트의 주된 assertion으로 사용하지 않는다. 치수는 class와 시각 검증으로 확인한다.

### 19.4 `MeetingPage.test.tsx`

- 초기 상태는 docked다.
- 축소 버튼을 누르면 floating으로 전환된다.
- floating 확장 버튼을 누르면 docked로 돌아간다.
- 전환 전에 입력한 draft가 전환 후에도 유지된다.
- 기존 참가자 popover 동작이 유지된다.
- 기존 제목 수정 흐름이 유지된다.
- 기존 회의 종료 및 saving dialog 흐름이 유지된다.
- 기존 popover와 dialog를 열고 닫아도 현재 AI Chat 표시 상태가 유지된다.

`MeetingPage` demo에서 docked와 floating 양쪽 launcher 진입 및 직전 상태 복귀를 통합 테스트한다.

### 19.5 시각 검증

다음 viewport에서 `/meetings/demo/live`를 확인한다.

| viewport | 확인 사항 |
| --- | --- |
| `1440 × 1024` | Figma 1440 docked/floating 기준 |
| `1024 × 1024` | Figma 1024~1439 floating 기준 |
| `1280 × 800` | floating 고정 폭과 세로 배치 |
| `1024 × 720` | floating 최대 높이와 header 비침범 |

각 viewport에서 확인할 항목:

- docked의 우측 500px
- floating의 우측·하단 24px
- floating의 400px 폭
- 충분한 높이에서 618px 높이
- 낮은 화면에서 상하 24px 보존
- floating 및 launcher에서 전사 영역 전체 폭
- panel radius와 shadow
- launcher 100px 클릭 영역과 80px surface
- popover와 modal이 AI Chat보다 위에 표시됨

### 19.6 저장소 검증

```bash
pnpm test
pnpm lint
pnpm build
```

## 20. 구현 순서

1. 현재 테스트 기준선을 실행한다.
2. `AiChatActions`에서 표시 액션을 분리하는 실패 테스트를 작성한다.
3. `AiChatPanel` docked/floating variant 테스트를 작성한다.
4. Figma에서 maximize와 SynQ symbol asset을 추출해 `shared/assets`에 저장한다.
5. shadow token을 CSS와 TypeScript에 추가한다.
6. `AiChatLauncher` 테스트와 컴포넌트를 구현한다.
7. `MeetingContentLayout` 상태별 실패 테스트를 작성한다.
8. 상태별 grid, floating overlay, launcher 배치를 구현한다.
9. `MeetingRoom` props 전달 구조를 변경한다.
10. `MeetingPage`에 docked/floating demo 전환을 연결한다.
11. `MeetingPage` 통합 테스트를 확장한다.
12. 지정 viewport에서 시각 검증한다.
13. 전체 test, lint, build를 실행한다.

## 21. 완료 조건

- `AiChatDisplayMode`가 세 상태를 명시한다.
- `MeetingPage`의 초기 상태는 `docked`다.
- docked 축소 버튼으로 floating 전환이 가능하다.
- floating 확장 버튼으로 docked 복귀가 가능하다.
- launcher UI가 독립적으로 렌더링된다.
- docked와 floating에서 가로선 아이콘으로 launcher 전환이 가능하다.
- launcher 클릭 시 진입 직전 docked 또는 floating 상태로 복귀한다.
- floating과 launcher에서 전사 영역이 전체 폭을 사용한다.
- Figma의 floating 및 launcher 규격을 반영한다.
- 공통 브랜드 자산과 아이콘이 `shared/assets`에 배치된다.
- 만료되는 Figma asset URL이 코드에 남지 않는다.
- 신규 shadow 값이 CSS와 TypeScript token에 동일하게 존재한다.
- 메시지, 추천 질문, draft 데이터가 표시 상태와 분리된다.
- docked와 floating 전환 중 콘텐츠 상태가 유지된다.
- 기존 회의 popover와 dialog가 AI Chat 표시 상태를 변경하지 않는다.
- 접근성 이름과 포커스 이동이 동작한다.
- 기존 회의 controls 테스트에 회귀가 없다.
- 신규 및 기존 테스트가 통과한다.
- lint와 production build가 통과한다.
