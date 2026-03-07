-- Change default for videoConversionEnabled from true to false
ALTER TABLE "diary_entries" ALTER COLUMN "videoConversionEnabled" SET DEFAULT false;

-- Fix existing FREE plan users' entries that never had video generated
-- (video_url IS NULL = 영상이 실제로 생성된 적 없는 항목)
UPDATE "diary_entries"
SET "videoConversionEnabled" = false
FROM "users"
WHERE "diary_entries".user_id = "users".id
  AND "users".plan = 'FREE'
  AND "diary_entries"."video_url" IS NULL;
