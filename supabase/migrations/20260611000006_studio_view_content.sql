-- 게임사(studio)가 자기 캠페인에 올라온 콘텐츠(submissions)를 열람할 수 있도록 RLS 추가.
-- 경로: submissions → applications → campaigns(studio_id = get_my_studio_id()).
-- 기존 admin/creator 정책은 그대로 두고, 게임사 SELECT 정책만 추가한다.
-- DROP POLICY IF EXISTS로 재실행 안전성 확보.

-- ── applications: 게임사가 자기 캠페인 지원 내역 조회 (카운트/조인용, 재확인) ──
drop policy if exists applications_select_studio on public.applications;
create policy applications_select_studio on public.applications
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = applications.campaign_id
        and c.studio_id = public.get_my_studio_id()
    )
  );

-- ── submissions: 게임사가 자기 캠페인에 제출된 콘텐츠 조회 (신규) ──
drop policy if exists submissions_select_studio on public.submissions;
create policy submissions_select_studio on public.submissions
  for select using (
    exists (
      select 1
      from public.applications a
      join public.campaigns c on c.id = a.campaign_id
      where a.id = submissions.application_id
        and c.studio_id = public.get_my_studio_id()
    )
  );
