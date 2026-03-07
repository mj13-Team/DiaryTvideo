import { envSchema } from "./env.validation";

export default () => {
  const env = envSchema.parse(process.env);

  const isDevelopment = env.NODE_ENV === "development";
  const isProduction = env.NODE_ENV === "production";

  return {
    nodeEnv: env.NODE_ENV,
    isDevelopment,
    isProduction,
    port: parseInt(env.PORT || "3001", 10) || (isDevelopment ? 3001 : 4000),
    database: {
      url: env.DATABASE_URL,
    },
    redis: {
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT, 10) || 6379,
      password: env.REDIS_PASSWORD || "dev_redis_password",
    },
    jwt: {
      accessSecret:
        env.JWT_ACCESS_SECRET ||
        (isDevelopment ? "dev_access_secret" : undefined),
      refreshSecret:
        env.JWT_REFRESH_SECRET ||
        (isDevelopment ? "dev_refresh_secret" : undefined),
      accessExpiration: env.JWT_ACCESS_EXPIRATION,
      refreshExpiration: env.JWT_REFRESH_EXPIRATION,
    },
    email: {
      resendApiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
    },
    frontend: {
      url:
        env.FRONTEND_URL ||
        (isDevelopment ? "http://localhost:3000" : "https://diarytvideo.com"),
    },
    aws: {
      region: env.AWS_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      s3Bucket: env.AWS_S3_BUCKET,
    },
    payment: {
      enabled: env.PAYMENT_ENABLED === "true",
      proMonthlyPrice: parseInt(env.PLAN_PRO_MONTHLY_PRICE, 10),
      proYearlyPrice: parseInt(env.PLAN_PRO_YEARLY_PRICE, 10),
      currency: env.PAYMENT_CURRENCY,
    },
  };
};
