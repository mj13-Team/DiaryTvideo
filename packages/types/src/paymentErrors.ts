import { Language } from "./language";

const i18nMessage = (msg: Record<Language, string>) => JSON.stringify(msg);

export const PaymentErrors = {
  USER_NOT_FOUND: i18nMessage({
    en: "User not found",
    ko: "사용자를 찾을 수 없습니다",
  }),
  PAYMENT_NOT_COMPLETED: i18nMessage({
    en: "Payment not completed",
    ko: "결제가 완료되지 않았습니다",
  }),
  PAYMENT_RECORD_NOT_FOUND: i18nMessage({
    en: "Payment record not found",
    ko: "결제 기록을 찾을 수 없습니다",
  }),
  PAYMENT_AMOUNT_MISMATCH: i18nMessage({
    en: "Payment amount does not match",
    ko: "결제 금액이 일치하지 않습니다",
  }),
  PAYMENT_ALREADY_PROCESSED: i18nMessage({
    en: "Payment has already been processed",
    ko: "이미 처리된 결제입니다",
  }),
  PG_NOT_CONFIGURED: i18nMessage({
    en: "Payment gateway is not properly configured",
    ko: "결제 게이트웨이 설정이 올바르지 않습니다",
  }),
  SUBSCRIPTION_ALREADY_ACTIVE: i18nMessage({
    en: "You already have an active subscription",
    ko: "이미 활성 구독이 있습니다",
  }),
} as const;

export const PaymentErrorCodes = Object.keys(PaymentErrors).reduce(
  (acc, key) => ({ ...acc, [key]: key }),
  {} as { [K in keyof typeof PaymentErrors]: K },
);
