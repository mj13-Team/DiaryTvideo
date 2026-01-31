import { Language } from "./language";

const i18nMessage = (msg: Record<Language, string>) => JSON.stringify(msg);

export const UserErrors = {
  INCORRECT_PASSWORD: i18nMessage({
    en: "Current password is incorrect",
    ko: "현재 비밀번호가 올바르지 않습니다",
  }),
  SAME_PASSWORD: i18nMessage({
    en: "New password must be different from current password",
    ko: "새 비밀번호는 현재 비밀번호와 달라야 합니다",
  }),
  USER_NOT_FOUND: i18nMessage({
    en: "User not found",
    ko: "사용자를 찾을 수 없습니다",
  }),
  ACCOUNT_ALREADY_DELETED: i18nMessage({
    en: "Account is already deleted",
    ko: "이미 탈퇴한 계정입니다",
  }),
  NAME_UNCHANGED: i18nMessage({
    en: "New name is the same as current name",
    ko: "새 이름이 현재 이름과 동일합니다",
  }),
  CURRENT_PASSWORD_REQUIRED: i18nMessage({
    en: "Current password is required",
    ko: "현재 비밀번호는 필수입니다",
  }),
  PASSWORD_REQUIRED_FOR_DELETION: i18nMessage({
    en: "Password is required for account deletion",
    ko: "계정 탈퇴를 위해서는 비밀번호가 필요합니다",
  }),
} as const;

export const UserErrorCodes = Object.keys(UserErrors).reduce(
  (acc, key) => ({ ...acc, [key]: key }),
  {} as { [K in keyof typeof UserErrors]: K },
);
