# 모두복지 (modubokji)

나에게 맞는 복지 혜택을 찾아주는 웹서비스입니다.

기본 정보를 입력하면 받을 수 있는 복지 혜택을 추천하고, 필요한 서류와 신청 방법을 체크리스트로 알려드립니다.

## 주요 기능

- 프로필 기반 맞춤 복지 추천 (30개 정책)
- 정책별 준비 서류 + 신청 절차 체크리스트
- 비호환 정책 (동시 수급 불가) 경고
- 소득 구간 "모르겠음" 옵션 (모든 정책 표시)
- 개인정보 브라우저에만 저장 (서버 전송 없음)

## 시작하기

```bash
npm install
npm run dev      # 개발 서버 (localhost:3000)
npm test         # 테스트 실행
npm run build    # 프로덕션 빌드
```

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Vitest (테스트)
- Zod (데이터 검증)

## 기여하기

[CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요. 가장 큰 도움은 복지 정책 데이터 추가/수정입니다.

## 라이센스

MIT
