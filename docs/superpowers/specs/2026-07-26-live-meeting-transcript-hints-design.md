# 회의 진행 전사·SynQ 힌트·AI 질문 기능 구현 설계

- 작성일: 2026-07-26
- 대상 화면: `/meetings/:meetingId/live`
- 기준 브랜치: `develop`
- 문서 상태: 구현 전 설계 확정안

## 1. 목표

현재 회의 진행 화면의 샘플 전사 아래에 SynQ AI 힌트를 추가하고, 전사 선택·수정·AI Chat 질문 연결 흐름을 Figma에 맞게 구현한다.

동시에 `MeetingPage.tsx`에 직접 선언된 회의 진행용 샘플 데이터를 `src/shared/api/mock`으로 이관한다. 화면과 feature는 Mock 구현을 직접 참조하지 않고 API/도메인 어댑터를 통해 같은 계약을 사용한다.

핵심 사용자 흐름은 다음과 같다.

1. 사용자가 전사 문장을 선택한다.
2. 선택된 문장에 프레임과 `AI에게 질문하기`, 수정 버튼이 나타난다.
3. 힌트가 있는 문장이면 해당 문장 아래에서 SynQ 힌트를 불러온다.
4. `AI에게 질문하기`를 누르면 선택 문장이 AI Chat 상단의 고정 컨텍스트로 전달된다.
5. AI Chat 입력창은 비어 있는 상태로 포커스되며, 사용자가 질문을 입력하거나 추천 질문을 선택한 뒤 전송한다.
6. 수정 버튼을 누르면 전사 편집 모드로 전환되고, 변경된 내용만 저장할 수 있다.

## 2. 이번 범위

### 포함

- 전사 선택 UI와 단일 선택 상태
- 선택 전사에 대한 수정 진입 버튼
- 선택 전사를 AI Chat 고정 컨텍스트로 전달
- 전사 수정의 초기·변경·성공·실패 상태
- SynQ 힌트 기본·로딩·실패·재시도 상태
- 데스크톱 1440px 및 최소 지원 너비 1024px 반응형
- 회의 진행 화면의 하드코딩 샘플 데이터 Mock 계층 이관
- Mock DB를 통한 전사 수정 성공 상태 유지
- Figma와 기존 코드 토큰 비교 및 필요한 토큰 보정
- 관련 단위·통합·화면 테스트

### 제외

- 실제 STT WebSocket 연결과 오디오 송신
- 실제 백엔드 API 연결
- 동시 편집 충돌 해결 및 실시간 다중 사용자 동기화
- 백엔드 명세에 아직 없는 AI 힌트·AI Chat URL 추정
- 튜토리얼/회의 시작 화면의 고정 문구 및 고정값 이관

힌트 헤더의 접기 아이콘은 키보드와 스크린 리더가 인식할 수 있는 `button`으로 구현한다. 클릭하면 힌트 카드 전체가 사라지고 선택 전사 카드만 유지된다. 같은 전사 문장을 다시 클릭하면 캐시된 힌트를 다시 표시한다.

## 3. 디자인 및 API 기준

### Figma

- [SynQ 힌트 기본](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1089-7015)
- [전사 선택 및 AI 질문](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=2286-37635)
- [힌트 1024px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1961-26305)
- [힌트 상세](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1167-12019)
- [선택 전사·힌트 분리](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1167-11727)
- [힌트 접기 아이콘](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=2380-37029)
- [힌트 접힘 결과](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=603-2134)
- [힌트 라벨 의미](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1167-12029)
- [힌트 라벨 내 영향](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1167-12033)
- [힌트 라벨 팀 질문](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1167-12037)
- [수정 초기](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1089-6058)
- [수정 후 확인 활성화](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=2286-37900)
- [수정 1024px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1961-24389)
- [수정 성공 1440px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1089-6606)
- [수정 성공 1024px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1961-24527)
- [수정 실패 1440px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1089-8814)
- [수정 실패 1024px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1961-24652)
- [힌트 로딩 1440px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1351-21268)
- [힌트 로딩 1024px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1961-26016)
- [힌트 실패 1440px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1089-5762)
- [힌트 실패 1024px](https://www.figma.com/design/FHZ49MS3HLNgs6JOIv13HX/SynQ?node-id=1089-6881)

### Notion API 명세

- [API 명세서](https://app.notion.com/p/API-3927082bc927805f8c61cd2b3220545c?source=copy_link)

현재 명세에서 프런트엔드가 사용할 수 있다고 확인한 회의 관련 엔드포인트는 다음과 같다.

| 목적 | 메서드와 경로 | 설계 반영 |
| --- | --- | --- |
| 회의 참여 | `POST /meetings/{meetingId}/join` | 진행 중 회의 진입 및 기존 전사 로드 의미를 API 어댑터 계약에 반영 |
| 회의 나가기 | `POST /meetings/{meetingId}/leave` | 참여자 퇴장 계약으로 유지 |
| 회의 종료 | `PATCH /meetings/{meetingId}/end` | 호스트 종료와 요약 생성 트리거 의미를 유지 |
| 전사 목록 조회 | `GET /meetings/{meetingId}/transcripts` | `start_ms ASC`, `seq ASC` 정렬 의미를 도메인 어댑터에서 보장 |
| 전사 한 건 수정 | `PATCH /meetings/{meetingId}/transcripts/{segmentId}` | 수정 성공 시 `is_modified=true` 의미를 도메인 상태에 반영 |
| 실시간 STT | `GET /ws/meetings/{meetingId}/stt` | 이번 구현에서는 연결하지 않고 추후 교체 지점만 유지 |

다음 엔드포인트는 STT 시스템 내부 연동용이므로 브라우저 프런트엔드에서 호출하지 않는다.

- `POST /meetings/{meetingId}/transcript-segments`
- `GET /meetings/{meetingId}/transcript-segments`

Notion 표에는 현재 AI 힌트와 회의 AI Chat 엔드포인트가 없다. 따라서 URL이나 원시 응답 DTO를 임의로 만들지 않는다. 이 두 기능은 명시적으로 `mock-only` 서비스 계약으로 분리하며, 백엔드 명세가 추가되면 어댑터 내부만 교체한다.

또한 현재 명세에서 상세 응답 필드 전체가 확정되지 않았으므로 아래 타입은 백엔드 원시 DTO가 아니라 화면이 소비하는 프런트엔드 도메인 모델이다.

## 4. 현재 구조와 문제점

현재 `MeetingPage.tsx`가 다음 책임을 동시에 가진다.

- 회의명·프로젝트명·참여자·경과 시간 샘플 데이터
- 전사 샘플 데이터
- AI Chat 초기 메시지와 추천 질문
- 녹음 상태 및 화면 상호작용 상태
- 전사와 채팅 feature 조합

이 구조에서는 화면이 데이터 출처를 알고 있고, 백엔드 전환 시 UI까지 수정될 가능성이 높다. 또한 전사 수정과 힌트 실패처럼 서버 상태와 화면 임시 상태가 달라지는 경우를 표현하기 어렵다.

## 5. 목표 아키텍처

의존 방향은 다음과 같이 고정한다.

```text
MeetingPage
  └─ useLiveMeetingController
      └─ meetingApi
          └─ liveMeetingMockService
              ├─ liveMeetingMockDb
              ├─ liveMeetingScenario
              └─ liveMeetingFixture
```

규칙:

1. `pages`, `widgets`, `features`는 `shared/api/mock`을 직접 import하지 않는다.
2. `shared/api/mock`은 상위 계층의 UI 컴포넌트나 asset을 import하지 않는다.
3. 화면은 프런트엔드 도메인 모델만 소비한다.
4. 실제 API와 Mock API는 동일한 `meetingApi` 공개 계약을 구현한다.
5. 변경 가능한 공용 전사 상태는 Mock DB에 저장한다.
6. 네트워크 요청 중 상태와 실패한 편집 초안은 화면 컨트롤러에만 둔다.
7. fixture는 읽기 전용 원본이며 테스트나 시나리오마다 복제해서 사용한다.

예상 파일 구조:

```text
src/
├─ shared/api/
│  ├─ contracts/
│  │  └─ meeting.contracts.ts
│  └─ mock/
│     ├─ fixtures/liveMeeting.fixture.ts
│     ├─ db/liveMeeting.mockDb.ts
│     ├─ services/liveMeeting.mock.ts
│     └─ scenarios/liveMeeting.scenario.ts
├─ entities/meeting/
│  ├─ api/meeting.api.ts
│  └─ model/meeting.types.ts
├─ pages/
│  ├─ MeetingPage.tsx
│  └─ meeting/model/useLiveMeetingController.ts
├─ features/live-transcription/
│  ├─ model/transcript.types.ts
│  └─ ui/
│     ├─ TranscriptPanel.tsx
│     ├─ TranscriptItem.tsx
│     ├─ TranscriptEditor.tsx
│     ├─ TranscriptHintCard.tsx
│     └─ TranscriptFeedback.tsx
└─ features/meeting-ai-chat/
   ├─ model/aiChat.types.ts
   └─ ui/
      ├─ AiChatPanel.tsx
      ├─ AiChatPinnedContext.tsx
      └─ AiChatComposer.tsx
```

파일명은 구현 중 기존 public API/barrel 규칙에 맞춰 조정할 수 있지만 계층과 책임은 유지한다.

## 6. 프런트엔드 도메인 모델

대표 도메인 모델은 다음 정보를 표현한다.

```ts
type LiveMeetingViewData = {
  meetingId: string;
  projectTitle: string;
  meetingTitle: string;
  elapsedSeconds: number;
  recordingState: 'recording' | 'paused';
  participants: MeetingParticipant[];
  transcript: {
    status: 'waiting' | 'active';
    segments: TranscriptSegmentViewData[];
  };
  aiChat: {
    messages: AiChatMessage[];
    suggestions: string[];
  };
};

type MeetingParticipant = {
  id: string;
  name: string;
  role: 'host' | 'member';
  avatarKey: string;
};

type TranscriptSegmentViewData = {
  id: string;
  sequenceIndex: number;
  startedAtSeconds: number;
  text: string;
  isEdited: boolean;
  editedAt: string | null;
};

type TranscriptHint = {
  transcriptId: string;
  notice: string | null;
  meaning: string;
  personalImpact: string;
  teamQuestion: string;
};

type AiChatPinnedContext = {
  transcriptId: string;
  text: string;
};
```

`avatarKey`는 Mock 계층이 UI asset을 직접 참조하지 않도록 하기 위한 안정적인 식별자다. `entities/meeting`의 어댑터 또는 표시 계층에서 현재 이미지 asset에 매핑한다.

## 7. API 및 Mock 서비스 계약

### 명세 기반 회의 API

`meetingApi`는 원시 HTTP 응답을 그대로 노출하지 않고 도메인 모델로 변환한다.

```ts
type MeetingApi = {
  joinMeeting(meetingId: string): Promise<LiveMeetingViewData>;
  leaveMeeting(meetingId: string): Promise<void>;
  endMeeting(meetingId: string): Promise<void>;
  listTranscripts(meetingId: string): Promise<TranscriptSegmentViewData[]>;
  updateTranscript(input: {
    meetingId: string;
    segmentId: string;
    text: string;
  }): Promise<TranscriptSegmentViewData>;
};
```

실제 응답 스키마가 명세에 추가되면 `shared/api/contracts`의 transport 타입과 `entities/meeting/api` 어댑터를 갱신한다. UI 도메인 타입과 컴포넌트 계약은 유지한다.

### Mock 전용 계약

AI 관련 URL은 만들지 않고 다음 의미 기반 서비스만 Mock 구현으로 제공한다.

```ts
type LiveMeetingMockOnlyService = {
  loadScenario(meetingId: string): Promise<LiveMeetingViewData>;
  getTranscriptHint(input: {
    meetingId: string;
    transcriptId: string;
  }): Promise<TranscriptHint>;
  sendMeetingAiQuestion(input: {
    meetingId: string;
    question: string;
    context: AiChatPinnedContext | null;
  }): Promise<AiChatMessage>;
};
```

백엔드 AI 명세가 추가되면 실제 URL과 transport DTO는 이 서비스 경계 안에 도입한다.

## 8. Mock 데이터 설계

### Fixture

fixture에는 초기 회의 화면을 재현하는 읽기 전용 데이터만 둔다.

- 회의 ID, 프로젝트명, 회의명
- 초기 경과 시간과 녹음 상태
- 참여자 목록
- 전사 목록
- 전사별 힌트
- AI Chat 안내 메시지
- 추천 질문
- 질문별 Mock 응답

`MeetingPage.tsx`에서 이관할 대상은 회의 진행 화면에 속한 샘플 데이터 전부다. 단, 튜토리얼 화면은 고정값이므로 데이터 이관 대상이 아니며 기존 설명 주석만 적절한 위치로 이동한다.

### Mock DB

Mock DB는 현재 세션의 변경 가능한 공용 상태를 담당한다.

- 회의별 전사 목록
- 전사 수정 여부와 수정 시각
- AI Chat 대화 내역

Mock DB는 fixture를 깊은 복사해 초기화한다. 테스트와 시나리오 전환 시 초기화할 수 있어야 한다.

### 시나리오

최소 다음 시나리오를 제공한다.

| meetingId | 목적 |
| --- | --- |
| `demo` | 기본 힌트 조회, 전사 수정 성공, AI 질문 성공 |
| `demo-hint-error` | 힌트 최초 조회 실패 및 재시도 확인 |
| `demo-edit-error` | 전사 수정 실패와 실패 초안 유지 확인 |

AI Chat 전송 실패는 서비스 테스트에서 실패 구현을 주입해 검증한다. 별도 화면 URL이 필요해질 때만 시나리오를 추가한다.

Mock 지연은 기존 `waitForMockApi` 규칙을 재사용한다. 로딩 UI를 관찰할 수 있을 만큼 예측 가능한 지연을 사용하되, 테스트에서는 fake timer 또는 지연 주입으로 제어한다.

## 9. 전사 선택과 힌트 상태

### 선택 규칙

- 동시에 하나의 전사만 선택한다.
- 전사 본문 클릭 또는 키보드 활성화로 선택한다.
- 이미 선택된 전사를 다시 클릭하는 동작은 선택 유지로 정의한다.
- 다른 전사를 선택하면 기존 편집·힌트 임시 상태를 정리하고 새 전사 기준으로 전환한다.
- 편집 중에는 다른 전사 선택을 막아 실패 초안이나 변경 내용이 유실되지 않게 한다.

### 힌트 상태

```ts
type TranscriptHintState =
  | { status: 'idle' }
  | { status: 'loading'; transcriptId: string }
  | { status: 'ready'; transcriptId: string; hint: TranscriptHint }
  | { status: 'error'; transcriptId: string; message: string };
```

흐름:

1. 힌트가 연결된 전사를 선택하면 `loading`으로 전환한다.
2. 성공하면 선택 전사 아래에 `ready` 힌트를 표시한다.
3. 실패하면 같은 위치에 오류 안내와 재시도 버튼을 표시한다.
4. 재시도는 현재 선택 전사가 같은지 확인한 뒤 다시 요청한다.
5. 늦게 도착한 이전 전사의 응답은 현재 선택 ID와 다르면 버린다.
6. 접기 버튼을 누르면 현재 힌트 상태를 `idle`로 되돌리고 진행 중 요청을 무효화해 카드 전체를 숨긴다.
7. 같은 전사를 다시 선택하면 성공 힌트는 캐시에서 즉시 복원하고, 캐시가 없으면 새로 요청한다.

힌트가 없는 전사는 선택 액션만 노출하고 힌트 카드는 렌더링하지 않는다.

## 10. 전사 수정 상태와 저장 규칙

```ts
type TranscriptEditState =
  | { status: 'idle' }
  | {
      status: 'editing';
      transcriptId: string;
      originalText: string;
      draftText: string;
      errorMessage: string | null;
      isSaving: boolean;
    };
```

### 진입

- 진행자와 참여자 모두 수정 버튼을 사용할 수 있다.
- 수정 진입 시 선택 액션과 힌트 카드는 숨기고 textarea와 버튼 영역을 표시한다.
- textarea는 기존 전사 문장으로 초기화하고 포커스한다.

### 버튼 활성화

- 취소 버튼은 항상 활성화한다.
- 확인 버튼은 `draftText !== originalText`이고 `draftText.trim()`이 비어 있지 않으며 저장 중이 아닐 때만 활성화한다.
- 공백 차이도 사용자가 만든 변경으로 취급하되, 전체가 공백인 값은 저장하지 않는다.
- 저장 중에는 중복 제출을 막는다.

### 취소

- 편집 중 변경값과 오류를 버린다.
- 원래 전사를 선택한 상태로 돌아간다.
- 해당 전사의 힌트가 이미 성공했다면 다시 요청하지 않고 캐시된 힌트를 보여준다.

### 성공

1. Mock 서비스가 Mock DB의 해당 전사 문장을 갱신한다.
2. `isEdited=true`, `editedAt`을 저장한다.
3. 화면은 갱신된 공용 전사를 표시한다.
4. Figma와 같이 `수정됨` 표시를 노출한다.
5. 편집 상태를 종료하고 선택 상태를 유지한다.

### 실패

Figma 주석의 동작을 우선한다.

1. 사용자가 입력한 실패 초안을 현재 화면에 그대로 표시한다.
2. 입력 영역 아래에 실패 안내를 표시한다.
3. Mock DB의 공용 전사는 기존 성공 상태를 유지하며 실패 초안을 저장하지 않는다.
4. 사용자는 실패 초안으로 다시 저장을 시도하거나 취소할 수 있다.
5. 새로고침 또는 시나리오 재진입 시 Mock DB에 마지막으로 성공한 문장이 표시된다.

즉, “실패 초안을 저장하지 않는다”는 화면에서 사라진다는 의미가 아니라 공용 Mock DB에 커밋하지 않는다는 의미다. 실패 초안은 편집 상태의 로컬 메모리에 유지한다.

## 11. AI Chat 고정 컨텍스트 흐름

`AI에게 질문하기`를 누르면 선택 전사의 현재 표시 문장을 다음 스냅샷으로 전달한다.

```ts
type AiChatPinnedContext = {
  transcriptId: string;
  text: string;
};
```

동작:

1. 닫혀 있거나 축소된 AI Chat이면 기존 화면 규칙대로 다시 연다.
2. AI Chat 헤더와 메시지 목록 사이에 고정 컨텍스트를 표시한다.
3. 질문 입력값은 자동으로 채우지 않고 빈 상태를 유지한다.
4. 입력창으로 포커스를 이동한다.
5. 사용자는 직접 질문하거나 추천 질문을 선택한다.
6. 전송 시 `question`과 `context`를 함께 Mock 서비스에 전달한다.
7. 전송 성공 시 사용자 질문과 Mock 답변을 대화에 추가한다.
8. 전송 실패 시 질문 초안과 고정 컨텍스트를 유지한다.

고정 컨텍스트는 전달 시점의 스냅샷이다. 이후 원본 전사가 수정되어도 이미 AI Chat에 전달한 문구는 자동 변경하지 않는다. 사용자가 다시 `AI에게 질문하기`를 누르면 새 스냅샷으로 교체한다.

고정 컨텍스트의 닫기 버튼은 컨텍스트만 제거하며 입력 초안과 대화 내역은 유지한다.

`ChatInput`은 `ref`를 전달받을 수 있도록 확장해, 컨텍스트 전달 후 명시적으로 포커스할 수 있게 한다.

## 12. UI 컴포넌트 설계

### `TranscriptItem`

책임:

- 시간과 전사 본문 표시
- 선택 프레임과 선택 액션 표시
- `수정됨` 표시
- 선택·수정·AI 질문 이벤트 전달

비책임:

- API 호출
- Mock 데이터 import
- 힌트 요청 상태 관리

### `TranscriptEditor`

책임:

- 자동 높이 textarea
- 취소·확인 버튼
- 저장 중 비활성화
- 실패 피드백 표시

기존 `ModifyInput`은 단일 행 입력 계약이므로 억지로 확장하지 않고 전사 전용 textarea를 사용한다.

### `TranscriptHintCard`

책임:

- SynQ 힌트 헤더
- 선택 전사 안내 문구
- 의미·개인 영향·팀 질문 항목
- 접기 아이콘의 버튼 경계

접기 버튼은 `aria-label="SynQ 힌트 접기"`를 제공하고 Figma의 위쪽 화살표 자산을 사용한다. 버튼을 누르면 힌트 카드가 DOM에서 제거된다.

### `TranscriptFeedback`

전사 수정 실패와 힌트 실패에서 공통으로 쓰는 피드백 외형을 담당한다. 메시지와 선택적 재시도 액션을 props로 받는다.

### `AiChatPinnedContext`

책임:

- 전달된 전사 문장 표시
- 핀 아이콘
- 컨텍스트 제거 버튼

메시지와 입력창 사이가 아니라 Figma 기준으로 채팅 헤더 바로 아래, 메시지 영역 위에 위치한다.

## 13. Figma 치수와 디자인 토큰

### 공통 치수

- 선택 전사와 힌트는 각각 독립된 컨테이너이며 두 컨테이너 사이 간격은 `8px`
- 선택 전사 컨테이너: `gray-200`, `padding: 16px`, `border-radius: 12px`
- 힌트 컨테이너: `gray-200`, `padding: 16px`, `border-radius: 12px`
- 전사 액션 버튼: 높이 `32px`, 좌우 `16px`, `border-radius: 8px`
- 힌트 헤더 내부 간격: `16px`
- 힌트 행 간격: `8px`
- 힌트 라벨과 본문 간격: `16px`
- 힌트 라벨 너비: `81px`
- 힌트 라벨: 좌우 `12px`, 상하 `8px`, `gray-100`, 네 모서리 모두 `border-radius: var(--radius-s)` (`8px`)
- 오류 피드백: 최소 높이 `42px`, 좌우 `16px`, 상하 `8px`, `border-radius: 12px`
- 수정 textarea: 좌우 `16px`, 상하 `8px`, `gray-100`, `gray-300` border, `border-radius: 12px`
- AI Chat 고정 컨텍스트: 최소 높이 `100px`, 좌우 `24px`
- 고정 컨텍스트의 핀/닫기 아이콘: `24px`

### 로딩 표시

Figma의 32px 흰색 원형 컨테이너와 28px 로더 glyph를 사용한다. 별도 로딩 라이브러리를 추가하지 않고 디자인 asset과 CSS 회전만 사용한다. `prefers-reduced-motion`에서는 회전을 제거하고 정적 로더로 표시한다.

### 토큰

우선 기존 CSS 변수와 공용 컴포넌트를 사용한다.

- `Button`의 `small`, `primaryFill`, `fillGray100`
- 기존 `edit.svg`, `refresh.svg`
- typography의 `body01`, `body02`, `caption`
- gray, primary, overlay 토큰

현재 코드의 `--color-gray-800`은 `#242424`, Figma는 `#242426`으로 확인된다. 실제 렌더 비교 후 Figma 값으로 보정하고, 활성 CSS 토큰과 `tailwind.config`의 회색 정의를 함께 동기화한다. 이외 토큰은 기존 값으로 Figma를 재현할 수 없는 경우에만 추가·수정한다.

## 14. 반응형

지원 기준은 Figma의 1440×1024와 1024×1024다.

현재 회의실 레이아웃의 `min-width: 1024px`, AI Chat 고정 폭 `500px`, 전사 영역 `minmax(524px, 1fr)` 구조는 유지한다.

1440px에서:

- 전사 본문과 수정 textarea가 가능한 한 한 줄 흐름을 유지한다.
- 선택 액션은 Figma의 우측 정렬을 따른다.
- 힌트 행은 라벨과 설명이 가로로 배치된다.

1024px에서:

- 전사 본문과 textarea는 자연스럽게 여러 줄로 감싼다.
- 힌트 라벨 너비는 유지하고 설명 영역만 축소·개행한다.
- 버튼과 피드백은 전사 컬럼 내부를 넘지 않는다.
- AI Chat 500px 너비를 유지하며 전사 영역은 최소 524px를 보장한다.

지원 너비 아래로 축소하는 별도 모바일 레이아웃은 이번 범위가 아니다.

## 15. 접근성 및 상호작용

- 전사 선택 영역은 키보드로 접근 가능해야 한다.
- 선택 상태는 색상뿐 아니라 `aria-selected` 또는 동등한 의미로 전달한다.
- 수정, AI 질문, 힌트 접기, 컨텍스트 닫기, 재시도는 모두 실제 `button` 요소를 사용한다.
- 아이콘 전용 버튼은 명확한 `aria-label`을 가진다.
- 편집 진입 시 textarea, AI 질문 전달 시 Chat input으로 포커스를 이동한다.
- 저장 실패 피드백은 `role="alert"` 또는 `aria-live="polite"`로 알린다.
- 로딩 상태는 스크린 리더용 텍스트를 제공한다.
- textarea와 버튼의 focus-visible 스타일은 기존 토큰을 사용한다.

## 16. 테스트 전략

### 단위 테스트

- 변경 전 확인 버튼 비활성화
- 변경 후 확인 버튼 활성화
- 공백만 입력한 확인 버튼 비활성화
- 저장 중 중복 제출 방지
- 선택 전환 시 오래된 힌트 응답 무시
- 고정 컨텍스트가 전달 시점 스냅샷을 유지
- 참여자 `avatarKey` 매핑
- 전사 정렬이 시작 시간과 sequence 기준을 유지

### Mock 서비스 테스트

- fixture가 호출 간 변경되지 않음
- Mock DB 초기화
- 수정 성공 시 문장·`isEdited`·`editedAt` 저장
- 수정 실패 시 Mock DB 불변
- 힌트 성공·실패·재시도
- AI 질문에 컨텍스트 포함

### 컴포넌트/통합 테스트

- 전사 클릭 시 프레임과 액션 표시
- 수정 진입·취소·성공·실패 UI
- 실패 후 입력 초안 유지
- 성공 후 `수정됨` 표시
- `AI에게 질문하기` 후 고정 컨텍스트 표시
- AI Chat draft가 비어 있고 input이 포커스됨
- 컨텍스트 닫기
- 힌트 로딩·성공·오류·재시도
- 접기 버튼을 누르면 힌트 카드가 사라짐
- 같은 전사를 다시 누르면 캐시된 힌트가 다시 나타남
- 선택 전사와 힌트가 `gap-xs`로 구분된 독립 컨테이너로 렌더링됨
- 힌트 라벨 네 모서리가 모두 `--radius-s`를 사용함

### 화면 검증

- `demo`, `demo-hint-error`, `demo-edit-error` 직접 확인
- 1440×1024와 1024×1024 스크린샷 비교
- overflow, line wrapping, focus-visible 확인
- 기존 회의 대기·일시정지·종료 동작 회귀 확인

### 완료 전 명령

```text
npm run lint
npm run typecheck
npm test
npm run build
```

Windows 환경의 기존 CRLF 때문에 전체 `format:check`가 실패할 수 있으므로, 이번 변경 파일은 저장소 EOL 정책을 따르고 무관한 파일의 줄바꿈을 일괄 변경하지 않는다.

## 17. 구현 단계

1. 회의 도메인 모델과 공개 API 계약을 정의한다.
2. 기존 `MeetingPage.tsx` 샘플 데이터를 fixture·Mock DB·service·scenario로 이관한다.
3. `useLiveMeetingController`로 화면 상태와 서버/Mock 상태를 분리한다.
4. 전사 선택 및 AI Chat 고정 컨텍스트 흐름을 구현한다.
5. 전사 수정의 초기·변경·성공·실패 상태를 구현한다.
6. 힌트 기본·로딩·실패·재시도를 구현한다.
7. Figma 토큰과 1440/1024 반응형을 맞춘다.
8. 테스트와 시각 회귀 검증을 완료한다.

세부 파일별 구현 순서와 테스트 케이스는 이 설계 승인 후 별도의 구현 계획서에서 확정한다.

## 18. 완료 조건

- 회의 진행 화면에 Figma 기준의 전사 선택과 SynQ 힌트가 표시된다.
- 선택 문장이 AI Chat 상단 고정 컨텍스트로 전달되고 input은 빈 상태로 포커스된다.
- 전사 수정 버튼 상태와 성공·실패 화면이 Figma 동작을 따른다.
- 실패 초안은 현재 화면에 유지되지만 Mock DB에는 저장되지 않는다.
- 성공 수정은 Mock DB에 저장되고 모든 컴포넌트가 최신 공용 값을 표시한다.
- 힌트 로딩·오류·재시도가 동작한다.
- 힌트 접기 버튼은 위쪽 화살표를 사용하며 클릭하면 카드가 사라진다.
- 접힌 힌트는 같은 전사를 다시 클릭하면 캐시에서 복원된다.
- 선택 전사와 힌트 카드는 Figma처럼 8px 간격을 둔 독립된 12px radius 컨테이너다.
- 힌트 라벨은 공통 `--radius-s` 토큰으로 네 모서리 모두 8px radius를 갖는다.
- `MeetingPage.tsx`에 있던 회의 진행 샘플 데이터가 Mock 계층으로 이동한다.
- 튜토리얼 고정값은 이관하지 않는다.
- 화면과 feature에서 Mock 구현을 직접 import하지 않는다.
- Notion에 없는 AI API URL이나 상세 응답 DTO를 추정하지 않는다.
- 1440px 및 1024px에서 Figma와 동일한 정보 구조와 레이아웃을 유지한다.
- lint, typecheck, test, build가 통과한다.
