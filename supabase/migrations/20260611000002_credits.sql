-- ============================================================================
-- Project Creator — 크레딧(예산 충전) 시스템 + 24시간 홀드
-- ============================================================================
-- 흐름: charge → hold(캠페인 생성) → approve(approved_at 기록) →
--       payout(홀드 경과 후 조회 시점 지급) → release(캠페인 완료 시 미집행분 복귀)
--
-- studio_credits.studio_id = profiles(id) (= auth.uid()). 즉 크레딧의 주체는
-- 게임사 "프로필(유저) id"다. campaigns.studio_id(=studios.id)와 다르므로,
-- 지급/복귀 함수는 내부에서 campaigns→studios→studios.profile_id로 환원해 사용한다.
-- ============================================================================

create extension if not exists pgcrypto;

-- ── 1-1. 테이블 ──────────────────────────────────────────────────────────────
create table if not exists public.studio_credits (
  id            uuid primary key default gen_random_uuid(),
  studio_id     uuid not null unique references public.profiles(id) on delete cascade,
  total_charged bigint not null default 0,
  available     bigint not null default 0 check (available >= 0),
  held          bigint not null default 0 check (held >= 0),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  studio_id   uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('charge','hold','release','payout','refund')),
  amount      bigint not null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  note        text,
  created_at  timestamptz default now()
);

create index if not exists idx_credit_tx_studio   on public.credit_transactions(studio_id);
create index if not exists idx_credit_tx_campaign on public.credit_transactions(campaign_id);

-- ── 1-2. submissions 지급 추적 컬럼 ──────────────────────────────────────────
alter table public.submissions add column if not exists approved_at timestamptz;
alter table public.submissions add column if not exists paid_at     timestamptz;

-- ============================================================================
-- 1-3. 함수 (전부 SECURITY DEFINER)
-- ============================================================================

-- ① charge_credits — 크레딧 충전 (upsert)
create or replace function public.charge_credits(p_studio_id uuid, p_amount bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available bigint;
begin
  if p_amount <= 0 then
    raise exception '충전 금액이 올바르지 않습니다';
  end if;

  insert into public.studio_credits (studio_id, total_charged, available)
  values (p_studio_id, p_amount, p_amount)
  on conflict (studio_id) do update
    set total_charged = public.studio_credits.total_charged + p_amount,
        available     = public.studio_credits.available + p_amount,
        updated_at    = now()
  returning available into v_available;

  insert into public.credit_transactions (studio_id, type, amount, note)
  values (p_studio_id, 'charge', p_amount, '크레딧 충전');

  return v_available;
end;
$$;

-- ② hold_credits — 캠페인 생성 시 예산 홀딩 (available → held)
create or replace function public.hold_credits(p_studio_id uuid, p_amount bigint, p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available bigint;
begin
  select available into v_available from public.studio_credits where studio_id = p_studio_id for update;

  if v_available is null or v_available < p_amount then
    raise exception '크레딧 잔액이 부족합니다';
  end if;

  update public.studio_credits
    set available = available - p_amount,
        held      = held + p_amount,
        updated_at = now()
    where studio_id = p_studio_id;

  insert into public.credit_transactions (studio_id, type, amount, campaign_id, note)
  values (p_studio_id, 'hold', p_amount, p_campaign_id, '캠페인 예산 홀딩');
end;
$$;

-- ③ payout_credits — 홀드분에서 크리에이터 지급 (held 감소)
create or replace function public.payout_credits(p_studio_id uuid, p_amount bigint, p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_held bigint;
begin
  select held into v_held from public.studio_credits where studio_id = p_studio_id for update;

  if v_held is null or v_held < p_amount then
    raise exception '홀딩 잔액이 부족합니다';
  end if;

  update public.studio_credits
    set held = held - p_amount,
        updated_at = now()
    where studio_id = p_studio_id;

  insert into public.credit_transactions (studio_id, type, amount, campaign_id, note)
  values (p_studio_id, 'payout', p_amount, p_campaign_id, '크리에이터 지급');
end;
$$;

-- ④ release_credits — 미집행 held를 available로 복귀
create or replace function public.release_credits(p_studio_id uuid, p_amount bigint, p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_held    bigint;
  v_release bigint;
begin
  select held into v_held from public.studio_credits where studio_id = p_studio_id for update;
  if v_held is null then
    return;
  end if;

  v_release := least(p_amount, v_held); -- 음수 방지
  if v_release <= 0 then
    return;
  end if;

  update public.studio_credits
    set held      = held - v_release,
        available = available + v_release,
        updated_at = now()
    where studio_id = p_studio_id;

  insert into public.credit_transactions (studio_id, type, amount, campaign_id, note)
  values (p_studio_id, 'release', v_release, p_campaign_id, '미집행 예산 복귀');
end;
$$;

-- ⑤ process_submission_payout — 조회 시점 지급 처리 오케스트레이터
--    (홀드 경과 판정은 호출자(JS, HOLD_DURATION_HOURS)에서 하고, 여기서는 실제 지급/기록.)
--    RLS를 우회해 payout_credits 호출 + submissions.paid_at + settlement_batch + payments 기록.
create or replace function public.process_submission_payout(p_submission_id uuid)
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
  v_year        int := extract(year from now());
  v_month       int := extract(month from now());
  v_batch_id    uuid;
  v_tax         bigint;
  v_net         bigint;
begin
  -- 제출 + 미션 + 신청자 + 캠페인 + 게임사 프로필 환원
  select s.status, s.paid_at, m.creator_amount, m.campaign_id, a.creator_id, st.profile_id
    into v_status, v_paid_at, v_amount, v_campaign_id, v_creator_id, v_studio_pid
  from public.submissions s
  join public.missions m       on m.id = s.mission_id
  join public.applications a   on a.id = s.application_id
  join public.campaigns c      on c.id = m.campaign_id
  join public.studios st       on st.id = c.studio_id
  where s.id = p_submission_id;

  -- 승인 상태 + 미지급 건만 처리 (멱등)
  if v_status is distinct from 'approved' or v_paid_at is not null then
    return 0;
  end if;

  -- 홀드분에서 지급 (held 감소 + 거래기록)
  perform public.payout_credits(v_studio_pid, v_amount, v_campaign_id);

  -- 지급 시각 기록
  update public.submissions set paid_at = now() where id = p_submission_id;

  -- 연/월 정산 배치 find-or-create
  select id into v_batch_id from public.settlement_batches where year = v_year and month = v_month limit 1;
  if v_batch_id is null then
    insert into public.settlement_batches (year, month, status)
    values (v_year, v_month, 'completed')
    returning id into v_batch_id;
  end if;

  -- 원천징수 3.3%
  v_tax := round(v_amount * 0.033);
  v_net := v_amount - v_tax;

  insert into public.payments (
    creator_id, settlement_batch_id, submission_id,
    base_amount, bonus_amount, total_before_tax, withholding_tax, net_amount,
    tax_invoice_issued, status
  ) values (
    v_creator_id, v_batch_id, p_submission_id,
    v_amount, 0, v_amount, v_tax, v_net,
    false, 'completed'
  );

  update public.settlement_batches
    set total_amount  = total_amount + v_net,
        creator_count = creator_count + 1
    where id = v_batch_id;

  return v_net;
end;
$$;

-- ⑥ release_campaign — 캠페인 완료 처리(미집행분 복귀 + 상태 변경) 오케스트레이터
--    미집행분 = 해당 캠페인 hold 합 - payout 합 - release 합. RLS 우회 필요(관리자가 호출).
create or replace function public.release_campaign(p_campaign_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_studio_pid uuid;
  v_held       bigint := 0;
  v_paid       bigint := 0;
  v_released   bigint := 0;
  v_unspent    bigint;
begin
  select st.profile_id into v_studio_pid
  from public.campaigns c
  join public.studios st on st.id = c.studio_id
  where c.id = p_campaign_id;

  if v_studio_pid is null then
    raise exception '캠페인의 게임사를 찾을 수 없습니다';
  end if;

  select
    coalesce(sum(amount) filter (where type = 'hold'), 0),
    coalesce(sum(amount) filter (where type = 'payout'), 0),
    coalesce(sum(amount) filter (where type = 'release'), 0)
  into v_held, v_paid, v_released
  from public.credit_transactions
  where campaign_id = p_campaign_id;

  v_unspent := v_held - v_paid - v_released;
  if v_unspent > 0 then
    perform public.release_credits(v_studio_pid, v_unspent, p_campaign_id);
  end if;

  update public.campaigns
    set status = 'completed', completed_at = now()
    where id = p_campaign_id;

  return greatest(v_unspent, 0);
end;
$$;

-- ============================================================================
-- 1-4. RLS + GRANT
-- ============================================================================
alter table public.studio_credits      enable row level security;
alter table public.credit_transactions enable row level security;

-- 본인 studio_id(=auth.uid())만 SELECT. INSERT/UPDATE는 SECURITY DEFINER 함수로만.
drop policy if exists studio_credits_select on public.studio_credits;
create policy studio_credits_select on public.studio_credits
  for select to authenticated using (auth.uid() = studio_id);

drop policy if exists credit_tx_select on public.credit_transactions;
create policy credit_tx_select on public.credit_transactions
  for select to authenticated using (auth.uid() = studio_id);

-- 두 테이블 SELECT 권한만 authenticated에 부여 (INSERT/UPDATE 직접 권한 없음)
grant select on public.studio_credits      to authenticated;
grant select on public.credit_transactions to authenticated;

-- 함수 실행 권한
grant execute on function public.charge_credits(uuid, bigint)            to authenticated;
grant execute on function public.hold_credits(uuid, bigint, uuid)        to authenticated;
grant execute on function public.payout_credits(uuid, bigint, uuid)      to authenticated;
grant execute on function public.release_credits(uuid, bigint, uuid)     to authenticated;
grant execute on function public.process_submission_payout(uuid)         to authenticated;
grant execute on function public.release_campaign(uuid)                  to authenticated;

-- ============================================================================
-- 끝. (20260611000001_demo_ready.sql 적용 후 이 파일을 실행)
-- ============================================================================
