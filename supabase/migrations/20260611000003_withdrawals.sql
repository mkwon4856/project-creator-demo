-- ============================================================================
-- Project Creator — 정산 모델 변경: 조회 시점 자동지급 → 출금 신청식(적립식)
-- ============================================================================
-- 새 흐름:
--   검수 승인  → add_pending(creator)        : pending += amount, total_earned += amount
--   홀드 종료  → accrue_submission(submission): 게임사 held 차감(payout_credits 유지)
--                                              + creator pending → available 이동
--   출금 신청  → request_withdrawal(creator)  : available 차감, 원천징수 3.3%, 출금내역 기록
--
-- 정산 정보(주민번호/사업자번호/계좌)는 이번 범위 밖(세무사 자문 전). 컬럼/UI 자리만.
-- 이 파일은 20260611000002_credits.sql 적용 후 실행한다.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── 1-1. creator_balances — 크리에이터 잔액 ─────────────────────────────────
create table if not exists public.creator_balances (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null unique references public.creators(id) on delete cascade,
  available       bigint not null default 0 check (available >= 0),  -- 출금 가능(홀드 종료 적립분)
  pending         bigint not null default 0 check (pending >= 0),    -- 적립 대기(홀드 진행 중)
  total_earned    bigint not null default 0,                         -- 누적 수익
  total_withdrawn bigint not null default 0,                         -- 누적 출금(세전)
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 1-2. withdrawals — 출금 신청 내역 ───────────────────────────────────────
create table if not exists public.withdrawals (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references public.creators(id) on delete cascade,
  amount          bigint not null check (amount > 0),  -- 출금 신청 총액(세전)
  withholding_tax bigint not null default 0,           -- 원천징수 3.3%
  net_amount      bigint not null,                     -- 실수령액
  status          text not null default 'requested'
                    check (status in ('requested','processing','completed','rejected')),
  requested_at    timestamptz default now(),
  processed_at    timestamptz,
  note            text
);

create index if not exists idx_withdrawals_creator on public.withdrawals(creator_id);

-- ============================================================================
-- 1-4. 함수 (전부 SECURITY DEFINER)
-- ============================================================================

-- ① add_pending — 검수 승인 시 적립 대기에 반영. pending += amount, total_earned += amount
create or replace function public.add_pending(p_creator_id uuid, p_amount bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    return;
  end if;

  insert into public.creator_balances (creator_id, pending, total_earned)
  values (p_creator_id, p_amount, p_amount)
  on conflict (creator_id) do update
    set pending      = public.creator_balances.pending + p_amount,
        total_earned = public.creator_balances.total_earned + p_amount,
        updated_at   = now();
end;
$$;

-- ② accrue_to_balance — 홀드 종료분을 available로 확정. pending -= amount, available += amount
--    (total_earned은 add_pending에서 이미 반영됐으므로 여기선 건드리지 않는다)
create or replace function public.accrue_to_balance(p_creator_id uuid, p_amount bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    return;
  end if;

  insert into public.creator_balances (creator_id, available, pending)
  values (p_creator_id, p_amount, 0)
  on conflict (creator_id) do update
    set available  = public.creator_balances.available + p_amount,
        pending    = greatest(0, public.creator_balances.pending - p_amount),
        updated_at = now();
end;
$$;

-- ③ accrue_submission — 홀드 종료된 제출 한 건을 적립 처리하는 오케스트레이터.
--    (홀드 경과 판정은 호출자(JS, HOLD_DURATION_HOURS)에서 하고, 여기선 실제 적립/기록.)
--    게임사: payout_credits(held 차감, 집행 확정) 유지.
--    크리에이터: accrue_to_balance(pending → available).
--    submissions.paid_at 을 "적립 완료" 마커로 재사용해 멱등 보장.
create or replace function public.accrue_submission(p_submission_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator_id  uuid;
  v_campaign_id uuid;
  v_studio_pid  uuid;
  v_amount      bigint;
  v_status      text;
  v_paid_at     timestamptz;
begin
  select s.status, s.paid_at, m.creator_amount, m.campaign_id, a.creator_id, st.profile_id
    into v_status, v_paid_at, v_amount, v_campaign_id, v_creator_id, v_studio_pid
  from public.submissions s
  join public.missions m     on m.id = s.mission_id
  join public.applications a on a.id = s.application_id
  join public.campaigns c    on c.id = m.campaign_id
  join public.studios st     on st.id = c.studio_id
  where s.id = p_submission_id;

  -- 승인 상태 + 미적립(paid_at NULL) 건만 처리 (멱등)
  if v_status is distinct from 'approved' or v_paid_at is not null then
    return 0;
  end if;

  -- 게임사 홀드분 집행 확정 (held 감소 + 거래기록)
  perform public.payout_credits(v_studio_pid, v_amount, v_campaign_id);

  -- 크리에이터 적립 대기 → 출금 가능 이동
  perform public.accrue_to_balance(v_creator_id, v_amount);

  -- 적립 완료 마커
  update public.submissions set paid_at = now() where id = p_submission_id;

  return v_amount;
end;
$$;

-- ④ request_withdrawal — 출금 신청. available 차감 + 원천징수 + 출금내역 기록.
create or replace function public.request_withdrawal(p_creator_id uuid, p_amount bigint)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_min       bigint := 10000;  -- 최소 출금 금액(1만원)
  v_available bigint;
  v_tax       bigint;
  v_net       bigint;
  v_id        uuid;
begin
  if p_amount < v_min then
    raise exception '최소 출금 금액은 % 원입니다', v_min;
  end if;

  select available into v_available
    from public.creator_balances
    where creator_id = p_creator_id
    for update;

  if v_available is null or v_available < p_amount then
    raise exception '출금 가능 잔액이 부족합니다';
  end if;

  v_tax := round(p_amount * 0.033);
  v_net := p_amount - v_tax;

  update public.creator_balances
    set available       = available - p_amount,
        total_withdrawn = total_withdrawn + p_amount,
        updated_at      = now()
    where creator_id = p_creator_id;

  insert into public.withdrawals (creator_id, amount, withholding_tax, net_amount, status)
  values (p_creator_id, p_amount, v_tax, v_net, 'requested')
  returning id into v_id;

  return v_id;
end;
$$;

-- ============================================================================
-- 1-5. RLS + GRANT
-- ============================================================================
alter table public.creator_balances enable row level security;
alter table public.withdrawals      enable row level security;

-- creator_balances: 본인(creator) 것만 SELECT. INSERT/UPDATE는 SECURITY DEFINER 함수로만.
drop policy if exists creator_balances_select on public.creator_balances;
create policy creator_balances_select on public.creator_balances
  for select to authenticated
  using (
    creator_id in (
      select c.id from public.creators c where c.profile_id = auth.uid()
    )
  );

-- withdrawals: 본인 것만 SELECT. INSERT는 함수(request_withdrawal)로만.
drop policy if exists withdrawals_select on public.withdrawals;
create policy withdrawals_select on public.withdrawals
  for select to authenticated
  using (
    creator_id in (
      select c.id from public.creators c where c.profile_id = auth.uid()
    )
  );

grant select on public.creator_balances to authenticated;
grant select on public.withdrawals      to authenticated;

grant execute on function public.add_pending(uuid, bigint)        to authenticated;
grant execute on function public.accrue_to_balance(uuid, bigint)  to authenticated;
grant execute on function public.accrue_submission(uuid)          to authenticated;
grant execute on function public.request_withdrawal(uuid, bigint) to authenticated;

-- ============================================================================
-- 끝. (20260611000002_credits.sql 적용 후 이 파일을 실행)
-- ============================================================================
