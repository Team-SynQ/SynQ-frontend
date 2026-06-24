# frontend
SynQ 웹 프론트엔드


# 🚀 SynQ 웹 프론트엔드 (SynQ Web Front-End)

-------------------------------------

## 🛠 2. 기술 스택 (Tech Stack)
- Framework & Library: React (v18+), TypeScript
- Build Tool: Vite
- State Management: 상태 관리 라이브러리 기술 (ex: Recoil, Redux Toolkit, Zustand 등)
- Styling: 스타일 라이브러리 기술 (ex: Styled-components, Tailwind CSS 등)
- Data Fetching: Axios
 
---

## 📂 3. 폴더 구조 (Folder Structure)
 ```bash
src/
 ├── apis/
 ├── assets/
 ├── components/
 │    ├── common/
 │    └── layout/
 ├── hooks/
 ├── pages/
 ├── styles/
 ├── types/
 ├── utils/
 ├── App.tsx
 └── main.tsx
 ```
----

## 🌳 4. 브랜치 및 커밋 컨벤션

### ✉️ 4-1. 이슈 컨벤션 (Issue Convention)
모든 작업(기능 구현, 버그 수정 등)을 시작하기 전, 먼저 Issue를 생성하여 작업 내용을 공유합니다.

* **이슈 제목 형식**: `[Type] 기능 요약`
  * *예시: `[Feat] 로그인 화면 UI 구현`*
  * *예시: `[Fix] 토큰 만료 에러 핸들링 수정`*
* **Type 종류**:
  * `[Feat]`: 새로운 기능 추가
  * `[Fix]`: 버그 수정
  * `[Design]`: CSS 스타일링 및 UI 디자인 변경
  * `[Docs]`: README 등 문서 수정 및 추가
  * `[Chore]`: 패키지 매니저 세팅, 빌드 설정, 파일 이동 등

---

### 🌿 4-2. 브랜치 전략 (Git Flow)
우리 프로젝트는 `main` - `dev` - `기능별` 구조를 사용합니다.

* **브랜치 구조**:
  * `main`: 최종 배포 및 출시 브랜치
  * `dev`: 개발 중심축이 되는 통합 브랜치 (기본 브랜치)
  * `[FE/닉네임] 기능 #이슈번호`: 각 프론트엔드 기능별 작업 브랜치
* **사용 예시**: 
  * `[FE/곽철용]-로그인-ui #1`
  * `[FE/칠판]-마이페이지-조회 #5`

---

### 💬 4-3. 커밋 메시지 규칙 (Commit Message)
작업 단위별로 커밋을 진행하며, 대괄호 안에 Type과 이슈 번호를 함께 명시합니다.

* **커밋 메시지 형식**: `[Type/#이슈번호] 기능 요약`
  * *예시: `[Feat/#1] 로그인 페이지 UI 및 입력 폼 구현`*
* **Type 종류**:
  * `Feat`: 새로운 기능 추가
  * `Fix`: 버그 수정
  * `Design`: CSS 스타일링, UI 레이아웃 등 디자인 수정
  * `Refactor`: 코드 리팩토링 (기능 변화 없음)
  * `Docs`: README 등 문서 수정
  * `Chore`: 패키지 매니저 세팅, 빌드 설정, .gitignore 변경 등
