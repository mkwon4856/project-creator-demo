-- 캠페인 모집 마감일 컬럼 추가
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deadline date;
