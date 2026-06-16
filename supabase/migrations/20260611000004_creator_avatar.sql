-- 크리에이터 대표 이미지 / 채널 썸네일 컬럼 추가
ALTER TABLE creators ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE creator_channels ADD COLUMN IF NOT EXISTS thumbnail_url text;
