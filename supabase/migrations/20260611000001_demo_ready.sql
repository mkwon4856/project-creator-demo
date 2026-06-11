-- ============================================================================
-- Project Creator — Demo-Ready Migration (rebuild)
-- ============================================================================
-- 새 기획 스키마(src/lib/db.types.ts)에 정확히 맞춘 단일 정합 파일.
-- 실제 코드가 날리는 쿼리(Phase 1 감사 결과)를 기준으로 테이블·함수·RLS를 구성한다.
--
-- 실행 대상: **새(fresh) Supabase 프로젝트** 권장.
--   기존 구 스키마(supabase/schema.sql: user_id/content_url/rate_* 등)가 이미
--   적용된 프로젝트라면, 컬럼명이 달라 충돌하므로 아래 "구 스키마 제거" 블록의
--   주석을 해제해 구 테이블을 먼저 드롭한 뒤 실행하라. (데모 데이터는 사라진다.)
--
-- 멱등성: 함수/정책은 CREATE OR REPLACE / DROP IF EXISTS, 테이블은 IF NOT EXISTS.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ── (선택) 구 스키마 제거 — 구 schema.sql이 적용된 프로젝트에서만 주석 해제 ──
-- drop table if exists public.payments cascade;
-- drop table if exists public.submissions cascade;
-- drop table if exists public.applications cascade;
-- drop table if exists public.missions cascade;
-- drop table if exists public.campaigns cascade;
-- drop table if exists public.creators cascade;
-- drop table if exists public.studios cascade;
-- drop table if exists public.profiles cascade;

-- ============================================================================
-- 1. TABLES (새 스키마)
-- ============================================================================

-- profiles — auth.users 확장. 트리거가 생성(아래 handle_new_user).
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'creator' check (role in ('studio', 'creator', 'admin')),
  created_at timestamptz not null default now()
);

-- studios — 게임사 프로필 (가입 시 AuthForm이 insert)
create table if not exists public.studios (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  company_name    text not null,
  contact_name    text,
  business_number text,
  balance         bigint not null default 0,
  created_at      timestamptz not null default now()
);

-- creators — 크리에이터 프로필 (가입 시 AuthForm이 insert)
create table if not exists public.creators (
  id                       uuid primary key default uuid_generate_v4(),
  profile_id               uuid not null references public.profiles(id) on delete cascade,
  name                     text not null,
  bio                      text,
  business_registration_no text,
  created_at               timestamptz not null default now()
);

-- creator_channels — 채널별 등급/구독자 (creator/profile 페이지에서 등록)
create table if not exists public.creator_channels (
  id           uuid primary key default uuid_generate_v4(),
  creator_id   uuid not null references public.creators(id) on delete cascade,
  platform     text not null check (platform in ('youtube', 'soop', 'chzzk', 'tiktok')),
  channel_name text not null,
  channel_url  text,
  subscribers  bigint not null default 0,
  grade        text not null default 'E' check (grade in ('S', 'A', 'B', 'C', 'D', 'E')),
  content_type text not null check (content_type in ('live', 'longform', 'shortform')),
  verified_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- campaigns
create table if not exists public.campaigns (
  id                   uuid primary key default uuid_generate_v4(),
  studio_id            uuid not null references public.studios(id) on delete cascade,
  title                text not null,
  game_name            text not null default '',
  genre                text,
  description          text,
  thumbnail_url        text,
  total_budget         bigint not null default 0,
  remaining_budget     bigint not null default 0,
  auto_spend_remaining boolean not null default false,
  status               text not null default 'draft'
    check (status in ('draft', 'pending', 'active', 'in_progress', 'reviewing', 'completed', 'cancelled')),
  admin_note           text,
  created_at           timestamptz not null default now(),
  launched_at          timestamptz,
  completed_at         timestamptz
);

-- missions
create table if not exists public.missions (
  id                uuid primary key default uuid_generate_v4(),
  campaign_id       uuid not null references public.campaigns(id) on delete cascade,
  content_type      text not null check (content_type in ('live', 'longform', 'shortform')),
  allowed_grades    text[] not null default '{}',
  creator_amount    bigint not null default 0,
  studio_amount     bigint not null default 0,
  guide_draft       text,
  guide_approved    text,
  is_auto_generated boolean not null default false,
  status            text not null default 'open' check (status in ('open', 'filled', 'completed')),
  created_at        timestamptz not null default now()
);

-- applications — 크리에이터 지원
create table if not exists public.applications (
  id           uuid primary key default uuid_generate_v4(),
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  creator_id   uuid not null references public.creators(id) on delete cascade,
  content_type text not null check (content_type in ('live', 'longform', 'shortform')),
  mission_id   uuid references public.missions(id) on delete set null,
  status       text not null default 'confirmed' check (status in ('confirmed', 'completed', 'rejected')),
  applied_at   timestamptz not null default now(),
  confirmed_at timestamptz not null default now(),
  -- 같은 크리에이터가 같은 캠페인의 같은 콘텐츠 타입에 중복 지원 방지
  unique (creator_id, campaign_id, content_type)
);

-- submissions — 콘텐츠 제출 + 검수
create table if not exists public.submissions (
  id                   uuid primary key default uuid_generate_v4(),
  application_id       uuid not null references public.applications(id) on delete cascade,
  mission_id           uuid not null references public.missions(id) on delete cascade,
  platform_urls        jsonb not null default '[]'::jsonb,
  review_url_valid     boolean,
  review_type_match    boolean,
  review_duration_meet boolean,
  review_guide_meet    boolean,
  status               text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note           text,
  reviewed_at          timestamptz,
  created_at           timestamptz not null default now()
);

-- settlement_batches — 월별 정산 배치 (관리자)
create table if not exists public.settlement_batches (
  id            uuid primary key default uuid_generate_v4(),
  year          int not null,
  month         int not null,
  total_amount  bigint not null default 0,
  creator_count int not null default 0,
  status        text not null default 'pending' check (status in ('pending', 'processing', 'completed')),
  processed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- payments — 지급 내역
create table if not exists public.payments (
  id                  uuid primary key default uuid_generate_v4(),
  creator_id          uuid not null references public.creators(id) on delete cascade,
  settlement_batch_id uuid references public.settlement_batches(id) on delete set null,
  submission_id       uuid references public.submissions(id) on delete set null,
  base_amount         bigint not null default 0,
  bonus_amount        bigint not null default 0,
  total_before_tax    bigint not null default 0,
  withholding_tax     bigint not null default 0,
  net_amount          bigint not null default 0,
  tax_invoice_issued  boolean not null default false,
  status              text not null default 'pending' check (status in ('pending', 'processing', 'completed')),
  created_at          timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_studios_profile        on public.studios(profile_id);
create index if not exists idx_creators_profile       on public.creators(profile_id);
create index if not exists idx_channels_creator       on public.creator_channels(creator_id);
create index if not exists idx_campaigns_studio       on public.campaigns(studio_id);
create index if not exists idx_campaigns_status       on public.campaigns(status);
create index if not exists idx_missions_campaign      on public.missions(campaign_id);
create index if not exists idx_applications_creator   on public.applications(creator_id);
create index if not exists idx_applications_campaign  on public.applications(campaign_id);
create index if not exists idx_submissions_application on public.submissions(application_id);
create index if not exists idx_submissions_status     on public.submissions(status);
create index if not exists idx_payments_creator       on public.payments(creator_id);

-- ============================================================================
-- 2. handle_new_user — 가입 시 profiles만 생성 (SECURITY DEFINER)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := new.raw_user_meta_data->>'role';
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when meta_role in ('studio', 'creator', 'admin') then meta_role else 'creator' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 3. custom_access_token_hook — JWT에 user_role 클레임 추가
-- ============================================================================
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb;
  user_role text;
begin
  select role into user_role from public.profiles where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  end if;
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- 인증 서버(supabase_auth_admin)가 훅을 실행/조회할 수 있도록 권한 부여
grant usage  on schema public        to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant select on public.profiles      to supabase_auth_admin;
-- (대시보드 → Authentication → Hooks → "Custom Access Token"에 위 함수를 지정해야 활성화됨)

-- ============================================================================
-- 4. 헬퍼 함수 (SECURITY DEFINER — RLS 우회로 정책 무한루프 방지)
-- ============================================================================
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.get_my_studio_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from public.studios where profile_id = auth.uid() limit 1
$$;

create or replace function public.get_my_creator_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from public.creators where profile_id = auth.uid() limit 1
$$;

-- ============================================================================
-- 5. RLS ENABLE + 정책 (DROP IF EXISTS 후 재생성)
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.studios           enable row level security;
alter table public.creators          enable row level security;
alter table public.creator_channels  enable row level security;
alter table public.campaigns         enable row level security;
alter table public.missions          enable row level security;
alter table public.applications      enable row level security;
alter table public.submissions       enable row level security;
alter table public.settlement_batches enable row level security;
alter table public.payments          enable row level security;

-- ── profiles ───────────────────────────────────────────────────────────────
drop policy if exists profiles_select_own   on public.profiles;
drop policy if exists profiles_update_own   on public.profiles;
drop policy if exists profiles_admin_all    on public.profiles;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);
create policy profiles_admin_all on public.profiles
  for select using (public.get_my_role() = 'admin');

-- ── studios ────────────────────────────────────────────────────────────────
drop policy if exists studios_select on public.studios;
drop policy if exists studios_insert on public.studios;
drop policy if exists studios_update on public.studios;

-- 본인 + 관리자 조회
create policy studios_select on public.studios
  for select using (profile_id = auth.uid() or public.get_my_role() = 'admin');
-- 가입 시 본인 것 insert
create policy studios_insert on public.studios
  for insert with check (profile_id = auth.uid());
-- 본인/관리자 수정
create policy studios_update on public.studios
  for update using (profile_id = auth.uid() or public.get_my_role() = 'admin');

-- ── creators ───────────────────────────────────────────────────────────────
drop policy if exists creators_select on public.creators;
drop policy if exists creators_insert on public.creators;
drop policy if exists creators_update on public.creators;

-- 인증 사용자 전체 조회(이름 표시용) — anon 제외
create policy creators_select on public.creators
  for select to authenticated using (true);
-- 가입 시 본인 것 insert
create policy creators_insert on public.creators
  for insert with check (profile_id = auth.uid());
-- 본인/관리자 수정
create policy creators_update on public.creators
  for update using (profile_id = auth.uid() or public.get_my_role() = 'admin');

-- ── creator_channels ─────────────────────────────────────────────────────────
drop policy if exists channels_select on public.creator_channels;
drop policy if exists channels_insert on public.creator_channels;
drop policy if exists channels_update on public.creator_channels;
drop policy if exists channels_delete on public.creator_channels;

-- 인증 사용자 조회(관리자 디렉터리/크리에이터 매칭에 사용)
create policy channels_select on public.creator_channels
  for select to authenticated using (true);
create policy channels_insert on public.creator_channels
  for insert with check (creator_id = public.get_my_creator_id());
create policy channels_update on public.creator_channels
  for update using (creator_id = public.get_my_creator_id() or public.get_my_role() = 'admin');
create policy channels_delete on public.creator_channels
  for delete using (creator_id = public.get_my_creator_id() or public.get_my_role() = 'admin');

-- ── campaigns ──────────────────────────────────────────────────────────────
drop policy if exists campaigns_select_public on public.campaigns;
drop policy if exists campaigns_select_owner  on public.campaigns;
drop policy if exists campaigns_insert        on public.campaigns;
drop policy if exists campaigns_update        on public.campaigns;

-- 승인(active) 이후 상태는 anon 포함 누구나 조회 — 캠페인 상세 public
create policy campaigns_select_public on public.campaigns
  for select using (
    status in ('active', 'in_progress', 'reviewing', 'completed')
  );
-- 게임사 본인 캠페인은 모든 상태 조회 / 관리자 전체
create policy campaigns_select_owner on public.campaigns
  for select using (
    studio_id = public.get_my_studio_id() or public.get_my_role() = 'admin'
  );
-- 게임사 본인만 생성
create policy campaigns_insert on public.campaigns
  for insert with check (studio_id = public.get_my_studio_id());
-- 게임사 본인 또는 관리자(승인 처리)만 수정
create policy campaigns_update on public.campaigns
  for update using (
    studio_id = public.get_my_studio_id() or public.get_my_role() = 'admin'
  );

-- ── missions ───────────────────────────────────────────────────────────────
drop policy if exists missions_select        on public.missions;
drop policy if exists missions_studio_manage on public.missions;
drop policy if exists missions_creator_fill  on public.missions;

-- 인증 사용자 + anon 조회 (캠페인 상세용)
create policy missions_select on public.missions
  for select using (true);
-- 게임사 본인 캠페인의 미션 insert/update/delete + 관리자
create policy missions_studio_manage on public.missions
  for all using (
    exists (
      select 1 from public.campaigns c
      where c.id = missions.campaign_id
        and (c.studio_id = public.get_my_studio_id() or public.get_my_role() = 'admin')
    )
  );
-- 크리에이터 지원 시 미션 status='filled' 업데이트 허용
create policy missions_creator_fill on public.missions
  for update using (public.get_my_creator_id() is not null);

-- ── applications ─────────────────────────────────────────────────────────────
drop policy if exists applications_select_own    on public.applications;
drop policy if exists applications_insert         on public.applications;
drop policy if exists applications_select_studio  on public.applications;
drop policy if exists applications_admin_all      on public.applications;

-- 본인(크리에이터) 조회
create policy applications_select_own on public.applications
  for select using (creator_id = public.get_my_creator_id());
-- 본인(크리에이터) 지원 생성
create policy applications_insert on public.applications
  for insert with check (creator_id = public.get_my_creator_id());
-- 해당 캠페인 게임사 조회
create policy applications_select_studio on public.applications
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = applications.campaign_id
        and c.studio_id = public.get_my_studio_id()
    )
  );
-- 관리자 전체
create policy applications_admin_all on public.applications
  for all using (public.get_my_role() = 'admin');

-- ── submissions ──────────────────────────────────────────────────────────────
drop policy if exists submissions_select_own on public.submissions;
drop policy if exists submissions_insert     on public.submissions;
drop policy if exists submissions_admin_all  on public.submissions;

-- 본인(크리에이터의 application 경유) 조회
create policy submissions_select_own on public.submissions
  for select using (
    exists (
      select 1 from public.applications a
      where a.id = submissions.application_id
        and a.creator_id = public.get_my_creator_id()
    )
  );
-- 본인(크리에이터) 제출 생성
create policy submissions_insert on public.submissions
  for insert with check (
    exists (
      select 1 from public.applications a
      where a.id = submissions.application_id
        and a.creator_id = public.get_my_creator_id()
    )
  );
-- 관리자 전체 조회·검수(update)
create policy submissions_admin_all on public.submissions
  for all using (public.get_my_role() = 'admin');

-- ── settlement_batches ───────────────────────────────────────────────────────
drop policy if exists batches_select    on public.settlement_batches;
drop policy if exists batches_admin_all  on public.settlement_batches;

create policy batches_select on public.settlement_batches
  for select to authenticated using (true);
create policy batches_admin_all on public.settlement_batches
  for all using (public.get_my_role() = 'admin');

-- ── payments ─────────────────────────────────────────────────────────────────
drop policy if exists payments_select_own on public.payments;
drop policy if exists payments_admin_all  on public.payments;

-- 본인(크리에이터) 조회
create policy payments_select_own on public.payments
  for select using (creator_id = public.get_my_creator_id());
-- 관리자 전체
create policy payments_admin_all on public.payments
  for all using (public.get_my_role() = 'admin');

-- ============================================================================
-- 6. GRANTS (역할별 테이블 권한)
-- ============================================================================
grant usage on schema public to anon, authenticated;

-- anon: 캠페인 상세 public — campaigns / missions 읽기만
grant select on public.campaigns to anon;
grant select on public.missions  to anon;

-- authenticated: 전 테이블 CRUD 권한 부여(실제 접근은 위 RLS가 통제)
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ============================================================================
-- 7. 관리자 계정 만드는 법
-- ============================================================================
-- 1) 일반 회원가입(게임사/크리에이터 아무거나)으로 계정을 만든 뒤,
-- 2) 아래 SQL을 SQL Editor에서 실행해 해당 계정을 관리자로 승격한다.
--
--   UPDATE public.profiles SET role = 'admin' WHERE email = '관리자이메일';
--
-- 3) 승격 후에는 다시 로그인(토큰 갱신)해야 admin 권한이 JWT에 반영된다.
-- ============================================================================
