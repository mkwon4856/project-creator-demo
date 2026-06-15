# Project Creator — rebuild Task 15
## 정산: 조회 시점 자동지급 → 출금 신청식(적립식)으로 변경

배경: 기획이 "검수 승인 후 홀드 끝나면 자동 지급"에서 "크리에이터 잔액으로 적립 → 본인이 출금 신청 시 지급"으로 변경됨.
이번 작업 범위(b): 출금 신청 UI + 잔액/적립/출금 흐름만 구현. 정산 정보(주민번호/사업자번호/계좌) 실제 수집 필드는 자리만 잡고 실제 수집/검증은 하지 않는다(세무사 자문 전).

디자인: 다크 #0A0A0F / #9B7EC8 / #E5B567 / Arial Black

---

## Phase 0: 현재 상태 진단 (코드 수정 없이 보고)

1. src/lib/credits.ts — HOLD_DURATION_HOURS, payout 관련 함수 현재 내용
2. src/app/api/credits/process-payouts/route.ts — 현재 "조회 시점 자동 지급" 로직이 어떻게 되어있는지
3. src/app/creator/earnings/page.tsx — 현재 수익 페이지가 process-payouts를 자동 호출하는지
4. supabase/migrations/20260611000002_credits.sql — payout_credits 함수, submissions.paid_at 컬럼
5. payments 테이블 스키마 (net_amount, withholding_tax 등)

보고 후 Phase 1~4 진행.

---

## Phase 1: DB — 출금 신청 테이블 + 크리에이터 잔액

supabase/migrations/20260611000003_withdrawals.sql 생성.

### 1-1. creator_balances 테이블 (크리에이터 잔액)
```sql
CREATE TABLE IF NOT EXISTS creator_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL UNIQUE REFERENCES creators(id) ON DELETE CASCADE,
  available bigint NOT NULL DEFAULT 0 CHECK (available >= 0),  -- 출금 가능 (홀드 끝나고 적립된 금액)
  pending bigint NOT NULL DEFAULT 0 CHECK (pending >= 0),      -- 적립 대기 (홀드 진행 중)
  total_earned bigint NOT NULL DEFAULT 0,                      -- 누적 수익
  total_withdrawn bigint NOT NULL DEFAULT 0,                   -- 누적 출금
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 1-2. withdrawals 테이블 (출금 신청 내역)
```sql
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  amount bigint NOT NULL CHECK (amount > 0),          -- 출금 신청 총액(세전)
  withholding_tax bigint NOT NULL DEFAULT 0,          -- 원천징수 3.3%
  net_amount bigint NOT NULL,                         -- 실수령액
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','processing','completed','rejected')),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  note text
);
```

### 1-3. 최소 출금 금액 상수
- MIN_WITHDRAWAL_AMOUNT = 10000 (1만원) — src/lib/credits.ts에 추가

### 1-4. 함수 (SECURITY DEFINER)
① accrue_to_balance(p_creator_id uuid, p_amount bigint)
- creator_balances upsert: pending에서 빼고 available로 이동 (홀드 종료 시 호출)
- 정확히는: available += amount, pending = GREATEST(0, pending - amount), total_earned는 pending 적립 시점에 이미 더해졌으면 중복 금지
- 단순화: 이 함수는 "홀드 끝난 금액을 available로 확정"하는 용도. pending -= amount, available += amount

② add_pending(p_creator_id uuid, p_amount bigint)
- 검수 승인 시 호출. pending += amount, total_earned += amount

③ request_withdrawal(p_creator_id uuid, p_amount bigint)
- available >= amount 확인, 부족 시 RAISE EXCEPTION '출금 가능 잔액이 부족합니다'
- amount >= 최소출금액 확인 (함수 인자로 받거나 10000 하드코딩), 미만 시 RAISE EXCEPTION
- available -= amount
- withholding = round(amount * 0.033), net = amount - withholding
- withdrawals insert (status='requested', amount, withholding_tax, net_amount)
- total_withdrawn += amount
- 반환: 생성된 withdrawal id

### 1-5. RLS + GRANT
- creator_balances: 본인만 SELECT
- withdrawals: 본인만 SELECT, INSERT는 함수로만
- 함수 GRANT EXECUTE TO authenticated

---

## Phase 2: 검수 승인 → pending 적립 (자동지급 제거)

### 2-1. process-payouts 로직 변경
src/app/api/credits/process-payouts/route.ts 를 "홀드 종료분을 available로 적립"하는 용도로 변경:
- 기존: 홀드 끝난 submission을 payout(크리에이터에게 바로 지급) → 제거
- 변경: approved이고 홀드 종료됐고 아직 balance에 반영 안 된 submission을 찾아서
  - studio 측: payout_credits(홀드된 게임사 크레딧을 실제 차감 — 이건 유지, 게임사 입장에선 이미 집행 확정)
  - creator 측: accrue_to_balance(creator_id, creator_amount) — pending → available 이동
  - submissions.paid_at = now() (=balance 반영 완료 표시로 재사용, 또는 accrued_at 컬럼 신설)
- 즉 "지급"이 아니라 "출금 가능 잔액으로 전환"

### 2-2. 검수 승인 시 pending 적립
src/app/admin/payouts/page.tsx handleApprove에서:
- 기존 approved_at 기록 유지
- 추가로 add_pending(creator_id, creator_amount) 호출 → 크리에이터 pending(적립 대기)에 즉시 반영
- (홀드 종료 시 process-payouts가 pending→available로 옮김)

주의: creator_id, creator_amount는 submission→application→mission 조인으로 구함.

---

## Phase 3: 크리에이터 수익/출금 UI

### 3-1. 수익 페이지 재구성 — src/app/creator/earnings/page.tsx
페이지 진입 시 process-payouts POST 호출(홀드 종료분 available 전환) 후 데이터 로드.

표시:
- 상단 잔액 카드 3개:
  - 출금 가능 (available) — 강조, 골드
  - 적립 대기 (pending) — 회색, "검수 후 24시간 뒤 출금 가능" 안내
  - 누적 수익 (total_earned) — 작게
- "출금 신청" 버튼 → WithdrawModal 열기 (available > 0 이고 최소출금액 이상일 때만 활성)
- 출금 내역 리스트 (withdrawals): 신청일 / 금액(세전) / 원천징수 / 실수령 / 상태
- 수익 상세(선택): 승인된 submission별 금액 + 상태(적립 대기 / 출금 가능)

### 3-2. WithdrawModal — src/components/creator/WithdrawModal.tsx
- 출금 가능 잔액 표시
- 출금 금액 입력 (최소 1만원, 최대 available)
- "전액 출금" 버튼
- 원천징수 3.3% 차감 후 실수령액 미리보기 표시
  - 예: 100,000원 신청 → 원천징수 3,300원 → 실수령 96,700원
- "출금 신청" → request_withdrawal RPC 호출
- 성공 시 잔액/내역 새로고침, 모달 닫기
- 정산 정보(계좌 등) 미입력 시 안내: "출금을 위해 정산 정보 등록이 필요합니다" → 정산 정보 페이지로 유도 (3-3)

### 3-3. 정산 정보 — 자리만 (실제 수집/검증 X)
src/app/creator/settings/page.tsx 또는 creator/profile에 "정산 정보" 섹션 추가:
- 안내 문구만: "정산 정보(예금주, 계좌, 사업자 여부)는 서비스 정식 오픈 시 등록 가능합니다. (준비 중)"
- 입력 필드는 disabled 상태로 자리만 잡기: 사업자 여부(개인/개인사업자), 계좌번호, 예금주
- 실제 저장/검증 로직은 구현하지 않음 (세무사 자문 후 확정 예정)
- TODO 주석: // TODO(정산): 세무사 자문 후 수집 항목 확정 + PIPA 대응

---

## Phase 4: 검증

1. npx tsc --noEmit → 0 errors
2. npm run build → 성공
3. git add . && git commit -m "feat: withdrawal-request settlement model (accrual + withdraw)" && git push origin rebuild

최종 보고:
- Phase 0 진단 결과
- 변경된 흐름 요약 (검수 승인 → pending → 홀드 종료 → available → 출금 신청 → 지급대기)
- 민석이 실행할 SQL 파일 (20260611000003_withdrawals.sql)
- 정산 정보 수집이 "자리만" 잡힌 상태이며 세무사 자문 후 구현 예정임을 명시
