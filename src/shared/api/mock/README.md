# Mock API 작성 가이드

백엔드 연동 전 화면 개발에 필요한 Mock 데이터와 동작을 일관된 구조로 관리합니다.
이 디렉터리는 구조와 규칙만 제공하며, 폴더를 추가하는 것만으로 기존 화면의 데이터나 동작을 변경하지 않습니다.

## 디렉터리 책임

```text
src/shared/api/
├─ contracts/   # 실제 API와 Mock API가 공유하는 요청·응답 타입
└─ mock/
   ├─ fixtures/ # 읽기 전용 초기 샘플 데이터
   ├─ db/       # 실행 중 생성·수정·삭제되는 Mock 상태
   ├─ services/ # API 명세 형태의 Mock 함수
   ├─ scenarios/# 사용자 흐름별 Mock 데이터 조합
   └─ lib/      # 지연, 오류, ID 생성, 초기화 등 공통 도구
```

## 파일 이름

도메인 이름을 기준으로 역할을 구분합니다.

```text
fixtures/users.fixture.ts
fixtures/projects.fixture.ts
services/users.mock.ts
services/projects.mock.ts
scenarios/onboarding.scenario.ts
scenarios/liveMeeting.scenario.ts
```

## 작성 규칙

1. `fixtures`는 읽기 전용 초기 데이터로 취급합니다.
2. 변경 가능한 상태는 `db`에서 fixture를 복제해 관리합니다.
3. `services`는 API 명세와 동일한 요청·응답 contract를 사용합니다.
4. `scenarios`는 여러 fixture를 하나의 일관된 사용자 흐름으로 조합합니다.
5. 튜토리얼 전용 데이터와 일반 개발용 데이터는 별도 scenario로 분리합니다.
6. API 경로와 contract는 명세를 기준으로 작성하며 임의로 추측하지 않습니다.
7. Mock 구현은 `shared`보다 상위 레이어를 import하지 않습니다.

## 기존 하드코딩 데이터 이관

- 이 디렉터리를 추가하는 작업에서는 기존 하드코딩 데이터를 이동하지 않습니다.
- 하드코딩 데이터 이관은 도메인별 별도 이슈에서 진행합니다.
- fixture로 이관한 데이터는 같은 변경에서 기존 상수를 삭제합니다.
- 같은 데이터를 기존 페이지와 fixture 양쪽에서 동시에 관리하지 않습니다.
- 화면에서 Mock API로 전환할 때 기존 UI와 사용자 동작을 유지합니다.

## 실제 API 전환

화면은 Mock 데이터 파일을 직접 참조하지 않고 API 계층의 공통 contract를 사용합니다.
백엔드 연동 시 화면을 다시 작성하지 않고 Mock service를 HTTP service로 교체하는 것을 원칙으로 합니다.
