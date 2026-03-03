import { z } from "zod";

const PRODUCTION_REQUIRED_KEYS = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "RESEND_API_KEY",
  "FRONTEND_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET",
  "PORTONE_API_SECRET",
  "PORTONE_WEBHOOK_SECRET",
] as const;

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.string().optional(),

    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // Redis
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.string().default("6379"),
    REDIS_PASSWORD: z.string().optional(),

    // JWT
    JWT_ACCESS_SECRET: z.string().optional(),
    JWT_REFRESH_SECRET: z.string().optional(),
    JWT_ACCESS_EXPIRATION: z.string().default("15m"),
    JWT_REFRESH_EXPIRATION: z.string().default("7d"),

    // Email (Resend)
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("noreply@diarytvideo.com"),

    // Frontend
    FRONTEND_URL: z.string().optional(),

    // AWS
    AWS_REGION: z.string().default("ap-northeast-2"),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),

    // PortOne Payment Gateway
    PORTONE_API_SECRET: z.string().optional(),
    PORTONE_WEBHOOK_SECRET: z.string().optional(),

    // Payment Plan Prices
    PLAN_PRO_MONTHLY_PRICE: z.string().default("29000"),
    PLAN_PRO_YEARLY_PRICE: z.string().default("290000"),
    PAYMENT_CURRENCY: z.string().default("KRW"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production") {
      for (const key of PRODUCTION_REQUIRED_KEYS) {
        if (!env[key]) {
          ctx.addIssue({
            code: "custom",
            message: `${key} is required in production`,
            path: [key],
          });
        }
      }
    }
  });

export type Env = z.infer<typeof envSchema>;
