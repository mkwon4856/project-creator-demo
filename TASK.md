# Project Creator — rebuild Task 12
## 크레딧(예산 충전) 시스템 + 24시간 홀드 통합

목표: 게임사가 예산을 선불 충전 → 캠페인 생성 시 홀딩 → 검수 승인 후 홀드기간 경과 시 크리에이터 지급 → 캠페인 완료 시 미집행분 복귀.

핵심 흐름:
```
charge   게임사 크레딧 충전              available ↑, total_charged ↑
hold     캠페인 생성 시 예산 홀딩         available ↓, held ↑
approve  검수 승인 시 approved_at 기록    (아직 지급 X, held 유지)
payout   홀드기간 경과 후 조회 시점 지급  held ↓ (해당 미션 단가)
release  캠페인 completed 시 미집행분 복귀 held ↓, available ↑
```

홀드기간: 상수로 분리 (기본 24시간, 시연 시 변경 가능)
payout 실행 방식: 조회 시점 처리 (cron 없음). 크리에이터 수익 페이지 또는 admin 진입 시 "홀드 끝난 approved submission"을 그 순간 payout 처리.

디자인: 다크 #0A0A0F / #9B7EC8 / #E5B567 / Arial Black

---

## Phase 1: DB 스키마 + 함수 (SQL 파일)

supabase/migrations/20260611000002_credits.sql 파일 생성.

### 1-1. 테이블

```sql
-- 게임사 크레딧 잔액
CREATE TABLE IF NOT EXISTS studio_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_charged bigint NOT NULL DEFAULT 0,
  available bigint NOT NULL DEFAULT 0 CHECK (available >= 0),
  held bigint NOT NULL DEFAULT 0 CHECK (held >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 크레딧 거래 내역
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('charge','hold','release','payout','refund')),
  amount bigint NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz DEFAULT now()
);
```

### 1-2. submissions에 지급 추적 컬럼 추가

```sql
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS paid_at timestamptz;
```
(approved_at: 검수 승인 시각 / paid_at: 실제 크레딧 지급 처리 시각)

### 1-3. 함수 (전부 SECURITY DEFINER)

① charge_credits(p_studio_id uuid, p_amount bigint)
- studio_credits upsert: 없으면 insert, 있으면 total_charged += amount, available += amount, updated_at = now()
- credit_transactions insert (type='charge', amount)
- 반환: 갱신된 available

② hold_credits(p_studio_id uuid, p_amount bigint, p_campaign_id uuid)
- available >= amount 확인, 부족 시 RAISE EXCEPTION '크레딧 잔액이 부족합니다'
- available -= amount, held += amount, updated_at = now()
- credit_transactions insert (type='hold', amount, campaign_id)

③ payout_credits(p_studio_id uuid, p_amount bigint, p_campaign_id uuid)
- held >= amount 확인, 부족 시 RAISE EXCEPTION '홀딩 잔액이 부족합니다'
- held -= amount, updated_at = now()
- credit_transactions insert (type='payout', amount, campaign_id)

④ release_credits(p_studio_id uuid, p_amount bigint, p_campaign_id uuid)
- 미집행 held를 available로 복귀
- held -= amount (음수 방지: amount = LEAST(amount, held)), available += amount, updated_at = now()
- credit_transactions insert (type='release', amount, campaign_id)

### 1-4. RLS + GRANT
- studio_credits: 본인 studio_id만 SELECT (auth.uid() = studio_id). INSERT/UPDATE는 함수(SECURITY DEFINER)로만 → 직접 권한 부여 안 함
- credit_transactions: 본인만 SELECT
- 함수들 GRANT EXECUTE TO authenticated
- 두 테이블 RLS ENABLE, SELECT 정책만 authenticated에 부여

---

## Phase 2: 홀드기간 상수 + 유틸

src/lib/credits.ts 생성:

```typescript
// 홀드 기간 (시연 시 이 값만 바꾸면 됨. 실서비스 24)
export const HOLD_DURATION_HOURS = 24

// approved_at 기준 홀드 종료 시각
export function getHoldReleaseTime(approvedAt: string): Date {
  return new Date(new Date(approvedAt).getTime() + HOLD_DURATION_HOURS * 3600 * 1000)
}

// 홀드 종료 여부
export function isHoldExpired(approvedAt: string): boolean {
  return Date.now() >= getHoldReleaseTime(approvedAt).getTime()
}

// 남은 홀드 시간 (밀리초, 음수면 0)
export function getHoldRemainingMs(approvedAt: string): number {
  return Math.max(0, getHoldReleaseTime(approvedAt).getTime() - Date.now())
}

export function formatHoldRemaining(approvedAt: string): string {
  const ms = getHoldRemainingMs(approvedAt)
  if (ms <= 0) return '지급 가능'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 0) return `${h}시간 ${m}분 후 지급`
  return `${m}분 후 지급`
}
```

---

## Phase 3: API Routes

createClient는 기존 서버 패턴(src/lib/supabase/server.ts) 사용. 금액은 전부 정수(원).

① src/app/api/credits/charge/route.ts (POST)
- body { amount } (최소 100000)
- auth로 로그인 유저 확인, role='studio' 확인 (profiles 조회)
- charge_credits RPC 호출
- 성공 { success:true, available }, 실패 적절한 에러

② src/app/api/credits/balance/route.ts (GET)
- 로그인 studio의 studio_credits 조회
- 없으면 { total_charged:0, available:0, held:0 }

③ src/app/api/credits/process-payouts/route.ts (POST)
- 로그인 크리에이터의 approved이고 paid_at IS NULL인 submission들 조회
  (submissions → applications(creator_id) → missions(creator_amount, campaign_id) → campaigns(studio_id) 조인)
- 각 건에 대해 approved_at 기준 isHoldExpired면:
  - payout_credits(studio_id, creator_amount, campaign_id) RPC
  - submissions.paid_at = now() update
  - payments insert (creator_id, submission_id, base_amount=creator_amount, total_before_tax, withholding_tax=round(amount*0.033), net_amount=amount-withholding, status='completed', settlement_batch_id는 해당 연월 batch 없으면 생성 후 연결)
- 처리된 건수, 총 지급액 반환

---

## Phase 4: 캠페인 생성 연동 (hold)

캠페인 생성 흐름(src/app/studio/new/page.tsx의 handleSubmit, 또는 createCampaign API)에 hold 추가:
- 캠페인 insert 성공 후 campaign.id 확보
- hold_credits(studio_id, total_budget, campaign_id) RPC 호출
- 잔액 부족(에러)이면: 생성된 캠페인 롤백(삭제) 또는 status='draft' 유지하고 사용자에게 "크레딧 잔액이 부족합니다. 충전 후 다시 시도해주세요" alert + 충전 모달 안내
- 성공이면 기존대로 진행

주의: 캠페인 insert와 hold가 둘 다 성공해야 함. hold 실패 시 방금 만든 campaign + missions 삭제(정리)해서 유령 캠페인 안 남기기.

---

## Phase 5: 검수 승인 시 approved_at 기록 (payout 아님)

src/app/admin/payouts/page.tsx의 handleApprove 수정:
- submissions update에 approved_at = now() 추가 (기존 status='approved', reviewed_at 유지)
- 여기서는 크레딧 payout 안 함. 홀드기간 경과 후 process-payouts에서 처리.

---

## Phase 6: 캠페인 완료 시 release

캠페인을 completed로 바꾸는 지점(admin에서 캠페인 상태 변경 기능이 있으면 그곳, 없으면 admin/campaigns에 "캠페인 완료 처리" 버튼 추가):
- 해당 캠페인의 hold된 총액 중 이미 payout된 금액을 뺀 나머지(미집행분)를 release_credits로 복귀
- 미집행분 = (캠페인의 hold 거래 합) - (해당 캠페인 payout 거래 합)
- campaigns.status = 'completed', completed_at = now()

admin/campaigns 카드에 active/in_progress/reviewing 상태인 캠페인에 "완료 처리" 버튼 추가.

---

## Phase 7: UI

### 7-1. CreditBalance 카드 — src/components/studio/CreditBalance.tsx
- /api/credits/balance 호출
- 사용 가능(available) 강조 / 홀딩 중(held) 회색 / 누적 충전(total_charged) 작게
- 원화 포맷 (1,500,000원)
- "충전하기" 버튼 → ChargeModal 열기

### 7-2. ChargeModal — src/components/studio/ChargeModal.tsx
- 프리셋: 100만/300만/500만/1000만 + 직접입력(최소 10만)
- "테스트 충전" 라벨 (PG 미연동 안내)
- /api/credits/charge POST → 성공 시 잔액 새로고침
- 에러 표시

### 7-3. 게임사 대시보드에 CreditBalance 배치
- src/app/studio/page.tsx 상단(헤더 아래)에 CreditBalance 카드 추가
- 기존 "잔여 예산: studio.balance" 표시는 제거하고 CreditBalance로 대체

### 7-4. 크리에이터 수익 페이지 연동
- src/app/creator/earnings/page.tsx 진입 시 /api/credits/process-payouts POST 자동 호출(홀드 끝난 건 지급 처리) 후 데이터 로드
- 수익 구분 표시:
  - 지급 완료 (paid_at 있음, payments 기준)
  - 지급 대기 (approved이고 홀드 진행 중) → formatHoldRemaining으로 "N시간 후 지급" 표시
  - 검수 대기 (pending)

### 7-5. 크리에이터 activity에도 홀드 상태 표시(선택)
- approved 건에 "지급까지 N시간" 또는 "지급 완료" 뱃지

---

## Phase 8: 검증 + 시연 데이터

1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: credit system with 24h hold cycle" && git push origin rebuild
4. DEMO_GUIDE.md 업데이트: 충전 단계 추가, 홀드 시연 방법(HOLD_DURATION_HOURS 조정) 안내
5. GAPS.md 업데이트: PG 미연동(테스트 충전), payout 조회시점 처리(cron 아님) 명시

최종 보고:
- 민석이 실행할 SQL 파일 경로 (20260611000002_credits.sql)
- 시연 전 게임사 계정에 충전하는 법
- HOLD_DURATION_HOURS 시연용 변경 위치
