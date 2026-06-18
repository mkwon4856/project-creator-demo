-- 공개 크리에이터 프로필(/creators/[id])을 로그인 없이도 열람할 수 있도록
-- creator_channels 에 anon(비로그인) SELECT 정책을 추가한다.
--
-- 배경: 기존 channels_select 는 `to authenticated using (true)` 라서 로그인 사용자만
-- 채널을 볼 수 있었다. creators 테이블은 이미 anon 공개 읽기("Anyone can read creators")이고,
-- 채널 정보(플랫폼/구독자/등급/콘텐츠 타입)는 쇼케이스에 이미 노출되는 비민감 공개 데이터다.
-- 기존 authenticated 정책은 그대로 두고 anon SELECT 정책만 추가한다.
-- DROP POLICY IF EXISTS 로 재실행 안전성 확보.

drop policy if exists channels_select_anon on public.creator_channels;
create policy channels_select_anon on public.creator_channels
  for select to anon using (true);
