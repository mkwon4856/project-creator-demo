# Project Creator — rebuild Task 10
## 잔여 이슈 정리

---

## Task 10-1: 사이드바 라벨 수정

src/app/admin/_config/sidebar.tsx 에서
"정산" 또는 "Payouts" 라벨을 "콘텐츠 검수"로 변경.
href는 /admin/payouts 그대로 유지.

---

## Task 10-2: handle_new_user 트리거 수정

src/app/(auth)/_components/AuthForm.tsx 전체 내용을 보여줘.
studios insert 관련 코드에서 description, logo_url 등 새 스키마에 없는 필드가 있으면 모두 제거해줘.

studios 테이블 컬럼: id, profile_id, company_name, contact_name, business_number, balance, created_at
creators 테이블 컬럼: id, profile_id, name, bio, business_registration_no, created_at

위 컬럼 외 다른 필드를 insert하는 코드가 있으면 전부 제거해줘.

---

## Task 10-3: npm install 외부 패키지

아래 패키지 설치해줘:
```
npm install @sentry/nextjs @vercel/analytics resend
```

설치 후 npx tsc --noEmit 실행해서 타입 에러가 0이 되는지 확인해줘.

---

## Task 10-4: 크리에이터 대시보드 사이드바

src/app/creator/_config/sidebar.tsx 에서
현재 사이드바 링크 목록 보여줘.
새 기획 기준으로 필요한 링크:
- 캠페인 탐색 (/creator)
- 내 지원 현황 (/creator/activity)
- 수익 현황 (/creator/earnings)
- 채널 관리 (/creator/profile)
- 설정 (/creator/settings)

현재 라벨이 새 기획과 맞지 않는 것들 수정해줘.

---

## Task 10-5: 게임사 사이드바

src/app/studio/_config/sidebar.tsx 에서
현재 사이드바 링크 목록 보여줘.
새 기획 기준으로 필요한 링크:
- 대시보드 (/studio)
- 캠페인 만들기 (/studio/new)
- 설정 (/studio/settings)

기존에 있던 /studio/review, /studio/explore, /studio/applicants 링크는 제거해줘.
(검수는 Admin이 담당, 크리에이터 탐색/지원자 관리는 새 기획에서 제거됨)

---

## 완료 후

1. git add . && git commit -m "fix: sidebar labels, authform cleanup, install deps" && git push origin rebuild
2. PROGRESS.md 업데이트
