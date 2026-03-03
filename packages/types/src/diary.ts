import { z } from "zod";
import { DiaryErrors } from "./diaryErrors";

// Diary 요청 스키마
export const CreateDiaryRequestSchema = z.object({
  title: z
    .string()
    .min(1, DiaryErrors.DIARY_TITLE_REQUIRED)
    .max(70, DiaryErrors.DIARY_TITLE_TOO_LONG),
  content: z
    .string()
    .min(1, DiaryErrors.DIARY_CONTENT_REQUIRED)
    .max(5000, DiaryErrors.DIARY_CONTENT_TOO_LONG),
  localDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, DiaryErrors.DIARY_DATE_INVALID),
  enableVideo: z.boolean().optional().default(false),
  videoStyle: z.string().max(200).optional(),
});

export const GetDiaryQuerySchema = z.object({
  filterDate: z.iso.date(),
});

export const GetMonthlyDiaryQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const DeleteDiaryParamsSchema = z.object({
  id: z.uuid(),
});

export const RetryVideoDiaryParamsSchema = z.object({
  id: z.uuid(),
});

// 타입 추출
export type RetryVideoDiaryParams = z.infer<typeof RetryVideoDiaryParamsSchema>;
export type CreateDiaryRequest = z.infer<typeof CreateDiaryRequestSchema>;
export type GetDiaryQueryRequest = z.infer<typeof GetDiaryQuerySchema>;
export type GetMonthlyDiaryQueryRequest = z.infer<
  typeof GetMonthlyDiaryQuerySchema
>;
export type DeleteDiaryParams = z.infer<typeof DeleteDiaryParamsSchema>;
