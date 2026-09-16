# SynQ 랜딩페이지

원티드 대회용 소개 랜딩페이지. 앱과 분리된 정적 페이지이며, "씽큐 시작하기" 버튼은 `https://synqai.co.kr` 로 이동합니다.

- `index.html` — 단일 파일 (CSS/JS 내장), 외부 의존은 Pretendard·Noto Sans KR 웹폰트뿐
- `assets/` — 워드마크·심볼·제품 스크린샷 (`public/assets/images/` 에서 복사)

## 배포

정적 호스팅 어디든 올리면 됩니다. 예) 별도 S3 버킷 + CloudFront, Vercel, Netlify, GitHub Pages.
`landing/` 폴더 전체를 루트로 배포하세요 (이미지 경로가 `assets/...` 상대경로).

## 수정 포인트

- 버튼 링크: `index.html` 에서 `https://synqai.co.kr` 검색
- 스크린샷 교체: `assets/onboarding-step1~3.png`
