# SynQ 랜딩페이지

> **이 폴더는 더 이상 배포에 쓰이지 않습니다.**
> 도메인을 합치면서 랜딩은 앱 안으로 옮겨졌고, 지금은 `synqai.co.kr` 루트(`/`)에서
> `src/pages/marketing-landing/` 가 그려 줍니다. 내용을 고칠 일이 있으면 그쪽을 고치세요.
> 이 폴더는 별도 Vercel 배포를 내릴 때까지 원본 보관용으로만 남겨 둡니다.

원티드 대회용 소개 랜딩페이지의 원본 정적 파일입니다.

- `index.html` — 단일 파일 (CSS/JS 내장), 외부 의존은 Pretendard·Noto Sans KR 웹폰트뿐
- `assets/` — 워드마크·심볼·제품 스크린샷 (`public/assets/images/` 에서 복사)

## 배포

정적 호스팅 어디든 올리면 됩니다. 예) 별도 S3 버킷 + CloudFront, Vercel, Netlify, GitHub Pages.
`landing/` 폴더 전체를 루트로 배포하세요 (이미지 경로가 `assets/...` 상대경로).

## 수정 포인트

- 버튼 링크: `index.html` 에서 `https://synqai.co.kr` 검색
- 스크린샷 교체: `assets/onboarding-step1~3.png`
