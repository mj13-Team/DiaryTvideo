import { Language } from "./language";

const i18nMessage = (msg: Record<Language, string>) => JSON.stringify(msg);

// 인증 관련 에러 메시지
export const AuthErrors = {
  // 로그인 에러
  INVALID_CREDENTIALS: i18nMessage({
    en: "Invalid email or password",
    ko: "이메일 또는 비밀번호가 잘못되었습니다",
  }),
  EMAIL_NOT_VERIFIED: i18nMessage({
    en: "Please verify your email before logging in",
    ko: "로그인하기 전에 이메일 인증을 완료해주세요",
  }),
  ACCOUNT_LOCKED: i18nMessage({
    en: "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
    ko: "여러 번의 로그인 실패로 계정이 일시적으로 잠겼습니다. 나중에 다시 시도해주세요",
  }),

  // 회원가입 에러
  EMAIL_ALREADY_REGISTERED: i18nMessage({
    en: "Email already registered",
    ko: "이미 등록된 이메일입니다",
  }),

  // 공통 에러
  USER_NOT_FOUND: i18nMessage({
    en: "User not found",
    ko: "사용자를 찾을 수 없습니다",
  }),
  EMAIL_REQUIRED: i18nMessage({
    en: "Email must not be empty",
    ko: "이메일은 필수입니다",
  }),

  // 이메일 인증 에러
  EMAIL_ALREADY_VERIFIED: i18nMessage({
    en: "Email already verified",
    ko: "이미 인증된 이메일입니다",
  }),
  INVALID_VERIFICATION_CODE: i18nMessage({
    en: "Invalid verification code",
    ko: "유효하지 않은 인증 코드입니다",
  }),
  VERIFICATION_CODE_EXPIRED: i18nMessage({
    en: "Verification code has expired",
    ko: "인증 코드가 만료되었습니다",
  }),

  // Validation 에러 (Zod 스키마용)
  INVALID_EMAIL_FORMAT: i18nMessage({
    en: "Invalid email format",
    ko: "유효하지 않은 이메일 형식입니다",
  }),
  NAME_REQUIRED: i18nMessage({
    en: "Name is required",
    ko: "이름은 필수입니다",
  }),
  NAME_TOO_LONG: i18nMessage({
    en: "Name is too long",
    ko: "이름이 너무 깁니다",
  }),
  PASSWORD_MIN_LENGTH: i18nMessage({
    en: "Password must be at least 8 characters",
    ko: "비밀번호는 최소 8자 이상이어야 합니다",
  }),
  PASSWORD_UPPERCASE_REQUIRED: i18nMessage({
    en: "Password must contain at least one uppercase letter",
    ko: "대문자를 최소 1개 포함해야 합니다",
  }),
  PASSWORD_LOWERCASE_REQUIRED: i18nMessage({
    en: "Password must contain at least one lowercase letter",
    ko: "소문자를 최소 1개 포함해야 합니다",
  }),
  PASSWORD_NUMBER_REQUIRED: i18nMessage({
    en: "Password must contain at least one number",
    ko: "숫자를 최소 1개 포함해야 합니다",
  }),

  // Password Reset Errors
  INVALID_RESET_TOKEN: i18nMessage({
    en: "Invalid or expired password reset token",
    ko: "유효하지 않거나 만료된 비밀번호 재설정 토큰입니다",
  }),
  RESET_TOKEN_EXPIRED: i18nMessage({
    en: "Password reset link has expired. Please request a new one.",
    ko: "비밀번호 재설정 링크가 만료되었습니다. 새로운 링크를 요청해주세요.",
  }),
  RESET_TOKEN_ALREADY_USED: i18nMessage({
    en: "This password reset link has already been used.",
    ko: "이미 사용된 비밀번호 재설정 링크입니다.",
  }),

  // 토큰 관련 에러
  ACCESS_TOKEN_EXPIRED: i18nMessage({
    en: "Access token has expired. Please refresh your token.",
    ko: "액세스 토큰이 만료되었습니다. 토큰을 갱신해주세요.",
  }),
  INVALID_TOKEN: i18nMessage({
    en: "Invalid token",
    ko: "유효하지 않은 토큰입니다",
  }),
  TOKEN_REQUIRED: i18nMessage({
    en: "Authentication token is required",
    ko: "인증 토큰이 필요합니다",
  }),
  INVALID_REFRESH_TOKEN: i18nMessage({
    en: "Invalid refresh token",
    ko: "유효하지 않은 리프레시 토큰입니다",
  }),
  REFRESH_TOKEN_EXPIRED: i18nMessage({
    en: "Refresh token has expired. Please login again.",
    ko: "리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.",
  }),
  REFRESH_TOKEN_REQUIRED: i18nMessage({
    en: "Refresh token is required",
    ko: "리프레시 토큰이 필요합니다",
  }),
} as const;

export const AuthErrorCodes = Object.keys(AuthErrors).reduce(
  (acc, key) => ({ ...acc, [key]: key }),
  {} as { [K in keyof typeof AuthErrors]: K },
);
