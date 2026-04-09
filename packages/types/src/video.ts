import { z } from "zod";

// VideoStatus enum
// DB에 사용된 VideoStatus와 동일하게 유지해야 합니다.
export const VideoStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export type VideoStatus = z.infer<typeof VideoStatusSchema>;

// VideoJobData 스키마
export const VideoJobDataSchema = z.object({
  diaryId: z.uuid(),
  userId: z.number(),
  title: z.string(),
  content: z.string(),
  customStyle: z.string().max(200).optional(),
});

// 비디오 진행 상태 메시지 (WebSocket용)
export const VideoProgressMessageSchema = z.object({
  diaryId: z.uuid(),
  status: VideoStatusSchema,
  message: z.string(),
  // COMPLETED 시 URL 전송
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  subtitleUrl: z.string().optional(),
});

// 타입 추출
export type VideoProgressMessage = z.infer<typeof VideoProgressMessageSchema>;
export type VideoJobData = z.infer<typeof VideoJobDataSchema>;
