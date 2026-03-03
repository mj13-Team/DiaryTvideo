import { z } from "zod";
import { EmailSchema, NameSchema } from "./common";

// API 응답 스키마
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema.optional(),
    message: z.string().optional(),
  });

// API 응답 타입
export type ApiResponse<T = void> = T extends void
  ? { success: true; message?: string }
  : { success: true; data: T; message?: string };

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// 인증된 사용자 정보
export const AuthUserSchema = z.object({
  id: z.number(),
  email: EmailSchema,
  name: NameSchema,
  emailVerified: z.boolean(),
});

// verify-email, signin 응답
export const AuthDataSchema = z.object({
  user: AuthUserSchema,
  tokens: AuthTokensSchema,
});

// refresh 응답
export const RefreshDataSchema = z.object({
  accessToken: z.string(),
});

// verify-reset-token 응답
export const ResetTokenDataSchema = z.object({
  valid: z.boolean(),
  email: z.string(),
});

export const UserDataSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastSuccessfulLogin: z.date().nullable(),
});

export const DiaryDataSchema = z.object({
  id: z.uuid(),
  userId: z.number(),
  title: z.string(),
  content: z.string(),
  localDate: z.string(),
  videoUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  subtitleUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  videoConversionEnabled: z.boolean(),
  videoStatus: z.string(),
  videoError: z.string().nullable(),
  videoMessage: z.string().nullable().optional(),
  videoRetryCount: z.number().int().min(0).default(0),
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthData = z.infer<typeof AuthDataSchema>;
export type RefreshData = z.infer<typeof RefreshDataSchema>;
export type ResetTokenData = z.infer<typeof ResetTokenDataSchema>;
export type UserData = z.infer<typeof UserDataSchema>;
export type DiaryData = z.infer<typeof DiaryDataSchema>;
