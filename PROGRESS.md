# Rebuild Progress — Task 1: DB 스키마 교체

날짜: 2026-06-11
브랜치: `rebuild`

## 완료한 작업

### Task 1-1 · `src/lib/db.types.ts` 전면 교체
- 기존 수작업 타입(ProfileRole / CreatorGrade(A~E) / CampaignStatus(draft|recruiting|live|completed) / MissionType / ApplicationStatus(applied|accepted) / SubmissionStatus(making|review) 등)을 새 기획 스키마로 완전 교체.
- 새 enum: `Role` / `Grade(S~E)` / `Platform` / `ContentType(live|longform|shortform)` / `CampaignStatus(draft|pending|active|in_progress|reviewing|completed|cancelled)` / `MissionStatus` / `ApplicationStatus(confirmed|completed|rejected)` / `SubmissionStatus(pending|approved|rejected)` / `PaymentStatus(pending|processing|completed)` / `BatchStatus`.
- 새 테이블 인터페이스: `Profile` `Studio` `Creator` `CreatorChannel` `Campaign` `Mission` `Application` `Submission` `SettlementBatch` `Payment` + `*Row` 별칭.
- **주의:** 새 스키마는 기존 `Database`(Supabase 중첩 타입)와 `CampaignThumbnailJson`을 의도적으로 제거함 → 데이터 계층 다수 파일이 영향을 받음(아래 "남은 에러" 참고).

### Task 1-2 · `src/lib/pricing.ts` 신규 생성
- `RATE_MATRIX` (Grade × ContentType 단가), `toStudioAmount`(÷0.7 역산), `getMaxRate`, `subscribersToGrade`, `PLATFORM_CONTENT_TYPES`.

### Task 1-3 · 타입 에러 정리 (범위 내 enum 마이그레이션)
적용한 매핑:
- `CreatorGrade` → `Grade` (이름 교체, `Record<Grade>`에는 `S` 등급 항목 추가)
- `MissionType` → `ContentType`
- `CampaignStatus`: `recruiting` → `active`, `live` → `in_progress`
- `ApplicationStatus`: `applied` → `confirmed`, `accepted` → `completed`
- `SubmissionStatus`: `making`·`review` → `pending`(병합), `paid` 항목 제거
- `PaymentStatus`: `processing` 항목 추가 (라벨/필터/카운트)

수정한 파일 (12개):
- `src/app/admin/_components/ReviewQueue.tsx`
- `src/app/admin/AdminOverviewClient.tsx`
- `src/app/admin/campaigns/page.tsx`
- `src/app/admin/creators/page.tsx`
- `src/app/admin/payouts/page.tsx`
- `src/app/creator/activity/page.tsx`
- `src/app/creator/earnings/page.tsx`
- `src/app/creator/profile/page.tsx`
- `src/app/studio/applicants/page.tsx`
- `src/app/studio/creators/page.tsx`
- `src/app/studio/payments/page.tsx`
- `src/app/studio/review/page.tsx`

> 상태 매핑은 lossy(다대일·항목 삭제)하여 일부 UI 상태 구분이 합쳐졌습니다.
> 예) creator/activity·studio/review의 "제작 중/검수 중/정산 완료" → "진행 중/검수 중" 단일 상태로 축소.
> 비즈니스 흐름 확정 시 재검토 필요.

## 남은 타입 에러: **60건** (`npx tsc --noEmit` 기준)

이번 Task 1 범위에서 의도적으로 보류한 항목들입니다(사용자 결정: Database/필드 파급은 Task 2로 이관).

| 코드 | 건수 | 내용 | 처리 계획 |
|------|------|------|-----------|
| TS2305 | 17 | db.types에 더 이상 없는 `Database`(12) · `CampaignThumbnailJson`(5) import | **Task 2** — 데이터 계층 재구성 |
| TS2339 | 28 | 사라진/변경된 필드 참조: `Campaign.name/developer/genre/spent_budget/target_creators`, `Studio.name/description`, `Payment.amount/paid_at/platform_fee` 등 | **Task 2** — 새 인터페이스 필드명으로 정렬 |
| TS2307 | 8 | 외부 모듈 미설치: `@sentry/nextjs`(6) · `@vercel/analytics/react`(1) · `resend`(1) | **건드리지 않음** (Sentry/Analytics/Email — `npm install`로 별도 해결) |
| TS7006 | 6 | 암시적 any 파라미터 (`transformDbCampaign.ts`, `admin/studios`) — Database 부재의 연쇄 | Task 2에서 Database 복구 시 동반 해소 |
| TS7053 | 1 | `admin/campaigns` 인덱싱 any — 동일 연쇄 | Task 2 |

### 영향 파일 (남은 에러)
- 데이터 계층: `src/lib/supabase/{client,server,middleware,hooks}.ts`, `src/lib/api/transformDbCampaign.ts`, `src/app/api/webhooks/db/route.ts`
- `Database`/필드 의존 페이지: `admin/campaigns`, `admin/studios`, `admin/creators`, `creator/page`, `creator/profile`, `creator/earnings`, `studio/creators`
- `CampaignThumbnailJson` 의존: `ReviewQueue`, `admin/campaigns`, `creator/activity`, `studio/review`
- 외부 모듈: `next.config.ts`, `sentry.*.config.ts`, `instrumentation*.ts`, `global-error.tsx`, `layout.tsx`, `lib/email/resend.ts`

## 참고
- 레거시 mock 레이어(`src/lib/mockCreators.ts`, `src/lib/mockData.ts`)는 **자체** `CreatorGrade`/`MissionType` 타입을 보유 — db.types와 무관하며 이번 교체 대상 아님. 추후 mock 제거 시 정리.
- Sentry/Analytics/SEO/이메일 관련 파일은 TASK 지시대로 일절 수정하지 않음.

## 다음 단계 (Task 2 제안)
1. 새 스키마 기준 `Database` 타입 재생성(또는 Supabase gen types) 및 supabase 클라이언트 제네릭 복구.
2. `Campaign`/`Studio`/`Payment` 필드 참조를 새 필드명으로 정렬, `CampaignThumbnailJson` 대체 처리.
3. 누락 의존성 설치 여부 결정(`@sentry/nextjs`, `@vercel/analytics`, `resend`).
