# frontend
SynQ 웹 프론트엔드


# SynQ 웹 프론트엔드 (SynQ Web Front-End)

## 1. 프로젝트 소개
-> 여기 채워야됨

## 🛠 2. 기술 스택 (Tech Stack)
- Framework & Library: React (v18+), TypeScript
- Build Tool: Vite
- State Management: 상태 관리 라이브러리 기술 (ex: Recoil, Redux Toolkit, Zustand 등)
- Styling: 스타일 라이브러리 기술 (ex: Styled-components, Tailwind CSS 등)
- Data Fetching: Axios
 

## 3. 팀원 및 프론트엔드 역할 분담
(여기 수정)


## 📂 4. 폴더 구조 (Folder Structure)
 ```bash
src/
 ├── app/             # 애플리케이션의 엔트리 포인트 (전역 스타일, 라우터, Provider 설정)
 │
 ├── pages/           # 라우팅 단위의 페이지 컴포넌트 (비즈니스 로직 없이 레이아웃 중심 조립)
 │
 ├── widgets/         # 독립적으로 완성된 대형 UI 블록 (ex: Header, Sidebar, ProductGrid 등)
 │
 ├── features/        # 사용자의 액션/기능 중심 슬라이스 (ex: LoginByForm, SearchProducts 등)
 │
 ├── entities/        # 비즈니스 도메인 단위 모델 및 데이터 (ex: User, Product, Order 등)
 │
 ├── shared/          # 프로젝트 전역에서 재사용되는 인프라성 코드 (안정적인 최하위 레이어)
 │    ├── api/        # Axios 인프라 및 공통 공공/외부 API 설정
 │    ├── ui/         # Button, Input, Modal 등 순수 공통 UI 컴포넌트
 │    └── lib/        # 공통 유틸리티 함수, 커스텀 훅 등
 │
 ├── App.tsx          # app 레이어로 연결되는 최상위 컴포넌트
 └── main.tsx         # 애플리케이션 진입점
```

## 🌳 5. 브랜치 및 커밋 컨벤션

### ✉️ 5-1. 이슈 컨벤션 (Issue Convention)
모든 작업(기능 구현, 버그 수정 등)을 시작하기 전, 먼저 Issue를 생성하여 작업 내용을 공유합니다.

* **이슈 제목 형식**: `[Type/닉네임] 기능 요약`
  * *예시: `[Feat/곽철용] 로그인 화면 UI 구현`*
  * *예시: `[Fix/칠판] 토큰 만료 에러 핸들링 수정`*
* **Type 종류**:
  * `[Feat]`: 새로운 기능
  * `[Fix]`: 버그 수정
  * `[Design]`: CSS 스타일링 및 UI 디자인 변경
  * `[Docs]`: 문서 수정 및 추가
  * `[Chore]`: 기타
---

### 🌿 5-2. 브랜치 전략 (Git Flow)

#### Git Flow 기반 브랜치 전략
```bash
main (프로덕션)
  ↑
dev (개발)
  ↑
feature/* (기능 개발)
fix/* (버그 수정)
refactor/* (리팩토링)
```
#### 브랜치 네이밍 규칙
  * `feat/{기능명}`: 새로운 기능
  * `fix/{버그명}`: 버그 수정
  * `refactor/{대상}`: CSS 스타일링 및 UI 디자인 변경
  * `docs/{문서명}`: 문서 수정 및 추가
  * `chore/{작업명}`: 기타
---


### 💬 5-3. 커밋 메시지 규칙 (Commit Message)
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



## 6. 실행 방법

### 패키지 설치
```bash
npm install
pnpm install
```
### 로컬 개발 서버 실행
```bash
npm run dev
pnpm run dev
```


## 7. 화면 목록 및 서비스 플로우

* Figma 링크: [디자인 피그마 링크 입력]
* 서비스 플로우 / 와이어프레임: 사진이나 링크좀...
* (여기에 주요 페이지 흐름도나 와이어프레임 이미지를 첨부부탁)


    
