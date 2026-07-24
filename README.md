# SynQ Frontend

프로젝트 자료와 지난 회의 맥락을 학습해, 실시간으로 회의 참여 인원을 연결하는 협업 AI SynQ의 웹 프론트엔드 레포지토리입니다.

## 프로젝트 소개

회의는 함께 하지만 이해는 항상 함께 이루어지지 않습니다. 같은 회의에서도 PM은 일정과 범위를, 디자이너는 화면 영향을, 개발자는 구현 난이도와 리스크를 먼저 떠올립니다.

SynQ는 이렇게 같이 들었지만 다르게 이해하는 순간을 줄이기 위해 다음 문제를 해결합니다.

- 회의 중 놓친 의미를 바로 이해하도록 돕습니다.
- 내 역할 기준의 업무 영향을 파악하도록 돕습니다.
- 팀과 맞춰야 할 질문을 놓치지 않도록 돕습니다.
- 프로젝트 자료와 지난 회의 맥락을 바탕으로 실시간 질문이 가능하도록 돕습니다.

이 레포지토리는 SynQ의 웹 프론트엔드 화면, 사용자 인터랙션, 클라이언트 상태, API 연동, 공통 UI 구조를 관리합니다.

## 팀원 및 프론트엔드 역할 분담

| 이름   | 닉네임                                     | GitHub                                            |
| ------ | ------------------------------------------ | ------------------------------------------------- |
| 김도현 | [도비](https://github.com/rlaehgus4418)    | [rlaehgus4418](https://github.com/rlaehgus4418)   |
| 곽영찬 | [곽철용](https://github.com/youngchan-git) | [youngchan-git](https://github.com/youngchan-git) |
| 이태건 | [칠판](https://github.com/taegeon2)        | [taegeon2](https://github.com/taegeon2)           |

### 담당 영역

| 영역           | 담당자                                     | 세부 범위                                                                                 |
| -------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 공통 기반      | Frontend Team                              | 공통 컴포넌트, FSD 폴더 구조 초기 세팅, 공통 UI 규칙 관리                                 |
| 랜딩 및 인증   | [곽철용](https://github.com/youngchan-git) | 랜딩 페이지, 로그인, 온보딩, 튜토리얼 페이지                                              |
| 메인페이지     | [칠판](https://github.com/taegeon2)        | 프로젝트 메인보드, 프로젝트 생성 과정, 생성 이후 메인보드, AI 참고 자료, 회의 기록 더보기 |
| 회의 전사 과정 | [도비](https://github.com/rlaehgus4418)    | 실시간 회의 전사 과정 UI 전체, 발화 흐름, 회의 중 인터랙션 영역                           |

## 기술 스택

| 구분            | 기술                       |
| --------------- | -------------------------- |
| Framework       | React                      |
| Language        | TypeScript                 |
| Build Tool      | Vite                       |
| Package Manager | pnpm                       |
| Styling         | Tailwind CSS               |
| Server State    | TanStack Query             |
| API Client      | Axios                      |
| Architecture    | FSD(Feature-Sliced Design) |
| Deployment      | Vercel                     |
| Version Control | Git, GitHub                |

- 로컬 개발 서버는 `pnpm run dev`로 실행합니다.

## Mock API 개발

백엔드 연동 전 화면 개발에는 `src/shared/api/mock`의 Mock API 구조를 사용합니다.

- Fixture는 읽기 전용 초기 데이터로 관리합니다.
- 기존 하드코딩 데이터를 fixture로 이관하면 기존 상수는 함께 삭제합니다.
- 실제 API와 Mock API는 동일한 contract를 사용합니다.

자세한 규칙은 [Mock API 작성 가이드](src/shared/api/mock/README.md)를 참고하세요.

## 폴더 구조

본 프로젝트는 FSD(Feature-Sliced Design) 구조를 따릅니다.

```bash
src/
├─ app/              # 앱 엔트리, 전역 스타일, 라우터, Provider 설정
├─ pages/            # 라우팅 단위 페이지 조립
├─ widgets/          # 독립적으로 완성된 큰 UI 블록
├─ features/         # 사용자 액션과 기능 중심 슬라이스
├─ entities/         # 비즈니스 도메인 모델, 타입, 데이터
└─ shared/           # 전역 재사용 코드
   ├─ api/           # API 클라이언트, Axios 설정
   ├─ ui/            # Button, Input, Modal 등 공통 UI
   └─ lib/           # 공통 유틸리티, 커스텀 훅
```

레이어 의존성은 상위 레이어가 하위 레이어를 사용하는 방향으로 유지합니다.

```text
app -> pages -> widgets -> features -> entities -> shared
```

## 브랜치, 커밋, PR 컨벤션

### 브랜치 전략

```text
main       프로덕션/릴리즈 브랜치
develop    개발 통합 브랜치
작업 브랜치  이슈 단위 작업 브랜치
```

일반 기능, 수정, 문서, 설정 작업은 `develop`을 기준으로 브랜치를 만들고 PR을 보냅니다. `main` 머지는 릴리즈 또는 배포 시점에 진행합니다.

### 브랜치 네이밍

```text
{type}#{issue-number}/{task-name}
```

예시:

```bash
feat#12/meeting-live-transcript
fix#15/chat-scroll-reset
chore#1/github-templates
```

### 커밋 메시지

```text
{type}/#{issue-number}: {작업 요약}
```

예시:

```bash
git commit -m "feat/#12: 실시간 회의 전사 화면 추가"
git commit -m "fix/#15: 채팅 스크롤 초기화 오류 수정"
git commit -m "docs/#3: README 업데이트"
```

Type은 다음 기준으로 사용합니다.

| Type     | 의미                                                    |
| -------- | ------------------------------------------------------- |
| feat     | 새로운 기능 추가                                        |
| fix      | 버그 수정                                               |
| docs     | 문서 수정                                               |
| style    | 코드 포맷, 세미콜론, 공백 등 동작 변화 없는 스타일 정리 |
| refactor | 기능 변화 없는 코드 구조 개선                           |
| test     | 테스트 추가 또는 수정                                   |
| chore    | 설정, 패키지, 빌드, 레포 관리                           |
| design   | UI 스타일링, 레이아웃, 디자인 수정                      |

### PR 컨벤션

PR 제목은 커밋 메시지와 같은 형식을 사용합니다.

```text
{type}/#{issue-number}: {작업 요약}
```

PR 작성 시에는 PR 템플릿을 따르고 다음 내용을 명확히 남깁니다.

- 간단 설명
- 관련 이슈
- 작업 내용
- 확인 사항

## 실행 방법

### 패키지 설치

```bash
pnpm install
```

### 로컬 개발 서버 실행

```bash
pnpm run dev
```

### 빌드

```bash
pnpm run build
```

### 배포

배포는 Vercel을 기준으로 진행합니다.

## 화면 목록 및 플로우

현재 기획 기준의 주요 화면과 흐름입니다. 실제 구현 화면이 확정되면 이 섹션을 갱신합니다.

| 화면                  | 담당   | 설명                                                        |
| --------------------- | ------ | ----------------------------------------------------------- |
| 랜딩                  | 곽철용 | 서비스 첫 진입 화면과 핵심 가치 전달 화면                   |
| 로그인/온보딩         | 곽철용 | 로그인, 초기 사용자 안내, 온보딩 플로우                     |
| 에러/버그 발생 페이지 | 곽철용 | 예외 상황, 접근 실패, 오류 안내 화면                        |
| 프로젝트 메인보드     | 칠판   | 프로젝트 진입 후 주요 정보와 회의 흐름을 확인하는 메인 화면 |
| 프로젝트 생성 과정    | 칠판   | 프로젝트 생성, 기본 정보 입력, 초기 설정 플로우             |
| 생성 이후 메인보드    | 칠판   | 생성된 프로젝트의 AI 참고 자료, 회의 기록, 더보기 영역 포함 |
| 회의 전사 과정        | 도비   | 실시간 전사 UI, 발화 흐름, 회의 중 인터랙션 영역            |
| 튜토리얼              | 곽철용 | 사용자가 SynQ 사용 흐름을 익히는 안내 화면                  |
| 회의 정리             | 도비   | 회의 종료 후 전사, 힌트, 질문 흐름을 정리해 확인하는 화면   |

서비스 플로우는 다음과 같습니다.

```text
랜딩
  -> 로그인/온보딩
  -> 프로젝트 생성 또는 메인보드 진입
  -> 프로젝트 자료 및 지난 회의 맥락 등록
  -> 회의 시작
  -> 실시간 전사 확인
  -> SynQ 힌트로 의미, 내 영향, 팀 질문 파악
  -> AI Chat으로 추가 질문
  -> 회의 종료 후 회의 정리 확인
```
