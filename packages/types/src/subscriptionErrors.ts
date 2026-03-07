import { Language } from "./language";

const i18nMessage = (msg: Record<Language, string>) => JSON.stringify(msg);

export const SubscriptionErrors = {
  USER_NOT_FOUND: i18nMessage({
    en: "User not found",
    ko: "사용자를 찾을 수 없습니다",
  }),
  NO_ACTIVE_SUBSCRIPTION: i18nMessage({
    en: "No active subscription to cancel",
    ko: "취소할 활성 구독이 없습니다",
  }),
  SUBSCRIPTION_ALREADY_CANCELLED: i18nMessage({
    en: "Subscription already cancelled",
    ko: "이미 취소된 구독입니다",
  }),
} as const;

export const SubscriptionErrorCodes = Object.keys(SubscriptionErrors).reduce(
  (acc, key) => ({ ...acc, [key]: key }),
  {} as { [K in keyof typeof SubscriptionErrors]: K },
);
