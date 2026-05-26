-- ============================================
-- Project Creator — Database Schema
-- Supabase (PostgreSQL)
-- ============================================

-- 0. Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. USERS (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'creator' check (role in ('studio', 'creator', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on signup.
-- Picks up `name` and `role` from `raw_user_meta_data` (set via signUp options.data).
-- `role` is validated against the CHECK constraint on public.profiles.role.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  meta_role text := new.raw_user_meta_data->>'role';
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case
      when meta_role in ('studio', 'creator', 'admin') then meta_role
      else 'creator'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 2. STUDIOS (game company profiles)
-- ============================================
create table public.studios (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text default '',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.studios enable row level security;

create policy "Studio owners can manage their studio"
  on public.studios for all
  using (auth.uid() = user_id);

create policy "Anyone can read studios"
  on public.studios for select
  using (true);

-- ============================================
-- 3. CREATORS (creator profiles)
-- ============================================
create table public.creators (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  handle text not null,
  grade text not null default 'E' check (grade in ('A', 'B', 'C', 'D', 'E')),
  subscribers int not null default 0,
  avg_views int not null default 0,
  rating numeric(2,1) not null default 0.0,
  completed_campaigns int not null default 0,
  is_verified boolean not null default false,
  bio text default '',
  platforms jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creators enable row level security;

create policy "Creator owners can manage their profile"
  on public.creators for all
  using (auth.uid() = user_id);

create policy "Anyone can read creators"
  on public.creators for select
  using (true);

-- ============================================
-- 4. CAMPAIGNS
-- ============================================
create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  genre text default '',
  developer text default '',
  status text not null default 'draft' check (status in ('draft', 'recruiting', 'live', 'completed')),
  total_budget int not null default 0,
  spent_budget int not null default 0,
  target_creators int not null default 10,
  brief text default '',
  hashtags text[] default '{}',
  guidelines jsonb default '{}'::jsonb,
  thumbnail jsonb default '{}'::jsonb,
  platform text[] default '{"mobile"}',
  recruit_start date,
  recruit_end date,
  submit_deadline date,
  payout_days int not null default 7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

-- 모든 캠페인은 누구나 읽을 수 있음 (단가 공개 정책)
create policy "Anyone can read campaigns"
  on public.campaigns for select
  using (true);

-- 캠페인 생성/수정은 해당 studio 소유자만
create policy "Studio owners can manage campaigns"
  on public.campaigns for all
  using (
    exists (
      select 1 from public.studios
      where studios.id = campaigns.studio_id
      and studios.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. MISSIONS (campaign mission types + rates)
-- ============================================
create table public.missions (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  type text not null check (type in ('shortform', 'longform', 'live')),
  enabled boolean not null default true,
  rate_a int not null default 0,
  rate_b int not null default 0,
  rate_c int not null default 0,
  rate_d int not null default 0,
  rate_e int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.missions enable row level security;

create policy "Anyone can read missions"
  on public.missions for select
  using (true);

create policy "Studio owners can manage missions"
  on public.missions for all
  using (
    exists (
      select 1 from public.campaigns
      join public.studios on studios.id = campaigns.studio_id
      where campaigns.id = missions.campaign_id
      and studios.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. APPLICATIONS (creator applies to mission)
-- ============================================
create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  status text not null default 'applied' check (status in ('applied', 'accepted', 'rejected')),
  applied_at timestamptz not null default now(),

  -- 같은 크리에이터가 같은 미션에 중복 지원 방지
  unique(creator_id, mission_id)
);

alter table public.applications enable row level security;

-- 크리에이터 본인 지원 내역
create policy "Creators can read own applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.creators
      where creators.id = applications.creator_id
      and creators.user_id = auth.uid()
    )
  );

-- 크리에이터가 지원 생성
create policy "Creators can apply"
  on public.applications for insert
  with check (
    exists (
      select 1 from public.creators
      where creators.id = applications.creator_id
      and creators.user_id = auth.uid()
    )
  );

-- 게임사가 자기 캠페인에 대한 지원 내역 확인
create policy "Studio owners can read campaign applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.campaigns
      join public.studios on studios.id = campaigns.studio_id
      where campaigns.id = applications.campaign_id
      and studios.user_id = auth.uid()
    )
  );

-- 관리자는 모든 지원 내역 확인 가능
create policy "Admins can read all applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- 7. SUBMISSIONS (content submission + review)
-- ============================================
create table public.submissions (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  content_url text not null,
  status text not null default 'review' check (status in ('making', 'review', 'approved', 'rejected', 'paid')),
  reward int not null default 0,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

alter table public.submissions enable row level security;

-- 크리에이터 본인 제출 내역
create policy "Creators can read own submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.creators
      where creators.id = submissions.creator_id
      and creators.user_id = auth.uid()
    )
  );

-- 크리에이터가 제출 생성
create policy "Creators can submit content"
  on public.submissions for insert
  with check (
    exists (
      select 1 from public.creators
      where creators.id = submissions.creator_id
      and creators.user_id = auth.uid()
    )
  );

-- 게임사가 자기 캠페인 제출물 확인
create policy "Studio owners can read campaign submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.campaigns
      join public.studios on studios.id = campaigns.studio_id
      where campaigns.id = submissions.campaign_id
      and studios.user_id = auth.uid()
    )
  );

-- 관리자가 모든 제출물 확인 + 상태 변경
create policy "Admins can manage all submissions"
  on public.submissions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- 8. PAYMENTS (settlement records)
-- ============================================
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  amount int not null default 0,
  platform_fee int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  paid_at timestamptz
);

alter table public.payments enable row level security;

-- 크리에이터 본인 정산 내역
create policy "Creators can read own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.creators
      where creators.id = payments.creator_id
      and creators.user_id = auth.uid()
    )
  );

-- 관리자 전체 관리
create policy "Admins can manage all payments"
  on public.payments for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- 9. INDEXES (성능)
-- ============================================
create index idx_studios_user on public.studios(user_id);
create index idx_creators_user on public.creators(user_id);
create index idx_creators_grade on public.creators(grade);
create index idx_campaigns_studio on public.campaigns(studio_id);
create index idx_campaigns_status on public.campaigns(status);
create index idx_missions_campaign on public.missions(campaign_id);
create index idx_applications_creator on public.applications(creator_id);
create index idx_applications_campaign on public.applications(campaign_id);
create index idx_submissions_creator on public.submissions(creator_id);
create index idx_submissions_campaign on public.submissions(campaign_id);
create index idx_submissions_status on public.submissions(status);
create index idx_payments_creator on public.payments(creator_id);

-- ============================================
-- 10. updated_at 자동 갱신 트리거
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.studios
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.creators
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.campaigns
  for each row execute function public.update_updated_at();
