# Rebuild Progress

브랜치: `rebuild`

---

## Task 1 — DB 스키마 교체 (완료, 2026-06-11)

- `src/lib/db.types.ts` 전면 교체(새 enum/인터페이스), `src/lib/pricing.ts` 신규.
- 구 enum 마이그레이션: `CreatorGrade→Grade`(S 추가), `MissionType→ContentType`,
  CampaignStatus `recruiting→active`/`live→in_progress`, ApplicationStatus
  `applied→confirmed`/`accepted→completed`, SubmissionStatus `making·review→pending`(병합)/`paid` 제거,
  PaymentStatus `processing` 추가.
- 결과: tsc 에러 102 → 60 (남은 60건은 Database/필드 파급 + 외부 모듈 미설치).

---

## Task 2 — 데이터 계층 재구성 (완료, 2026-06-11)

### 진행 결정 (사용자 승인)
- **API 레이어: 하이브리드** — 기존 read/aggregate export 유지 + 새 스키마용 함수 추가.
- **Supabase 훅: 교체 + 하위호환 alias** — 신규 `useProfile/useStudio/useCreator` 등으로 교체하되,
  기존 `useCurrentProfile/Studio/Creator`(반환형 `{ data, loading }`)를 alias로 유지해 18개 호출부 무수정.

### 2-1 레거시 Database 참조 제거
- `supabase/client.ts`·`server.ts`·`middleware.ts`, `api/webhooks/db/route.ts`:
  `createX<Database>()` 제네릭 제거 → 미타입 클라이언트(문자열 쿼리는 런타임 기반).
- 페이지 `type XRow = Database['public']['Tables'][...]['Row']` → 새 인터페이스(`Campaign`/`Creator`/`Studio`)로 교체.
  (creator/page는 mock `Creator`와 충돌해 `DbCreator` alias 사용)
- `transformDbCampaign.ts`: db.types 의존 제거 → **로컬 행 타입**으로 자립(레거시 어댑터, 추후 새 스키마로 재작성).
- `CampaignThumbnailJson` 캐스팅 → 인라인 로컬 타입(`{ from?; to?; emoji? }`)으로 교체(헬퍼 본문 보존).

### 2-2 사라진 필드 참조 수정 (admin/studio/creator 영역 병렬 처리)
적용한 매핑:
- Creator: `display_name→name`, `handle→name`, `user_id→profile_id`.
- Studio: `name→company_name`, `user_id→profile_id`, `description`/`logo_url` 제거.
- Campaign: `name→title`, `developer→game_name`, `brief→description`, `thumbnail→thumbnail_url`,
  `spent_budget→0`, `target_creators→0`.
- Payment: `amount→net_amount`, `paid_at→created_at`, `platform_fee→0`.
- Profile: `name` 부재 → `email` 폴백.

**플레이스홀더(중요):** 새 스키마에서 크리에이터 등급/지표가 `creator_channels` 테이블로 이동했으나
이번 작업은 채널 조인을 포함하지 않음. 따라서 `grade/subscribers/avg_views/rating/completed_campaigns/is_verified/platforms`
참조는 **중립 기본값**(grade `'E'`, 수치 `0`, bool `false`, 배열 `[]`)으로 임시 처리하고
`// TODO(rebuild): source from creator_channels` 주석을 남김. (admin/creators, studio/creators,
creator/profile, creator/page, creator/settings, RecommendedCampaigns 등)

### 2-3 Supabase 훅 교체
- `supabase/hooks.ts` 신규 훅 전면 교체 + 하위호환 alias 추가.

### 2-4 API 레이어 (하이브리드)
- `api/campaigns.ts`: 기존 유지 + `createCampaign`/`createMissions`/`updateCampaignStatus`/`getAllCampaigns`/`getPendingCampaigns` 추가(db 타입은 `DbCampaign`/`DbMission` alias).
- `api/submissions.ts`: 기존 유지 + `createSubmission`/`reviewSubmission`/`getPendingSubmissions` 추가.

### 수정 파일 (26개)
supabase: `client.ts`, `server.ts`, `middleware.ts`, `hooks.ts`
api: `campaigns.ts`, `campaigns.server.ts`, `submissions.ts`, `transformDbCampaign.ts`
route: `api/webhooks/db/route.ts`
admin: `campaigns`, `creators`, `studios`, `payouts`, `AdminOverviewClient`, `_components/ReviewQueue`
studio: `page`, `creators`, `payments`, `review`, `applicants`, `settings`
creator: `page`, `profile`, `settings`, `activity`, `earnings`, `_components/RecommendedCampaigns`

---

## Task 3 — 캠페인 생성 Wizard 재개발 (완료, 2026-06-11)

기존 5단계 wizard(`src/app/studio/new/`)를 새 기획 기준 **3단계**로 전면 재작성.

### 작성/교체 (6개)
- `_types.ts` — `MissionSlot`/`WizardState` + `GENRES`/`CONTENT_TYPE_LABELS`/`GRADE_LABELS` (db.types의 `ContentType`/`Grade` 기반).
- `_components/StepGame.tsx` (1단계: 게임 정보), `StepMissions.tsx` (2단계: 예산·미션 구성, 등급별 단가 자동계산 + 잔여예산 자동소진), `StepReview.tsx` (3단계: 최종 확인), `Stepper.tsx` (진행 표시).
- `page.tsx` — 3단계 상태 머신 + `calcAutoMissions`(잔여예산 하위등급 자동배분) + 제출 시 `createCampaign`/`createMissions`(Task 2-4 API) 호출, `useStudio` 훅 사용.

### 삭제 (4개)
- `_components/`의 `StepBrief.tsx`, `StepBudget.tsx`, `Summary.tsx`, `index.ts` (구 5단계 잔재). 외부 참조 없음(네비게이션 링크 `/studio/new`만 존재).

### 디자인
다크(`#0A0A0F`) + 우베 보라(`#9B7EC8`) + 골드(`#E5B567`), Tailwind v4, 제목 Arial Black.

### 비고
- TASK 코드의 미사용 import(`StepMissions`의 `GRADE_LABELS`, `page`의 `ContentType`)는 제외하고 작성.
- wizard 관련 타입 에러 **0건**. API/훅/타입(Task 2 결과물)과 정상 연결됨.

---

## Task 4 — Wizard 피드백 반영 + AuthForm 수정 (완료, 2026-06-11)

- **4-1** `(auth)/_components/AuthForm.tsx`: studios insert에서 `description` 필드 제거(컬럼 없음).
- **4-2** `StepMissions`: 등급 레이블 "허용 등급 (복수 선택)" → "참여 가능한 크리에이터 등급 (복수 선택)".
- **4-3** 미션 가이드라인: `MissionSlot.guide_draft` `string` → `string[]`(줄 단위). textarea → 한 줄씩 추가/삭제 리스트 UI. `addMission` 초기값 `['']`, 자동 미션(`calcAutoMissions`)은 `[]`. DB 저장 시 `filter(Boolean).join('\n') || null`로 변환. `StepReview`의 가이드 표시도 배열 대응(`join(' · ')`).
- **4-4** `calcMissionAmount`: 선택 등급 중 **최고 등급 1슬롯 단가**만 계산(B+C 합산 → 최고 등급 1명 기준).
- **4-5** `StepReview`: 미션/자동 카드의 금액(`₩studio_amount`) 표시 제거.
- **4-6** `StepReview`: 예상 결과물을 미션별 "약 1명" breakdown + 총합으로 교체(미사용 `totalMissions`/`estimatedCreators` 변수 정리).

타입 에러 0건(wizard/auth). 

---

## Task 5 — 게임사 대시보드 재개발 (완료, 2026-06-11)

- `src/app/studio/page.tsx` 전면 교체: 새 스키마 기준 다크 대시보드.
- `useStudio` + `createClient`로 `campaigns`(`studio_id` 기준) 조회, `Campaign` 타입 사용.
- 헤더(인사 + `studio.balance` 잔여예산 + 캠페인 만들기), 요약 카드 4개(진행중/완료/전체/총 집행예산),
  진행중 캠페인 리스트(빈 상태 CTA 포함), 전체 캠페인 리스트. 상태 배지 = 새 `CampaignStatus` 7종 매핑.
- 디자인: 다크 `#0A0A0F` / 우베 `#9B7EC8` / 골드 `#E5B567` / Arial Black. 기존 WorkspaceLayout 미사용(독립 페이지).
- 타입 에러 0건.

---

## Task 6 — 크리에이터 채널 등록 페이지 (완료, 2026-06-11)

- `src/app/creator/profile/page.tsx` 전면 교체: 새 `creator_channels` 기반 채널 관리 페이지(다크 디자인).
- `useCreator` + `createClient`로 `creator_channels`(`creator_id` 기준) 조회.
- 채널 추가 폼(플랫폼/채널명/URL/구독자수) → `subscribersToGrade`로 등급 자동 산정,
  `PLATFORM_CONTENT_TYPES`로 플랫폼별 지원 콘텐츠 타입 수만큼 행 insert.
- 등록 채널을 `platform:channel_name`로 그룹핑해 카드 표시(등급·콘텐츠 타입 뱃지), 그룹 단위 삭제.
- 이로써 Task 2에서 플레이스홀더('E'/0) 처리했던 크리에이터 등급·구독자 데이터의 **입력 소스**가 마련됨(표시 측 연동은 후속).
- 타입 에러 0건.

---

## Task 7 — 크리에이터 캠페인 탐색/지원 페이지 (완료, 2026-06-11)

- `src/app/creator/page.tsx` 전면 교체: 새 스키마 기반 캠페인 탐색·지원(다크 디자인).
- `useCreator` + `creator_channels`/`campaigns(+missions)`/`applications` 병렬 조회.
- 내 채널 등급(`creator_channels`)과 미션의 `allowed_grades`·`content_type`을 매칭해 **참여 가능한 캠페인만** 필터, 콘텐츠 타입 필터 제공.
- `RATE_MATRIX`로 내 수령 예상액 표시. 지원 시 `applications` insert(`status: 'confirmed'`) + 해당 미션 `status: 'filled'` 업데이트, 중복 지원 방지.
- Task 6(채널 등록)에서 입력된 등급 데이터를 **실제로 소비**하는 첫 화면.
- 타입 에러 0건.

### 비고
- TASK 코드 133행에 `new Set(` 괄호 미닫힘 **구문 오류**가 있어 `))]`로 바로잡아 작성(안 고치면 빌드 실패).

---

## Task 8 — Admin 캠페인 승인 페이지 (완료, 2026-06-11)

- `src/app/admin/campaigns/page.tsx` 전면 교체: 새 스키마 기반 캠페인 승인 관리(다크 디자인).
- `campaigns(+missions, +studios(company_name))` 조회, 탭(대기중/승인됨/전체) + 대기 건수 표시.
- 미션 가이드(`guide_draft`) 검토 표시, Admin 메모 입력.
- 승인 → `status: 'active'` + `launched_at` 기록, 홀드(수정요청) → `admin_note` 필수 + `status: 'pending'` 유지.
- Task 3(생성, `status: 'pending'`) → Task 8(승인, `'active'`) → Task 7(크리에이터 탐색은 `active`만 노출) 흐름이 연결됨.
- 타입 에러 0건.

---

## Task 9 — Admin 콘텐츠 검수 페이지 (완료, 2026-06-11)

- `src/app/admin/payouts/page.tsx` 전면 교체: 기존 정산 페이지 → **콘텐츠 검수 페이지**(라우트 `/admin/payouts` 유지, 컴포넌트 `AdminReviewPage`).
- `submissions(+applications(+creators,+campaigns), +missions)` 조회, 탭(검수대기/승인됨/거절됨) + 대기 건수.
- `platform_urls` 링크 표시, 미션 가이드 표시.
- 4개 체크리스트(`review_url_valid`/`type_match`/`duration_meet`/`guide_meet`) — **전부 체크해야 승인 활성화**. 승인→`approved`+체크값+`reviewed_at` 저장, 거절→사유 필수+`rejected`.
- Task 7(크리에이터 지원/제출) 흐름의 검수 단계. 타입 에러 0건.

### 비고
- 라우트 경로는 `/admin/payouts` 그대로지만 내용이 "검수"로 바뀜 → 사이드바/내비 라벨이 "정산"으로 남아 있다면 후속 정리 필요(이번 범위 밖).

---

## Task 10 — 잔여 이슈 정리 (완료, 2026-06-11)

- **10-1** admin 사이드바: `payouts` 라벨 "정산 지급" → "콘텐츠 검수"(href `/admin/payouts` 유지).
- **10-2** `AuthForm`: 가입 시 studios/creators insert를 새 스키마 컬럼만 남김 —
  studios `{ profile_id, company_name }`, creators `{ profile_id, name, bio }`. 구 `user_id`/`name`/`display_name`/`handle`/`grade`/`subscribers`/`avg_views`/`rating`/`completed_campaigns`/`is_verified`/`platforms` 제거(미사용 `handle` 파생도 제거).
- **10-3** 외부 패키지 설치: `@sentry/nextjs @vercel/analytics resend` → **남은 타입 에러 8 → 0**.
- **10-4** 크리에이터 사이드바 라벨: 캠페인 둘러보기→**캠페인 탐색**, 내 활동→**내 지원 현황**, 수익→**수익 현황**, 프로필→**채널 관리**.
- **10-5** 게임사 사이드바: **대시보드(/studio)·캠페인 만들기(/studio/new)·설정(/studio/settings)** 3개로 축소. review/explore/applicants(및 새 기획에 없는 creators/insights/payments/analytics) 링크 제거. `StudioRouteId` 유니온은 기존 페이지의 `getStudioSidebar(...)` 호출 정합을 위해 유지.

---

## 타입 에러: **0건** 🎉 (`npx tsc --noEmit`)

Task 10-3에서 외부 의존성(Sentry/Analytics/Resend) 설치로 기존 8건(TS2307)을 전부 해소. 전체 타입체크 클린.

---

## 알려진 캐비엇 (타입 아님 / 런타임)
- 미타입 클라이언트의 **문자열 쿼리**가 일부 구 컬럼명을 사용(예: creator/profile `.eq('user_id')`,
  submissions.ts의 `grade`/`content_url`/`rate_*`, ReviewQueue의 `name`/`developer`/`thumbnail`).
  타입 에러는 없으나 실제 새 스키마 DB 연결 시 정렬 필요.
- 크리에이터 지표는 현재 플레이스홀더(전원 'E'/0 등) — 실데이터 아님.
- `transformDbCampaign.ts`는 구 컬럼 기준 레거시 어댑터로 자립 — 새 스키마 기준 재작성 대상.

## 다음 Task 준비 상태 (제안)
1. `creator_channels` 조인 → 등급/구독자/플랫폼 실데이터로 플레이스홀더 대체.
2. 문자열 supabase 쿼리의 컬럼명을 새 스키마로 정렬(profile_id, content_type, platform_urls 등).
3. 외부 의존성 설치 여부 결정(Sentry/Analytics/Resend).
4. `transformDbCampaign` 및 데모/스토어 어댑터 새 스키마 재작성.

---

## Task 11 — 데모 가능 상태 완성 (완료, 2026-06-11)

목표: 클라이언트 앞에서 전체 루프 시연(게임사 가입→캠페인 생성→Admin 승인→크리에이터
가입→채널 등록→지원→콘텐츠 제출→Admin 검수 승인→수익 확인).

### Phase 1 — 전수 감사
- 코드베이스 전체 `.from('...')` 쿼리 매핑. 새 스키마(db.types.ts) 대비 구 컬럼 사용처 식별.
- 데모 동선 핵심 페이지(activity/earnings/campaign 상세/admin 대시보드/admin creators)는 재작성,
  동선 밖 구 스키마 잔존 코드는 `GAPS.md`에 정리(빌드는 정상).

### Phase 2 — 빠진 기능 구현 + 구 페이지 정합 (다크 #0A0A0F / #9B7EC8 / #E5B567 / Arial Black)
- **creator/activity 전면 재작성** — 내 지원 현황 + 콘텐츠 제출 모달(콘텐츠 타입별 플랫폼 제한,
  멀티 URL). `submissions` insert(`platform_urls`, `status:'pending'`). 검수 상태/거절 사유 표시.
  **데모 루프의 빠진 고리.**
- **creator/earnings 전면 재작성** — `approved` 제출 기준 확정 수익 / `pending` 검수 대기 수익,
  `payments` 실지급 내역(없으면 "정산 예정"), 원천징수 3.3% 안내.
- **campaigns/[id] 새 스키마 + public read** — `fetchPublicCampaign`(campaigns.server.ts 신규,
  RLS로 anon 노출) 사용. 단가/예산 비노출.
- **admin/page 단순화 재작성** — 메트릭 카드 4개(전체 캠페인/승인 대기/검수 대기/전체 크리에이터)
  + 바로가기. 구 `AdminOverviewClient`/`ActivityFeed`/Gmv·Tier 차트 사용 제거.
- **admin/creators** — `creator_channels` 조인으로 등급(최고 등급)/구독자/채널수 실데이터 표시
  (플레이스홀더 'E'/0 제거, 가짜 컬럼 정리).
- **공통 수정** — `useAdminBadgeCounts` 검수 카운트 `status:'review'`→`'pending'`,
  `DemoBanner` studios `user_id`→`profile_id`, `studio/settings` 무동작 로고 URL 필드 제거.
- AuthForm 회원가입 흐름 확인 — 트리거가 profiles만 생성, AuthForm이 role별 studios/creators 1개
  insert(새 컬럼만). 이미 정합 상태(Task 10-2). 추가 수정 불필요.

### Phase 3 — 정합 SQL 단일 파일
- `supabase/migrations/20260611000001_demo_ready.sql` 생성. 새 스키마 전 테이블 + 함수 + RLS.
- 포함: `handle_new_user`(profiles만, SECURITY DEFINER), `custom_access_token_hook` + auth_admin GRANT,
  헬퍼 `get_my_role()/get_my_studio_id()/get_my_creator_id()`(SECURITY DEFINER로 RLS 재귀 차단),
  전 테이블 RLS ENABLE + DROP/재생성 정책(실제 코드 쿼리 기준 — anon campaigns/missions 조회,
  크리에이터 missions filled 업데이트 허용 등), 역할별 GRANT, 관리자 승격 SQL 주석.
- 구 `schema.sql`은 구 스키마(user_id/content_url/rate_*)라 superseded — 마이그레이션 상단에
  fresh 프로젝트 권장 + 구 테이블 드롭 블록(주석) 안내.

### Phase 4 — 데모 준비물
- `DEMO_GUIDE.md` — 사전 준비(계정 3개 + 관리자 승격 SQL) + 7단계 시연 대본 + 강조 포인트 4개 + 트러블슈팅.
- `GAPS.md` — 미구현(PG결제/실정산 배치/YouTube API/이메일 알림/잔여예산 환원 로직 등),
  알려진 제약, 구 스키마 잔존 파일 목록, 피해야 할 시연 동선.

### Phase 5 — 검증
- `npx tsc --noEmit` **0 errors**. `npm run build` **성공**(33 라우트).

---

## Task 12 — 크레딧(예산 충전) 시스템 + 24시간 홀드 (완료, 2026-06-11)

흐름: charge(충전) → hold(캠페인 생성 시 홀딩) → approve(approved_at 기록) →
payout(홀드 경과 후 조회 시점 지급) → release(캠페인 완료 시 미집행분 복귀).

- **P1 SQL** `supabase/migrations/20260611000002_credits.sql` — `studio_credits`/`credit_transactions`
  테이블, `submissions.approved_at/paid_at` 추가, 함수 `charge/hold/payout/release_credits` +
  오케스트레이터 `process_submission_payout`(지급+paid_at+batch+payments, RLS 우회) /
  `release_campaign`(미집행 복귀+completed). 전부 SECURITY DEFINER. RLS는 본인 SELECT만, 쓰기는 함수로.
  studio_credits.studio_id = profiles(id)(=auth.uid()) 기준.
- **P2** `src/lib/credits.ts` — `HOLD_DURATION_HOURS`(기본 24) + `isHoldExpired`/`formatHoldRemaining` 등.
- **P3 API** `/api/credits/charge`(POST, studio role, 최소 10만), `/balance`(GET), `/process-payouts`(POST,
  본인 approved 미지급 중 홀드 경과 건을 RPC로 지급). 전부 server client.
- **P4** `studio/new` handleSubmit — 캠페인 insert 후 `hold_credits` RPC, 실패 시 캠페인 삭제(유령 방지)+안내.
- **P5** `admin/payouts` 승인 시 `approved_at = now()` 기록(지급은 안 함).
- **P6** `admin/campaigns` 진행 중 카드에 "캠페인 완료 처리" 버튼 → `release_campaign` RPC.
- **P7 UI** — `components/studio/CreditBalance.tsx`(available 강조/held/누적), `ChargeModal.tsx`(프리셋+직접입력,
  테스트 충전). `studio/page` 헤더 아래 배치(구 `studio.balance` 표시 제거). `creator/earnings` 진입 시
  process-payouts 호출 + 지급완료/지급대기(홀드 잔여)/검수대기 3분류. `creator/activity` 승인 건에 홀드 뱃지.
- **P8** `npx tsc --noEmit` **0 errors**, `npm run build` **성공**(36 라우트). DEMO_GUIDE/GAPS 갱신.
