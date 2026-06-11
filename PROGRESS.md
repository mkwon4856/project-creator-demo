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

## 남은 타입 에러: **8건** (`npx tsc --noEmit` 기준, Task 2·3 후 동일)

전부 **외부 모듈 미설치(TS2307)** — protected 파일이라 미수정:

| 모듈 | 파일 |
|------|------|
| `@sentry/nextjs` | next.config.ts, sentry.edge/server.config.ts, global-error.tsx, instrumentation.ts, instrumentation-client.ts |
| `@vercel/analytics/react` | layout.tsx |
| `resend` | lib/email/resend.ts |

→ `npm install @sentry/nextjs @vercel/analytics resend`로 해소 가능(별도 결정 필요).

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
