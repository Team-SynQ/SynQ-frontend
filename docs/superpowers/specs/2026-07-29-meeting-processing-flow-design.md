# 회의 종료 후 정리 및 회의 기록 연결 설계

## 1. 목적

회의 종료 직후 새 회의가 프로젝트 메인 화면의 최신 회의 요약과 회의 기록에 즉시 완성된 상태로 나타나는 현재 Mock 흐름을, 실제 서비스의 비동기 회의 정리 과정을 모사하는 단계적 흐름으로 변경한다.

이번 설계가 구현하는 사용자 흐름은 다음과 같다.

1. 사용자가 회의를 종료하고 저장 성공 다이얼로그를 닫는다.
2. 프로젝트 메인 화면으로 복귀하면서 2초 동안 전체 화면 `회의 불러오는 중` 오버레이를 표시한다.
3. 오버레이가 사라지면 새 회의가 최신 회의 요약에 표시되고, 회의 기록의 새 행에는 2초 동안 처리 중 스피너를 표시한다.
4. 회의 기록 정리가 끝나면 새 행의 스피너를 초록색 완료 체크로 바꾼다.
5. 사용자가 프로젝트 화면을 처음 클릭하면 완료 체크를 제거하고 일반 회의 기록 행으로 전환한다.
6. 최신 회의 요약의 `자세히 보기` 또는 회의 기록 행을 누르면 구현된 회의 기록 상세 화면으로 이동한다.
7. 실제 회의 기록 API가 연결되기 전까지 모든 record ID는 동일한 Mock 상세 데이터를 표시한다.

## 2. 범위

### 포함

- 회의 종료 후 프로젝트 메인 화면 복귀 시 처리 상태 전달
- 전체 화면 회의 정리 오버레이
- 새 회의 기록 행의 처리 중 스피너와 완료 체크
- 완료 체크의 첫 화면 클릭 dismiss 동작
- 최신 회의 요약과 회의 기록 행의 상세 화면 라우팅
- URL의 `meetingRecordId`를 읽는 회의 상세 화면
- 모든 회의 기록에 동일한 Mock 상세 데이터 반환
- 타이머, 상태 전이, 라우팅, 클릭 분리에 대한 테스트

### 제외

- 실제 백엔드 회의 정리 작업 상태 조회
- 새로고침 후 처리 애니메이션 복구
- 회의별로 서로 다른 상세 데이터 생성
- 회의 기록 점 3개 메뉴의 실제 기능
- 회의 상세 화면 내부의 전사, AI 채팅, 탭 콘텐츠 재설계
- 프로젝트 또는 회의 데이터의 영속 저장

## 3. 현재 구조

현재 회의 종료 흐름은 다음과 같다.

- `MeetingPage`에서 `meetingApi.completeMeeting()`을 호출한다.
- `liveMeetingMockDb.addCompletedMeeting()`이 완성된 `CompletedMeetingSummary`를 Mock DB에 즉시 추가한다.
- 사용자가 저장 성공 다이얼로그를 닫으면 `/projects`로 이동한다.
- `ProjectMainboardPage`가 `meetingApi.listCompletedMeetings(projectId)`를 호출한다.
- 새 회의가 즉시 `meetings[0]`이 되며 최신 요약과 회의 기록에 동시에 완성 상태로 표시된다.

현재 라우팅에는 두 개의 회의 기록 관련 경로가 있다.

- `/meetings/:meetingRecordId/summary`: 준비 중 placeholder 화면
- `/meetings/:meetingRecordId/detail`: 구현된 Mock 회의 기록 상세 화면

최신 회의 요약의 `자세히 보기`는 현재 placeholder 경로로 이동한다. 회의 기록 행에는 상세 이동 동작이 없다. `MeetingDetailPage`는 URL 파라미터를 읽지 않고 항상 `fetchMeetingDetail('meeting-1')`을 호출한다.

## 4. Figma 기준

다음 Figma 노드를 구현 기준으로 사용한다.

| 상태 | Figma 노드 |
| --- | --- |
| Mock 회의 기록 상세 화면 | `1887:21864` |
| 프로젝트 전체 화면 회의 로딩 오버레이 | `1168:11019` |
| 새 회의 기록 행 처리 중 스피너 | `1958:18700` |
| 새 회의 기록 행 완료 체크 목록 | `1958:18982` |
| 새 회의 기록 행 완료 체크 | `1958:18993` |
| 일반 회의 기록 목록 | `1958:17904` |
| 최신 회의 요약 `자세히 보기` | `1965:19546` |
| 일반 회의 기록 행 hover | `1958:17949` |

## 5. 구현 접근법 결정

### 선택: navigation state 기반 페이지 UI 상태 머신

회의 완료 데이터는 기존처럼 Mock DB에 즉시 저장하되, 회의 종료 화면에서 프로젝트 화면으로 이동할 때 새 record ID를 navigation state로 전달한다. 프로젝트 페이지는 이 ID에 대해서만 일시적인 표시 상태를 적용한다.

이 방식을 선택한 이유는 다음과 같다.

- 현재 Mock API contract에 실제 백엔드에서 확정되지 않은 `PROCESSING` 상태를 추가하지 않는다.
- 회의 데이터 저장 로직과 표현용 타이머를 분리한다.
- 기존 Mock DB와 목록 조회 로직을 그대로 유지한다.
- 실제 API 연결 시 상태 머신의 입력을 서버 작업 상태로 교체할 수 있다.
- 새로고침 후 애니메이션을 복원할 필요가 없는 현재 요구사항에 가장 작은 변경으로 대응한다.

### 선택하지 않은 방식

#### Mock API에 처리 상태 추가

실제 비동기 작업과 유사하지만 아직 확정되지 않은 서버 contract를 프론트 Mock이 선점하게 된다. 단순 표현 타이머를 위해 entity와 API 범위를 확대하므로 사용하지 않는다.

#### Context 또는 sessionStorage에 처리 상태 저장

새로고침 후에도 상태를 복원할 수 있지만, 임시 UI를 위해 전역 상태와 만료 정책이 필요하다. 이번 요구사항에는 필요하지 않다.

## 6. 상태 모델

```ts
export type MeetingProcessingPhase =
  | 'idle'
  | 'summaryProcessing'
  | 'historyProcessing'
  | 'completionVisible'
  | 'settled'
```

| 상태 | 전체 오버레이 | 최신 회의 요약 | 새 회의 기록 행 |
| --- | --- | --- | --- |
| `idle` | 숨김 | 조회 결과 그대로 | 일반 행 |
| `summaryProcessing` | 표시 | 새 회의를 제외한 이전 최신 회의 | 새 회의를 제외한 이전 목록 |
| `historyProcessing` | 숨김 | 새 회의 표시 | 새 회의 + 스피너 |
| `completionVisible` | 숨김 | 새 회의 표시 | 새 회의 + 완료 체크 |
| `settled` | 숨김 | 새 회의 표시 | 일반 행 |

상태 전이는 다음과 같다.

```text
idle
  └─ processingMeetingRecordId 수신
       └─ summaryProcessing
            └─ 2,000ms 후 historyProcessing
                 └─ 2,000ms 후 completionVisible
                      └─ 프로젝트 화면 첫 pointer down 후 settled
```

타이밍 상수는 한곳에서 관리한다.

```ts
export const MEETING_SUMMARY_PROCESSING_MS = 2_000
export const MEETING_HISTORY_PROCESSING_MS = 2_000
```

컴포넌트가 unmount되거나 처리 대상 record ID가 바뀌면 등록한 타이머를 모두 정리한다.

## 7. 내비게이션 계약

프로젝트 화면으로 전달하는 navigation state를 다음과 같이 정의한다.

```ts
export type ProjectNavigationState = {
  activeProjectId?: string
  processingMeetingRecordId?: string
}
```

회의 저장 성공 다이얼로그의 `닫기` 동작은 다음 값을 전달한다.

```ts
navigate('/projects', {
  replace: true,
  state: {
    activeProjectId: completedMeeting.projectId,
    processingMeetingRecordId: completedMeeting.recordId,
  },
})
```

호스트가 아닌 사용자가 회의를 나가는 경우에는 `processingMeetingRecordId`를 전달하지 않는다. 저장에 실패한 경우에도 프로젝트 화면으로 이동하지 않으므로 처리 흐름이 시작되지 않는다.

프로젝트 페이지는 navigation state를 최초 한 번만 처리한다. 상태 머신을 시작한 후 현재 location의 state에서 `processingMeetingRecordId`를 제거하여 뒤로 가기나 동일 경로 재진입으로 애니메이션이 재실행되지 않도록 한다. `activeProjectId`는 활성 프로젝트 복원을 위해 유지한다.

## 8. 표시 데이터 파생

Mock DB에는 회의 완료 시점에 새 회의가 이미 들어가 있다. 따라서 `summaryProcessing` 동안에는 새 회의를 명시적으로 숨긴다.

```ts
const visibleMeetings =
  phase === 'summaryProcessing'
    ? meetings.filter(
        (meeting) => meeting.recordId !== processingMeetingRecordId,
      )
    : meetings
```

이 규칙으로 전체 오버레이 뒤의 프로젝트 화면에는 이전 최신 회의 요약과 이전 회의 기록만 남는다. 2초 후 `historyProcessing`으로 전환되면 새 회의를 다시 포함하여 다음 두 변화가 동시에 발생한다.

- 최신 회의 요약이 새 회의로 변경된다.
- 회의 기록 최상단에 새 회의 행과 스피너가 나타난다.

회의 목록의 정렬은 기존 Mock DB의 `completedAt` 내림차순 정렬을 유지한다.

## 9. 기능 경계와 인터페이스

새 기능은 `features/meeting-processing` 슬라이스로 분리한다.

```text
src/features/meeting-processing/
├─ assets/
│  ├─ meeting-processing-loader.svg
│  └─ meeting-processing-success.svg
├─ model/
│  ├─ meetingProcessing.types.ts
│  ├─ useMeetingProcessingFlow.ts
│  └─ useMeetingProcessingFlow.test.tsx
├─ ui/
│  ├─ MeetingProcessingOverlay.tsx
│  └─ MeetingProcessingStatusIcon.tsx
└─ index.ts
```

### `useMeetingProcessingFlow`

라우팅이나 회의 데이터 조회는 담당하지 않는다. 초기 record ID와 타이머만 받아 표현 상태를 관리한다.

```ts
type UseMeetingProcessingFlowParams = {
  recordId?: string
}

type MeetingProcessingFlow = {
  phase: MeetingProcessingPhase
  processingRecordId?: string
  dismissCompletion: () => void
}
```

`dismissCompletion()`은 현재 상태가 `completionVisible`일 때만 `settled`로 전환한다. 다른 상태에서는 아무 동작도 하지 않는다.

### `MeetingProcessingOverlay`

```ts
type MeetingProcessingOverlayProps = {
  open: boolean
}
```

요구사항은 다음과 같다.

- `fixed inset-0`로 프로젝트 전체 화면을 덮는다.
- 검정색 60% 배경을 사용한다.
- 프로젝트 화면의 모든 pointer 입력을 차단한다.
- 중앙에 Figma 로더와 `회의 불러오는 중` 문구를 표시한다.
- `role="status"`와 `aria-live="polite"`를 제공한다.
- 프로젝트 메인 영역에는 오버레이가 열려 있는 동안 `aria-busy="true"`를 적용한다.
- 사용자 입력을 받지 않는 상태 표시이므로 닫기 버튼과 focus trap은 사용하지 않는다.

### `MeetingProcessingStatusIcon`

```ts
type MeetingProcessingStatusIconProps = {
  status: 'processing' | 'completed'
}
```

- 크기는 Figma 기준 28×28px이다.
- `processing`은 로더 wrapper를 계속 회전한다.
- `completed`는 초록색 체크를 표시한다.
- 구현 시 Figma에서 내보낸 원본 에셋을 저장소에 내려받아 사용한다.

### 회의 기록 표시 상태

```ts
export type MeetingHistoryPresentation = {
  recordId: string
  status: 'processing' | 'completed'
}
```

`ProjectMainboardPage`가 현재 phase를 이 타입으로 변환하여 하위 컴포넌트에 전달한다.

| phase | presentation |
| --- | --- |
| `historyProcessing` | `{ recordId, status: 'processing' }` |
| `completionVisible` | `{ recordId, status: 'completed' }` |
| 나머지 | `undefined` |

## 10. 회의 기록 행 상호작용

`ProjectMeetingHistory`는 다음 인터페이스를 갖는다.

```ts
type ProjectMeetingHistoryProps = {
  meetings: CompletedMeeting[]
  presentation?: MeetingHistoryPresentation
  onOpenMeetingDetail?: (recordId: string) => void
}
```

행은 두 개의 형제 버튼 영역으로 나눈다.

```text
[회의 이름 + 길이 + 생성일 + 진행자 상세 이동 버튼] [점 3개 버튼]
```

규칙은 다음과 같다.

- 앞의 네 열 어디를 클릭해도 해당 record ID의 상세 화면으로 이동한다.
- 상세 이동 영역은 키보드 `Enter`와 `Space`로 활성화할 수 있는 실제 `<button>`으로 구현한다.
- hover와 focus-visible 상태에서 Figma의 `surface-muted` 배경을 적용한다.
- 점 3개 버튼은 상세 이동 버튼의 형제 요소로 배치한다.
- 점 3개 버튼 클릭은 상세 이동 callback을 호출하지 않는다.
- 점 3개 메뉴 기능은 이번 범위에서 추가하지 않는다.
- 중첩 `<button>`이나 interactive role을 가진 `<li>`는 사용하지 않는다.

처리 상태 아이콘은 회의 이름 앞에 조건부로 표시한다. `settled` 상태에서는 아이콘 컨테이너도 제거하여 Figma의 일반 행 정렬로 복귀한다.

## 11. 완료 체크 dismiss

`completionVisible` 동안 프로젝트 대시보드 최상위 요소에 `onPointerDownCapture={dismissCompletion}`을 연결한다.

첫 pointer down 결과는 다음과 같다.

- 완료 체크가 즉시 사라진다.
- 회의 데이터와 최신 회의 요약은 유지된다.
- 클릭 대상의 원래 동작은 취소하지 않는다.
- 회의 행 클릭이었다면 체크를 제거한 뒤 상세 화면으로 이동한다.
- `자세히 보기` 클릭이었다면 체크를 제거한 뒤 상세 화면으로 이동한다.
- 점 3개 버튼 클릭이었다면 체크만 제거되고 라우팅은 발생하지 않는다.

## 12. 회의 상세 라우팅

공식 회의 상세 경로는 다음 하나로 통일한다.

```text
/meetings/:meetingRecordId/detail
```

최신 회의 요약과 회의 기록 행은 동일한 callback을 사용한다.

```ts
const openMeetingDetail = (recordId: string) => {
  navigate(`/meetings/${encodeURIComponent(recordId)}/detail`)
}
```

기존 `/meetings/:meetingRecordId/summary` placeholder 라우트와 `MeetingSummaryPlaceholderPage.tsx`는 제거한다.

`MeetingDetailPage`는 URL 파라미터를 읽어 Mock 서비스에 전달한다.

```ts
const { meetingRecordId = '' } = useParams()

useEffect(() => {
  void fetchMeetingDetail(meetingRecordId).then(...)
}, [meetingRecordId])
```

Mock 서비스의 `fetchMeetingDetail(meetingRecordId)`는 전달된 모든 ID에 동일한 `mockMeetingDetailStore`를 반환한다. 이는 실제 API 연결 전까지 모든 회의 기록이 현재 구현된 한 개의 Mock 상세 화면으로 이동해야 한다는 요구사항을 충족한다.

## 13. 오류 및 경계 조건

### 회의 저장 실패

기존 실패 다이얼로그와 재시도 동작을 유지한다. 프로젝트 페이지로 이동하지 않으며 처리 상태도 시작하지 않는다.

### 비호스트 회의 나가기

회의 완료 데이터를 만들지 않으므로 일반 프로젝트 복귀만 수행한다.

### 프로젝트 또는 회의 목록 조회 실패

기존 오류 UI를 우선 표시하고 전체 처리 오버레이를 종료한다. 재시도 후 회의 목록을 가져오면 회의는 일반 완료 상태로 표시한다. 실패 상태에서 무한 오버레이를 유지하지 않는다.

### record ID 불일치

`processingMeetingRecordId`와 일치하는 회의가 성공적으로 조회된 목록에 없다면 상태 머신을 `settled`로 종료한다. 데이터가 없는 행에 무한 스피너를 표시하지 않는다.

### 직접 진입과 새로고침

navigation state가 없으므로 처리 애니메이션 없이 Mock DB의 현재 회의 목록을 일반 상태로 표시한다.

### 프로젝트 전환과 unmount

등록된 타이머를 정리한다. 다른 프로젝트의 회의 행에 처리 아이콘을 표시하지 않는다.

## 14. 접근성

- 전체 처리 오버레이는 `role="status"`와 `aria-live="polite"`를 사용한다.
- 프로젝트 메인 컨테이너는 전체 처리 중 `aria-busy="true"`를 제공한다.
- 회의 행 상세 이동 영역은 실제 버튼으로 구현한다.
- 상세 버튼의 접근 가능한 이름에는 회의 제목을 포함한다.
- 처리 중 아이콘에는 `회의 기록 정리 중` 상태 텍스트를 제공한다.
- 완료 아이콘에는 `회의 기록 정리 완료` 상태 텍스트를 제공한다.
- 장식용 이미지에는 빈 `alt`와 `aria-hidden="true"`를 사용한다.
- 점 3개 버튼은 회의 제목을 포함한 `aria-label`을 유지한다.

## 15. 테스트 전략

Vitest, React Testing Library, `userEvent`, fake timer를 사용한다.

### 상태 훅

- record ID가 없으면 `idle`을 유지한다.
- record ID를 받으면 `summaryProcessing`으로 시작한다.
- 1,999ms에는 `summaryProcessing`을 유지한다.
- 2,000ms에 `historyProcessing`으로 전환한다.
- 추가 1,999ms에는 `historyProcessing`을 유지한다.
- 추가 2,000ms에 `completionVisible`로 전환한다.
- `dismissCompletion()` 후 `settled`로 전환한다.
- `summaryProcessing`이나 `historyProcessing`에서는 dismiss가 상태를 변경하지 않는다.
- unmount 시 타이머를 정리한다.

### 회의 종료 페이지

- 저장 성공 후 성공 다이얼로그를 닫으면 `activeProjectId`와 `processingMeetingRecordId`를 전달한다.
- 비호스트 나가기는 `processingMeetingRecordId`를 전달하지 않는다.
- 저장 실패는 프로젝트 페이지로 이동하지 않는다.

### 프로젝트 메인 페이지

- 복귀 직후 전체 처리 오버레이를 표시한다.
- 전체 처리 중 새 회의를 최신 요약과 회의 기록에서 숨긴다.
- 2초 후 오버레이를 제거하고 새 최신 요약과 새 행 스피너를 표시한다.
- 추가 2초 후 스피너를 완료 체크로 변경한다.
- 첫 pointer down 후 완료 체크만 제거한다.
- 처리 navigation state를 소비한 뒤 재실행하지 않는다.
- 회의 목록 오류 시 오버레이를 종료하고 기존 오류 UI를 표시한다.

### 회의 기록 위젯

- 최신 회의부터 렌더링한다.
- 처리 대상 record ID에만 스피너 또는 체크를 표시한다.
- 일반 행에는 처리 아이콘을 표시하지 않는다.
- 행 내용 영역을 클릭하면 해당 record ID callback을 호출한다.
- 점 3개 버튼을 클릭하면 상세 callback을 호출하지 않는다.
- hover/focus 스타일과 버튼의 접근 가능한 이름을 유지한다.

### 라우터와 상세 화면

- 최신 회의 요약 `자세히 보기`가 `/meetings/:recordId/detail`로 이동한다.
- 회의 기록 행이 같은 상세 경로로 이동한다.
- 서로 다른 record ID로 직접 접근해도 동일한 Mock 상세 화면을 표시한다.
- 제거된 `/summary` placeholder에 의존하는 기존 라우터 테스트를 상세 화면 테스트로 교체한다.

## 16. 파일 변경 범위

### 생성

```text
src/features/meeting-processing/assets/meeting-processing-loader.svg
src/features/meeting-processing/assets/meeting-processing-success.svg
src/features/meeting-processing/model/meetingProcessing.types.ts
src/features/meeting-processing/model/useMeetingProcessingFlow.ts
src/features/meeting-processing/model/useMeetingProcessingFlow.test.tsx
src/features/meeting-processing/ui/MeetingProcessingOverlay.tsx
src/features/meeting-processing/ui/MeetingProcessingStatusIcon.tsx
src/features/meeting-processing/index.ts
```

### 수정

```text
src/pages/MeetingPage.tsx
src/pages/ProjectMainboardPage.tsx
src/pages/MeetingDetailPage.tsx
src/app/router/AppRouter.tsx
src/widgets/project-mainboard/ui/ProjectMainboard.tsx
src/widgets/project-mainboard/ui/ProjectCreatedDashboard.tsx
src/widgets/project-mainboard/ui/ProjectMeetingHistory.tsx
src/shared/api/mock/services/meeting.mock.ts
src/pages/MeetingPage.test.tsx
src/pages/ProjectMainboardPage.test.tsx
src/widgets/project-mainboard/ui/ProjectMeetingHistory.test.tsx
src/app/router/AppRouter.test.tsx
```

### 삭제

```text
src/pages/MeetingSummaryPlaceholderPage.tsx
```

## 17. 완료 조건

- 회의 저장 성공 후 프로젝트 복귀 시 전체 화면 로딩이 정확히 2초 동안 표시된다.
- 전체 화면 로딩 중 새 회의가 배경의 최신 요약과 회의 기록에 먼저 나타나지 않는다.
- 전체 화면 로딩 종료 직후 새 회의가 최신 요약에 표시된다.
- 새 회의 기록 행의 스피너가 정확히 2초 후 완료 체크로 바뀐다.
- 프로젝트 화면 첫 클릭 후 완료 체크가 사라지고 일반 행으로 유지된다.
- 최신 회의 요약의 `자세히 보기`가 구현된 상세 화면으로 이동한다.
- 회의 기록 행의 점 3개를 제외한 영역이 구현된 상세 화면으로 이동한다.
- 모든 회의 record ID가 동일한 Mock 상세 콘텐츠를 표시한다.
- 저장 실패, 비호스트 나가기, 직접 `/projects` 진입에서는 처리 애니메이션이 시작되지 않는다.
- 전체 테스트, ESLint, TypeScript 검사, 프로덕션 빌드가 통과한다.
