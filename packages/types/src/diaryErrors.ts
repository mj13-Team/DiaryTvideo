import { Language } from "./language";

const i18nMessage = (msg: Record<Language, string>) => JSON.stringify(msg);

export const DiaryErrors = {
  DIARY_TITLE_REQUIRED: i18nMessage({
    en: "Title is required",
    ko: "제목은 필수 항목입니다.",
  }),
  DIARY_CONTENT_REQUIRED: i18nMessage({
    en: "Content is required",
    ko: "내용은 필수 항목입니다.",
  }),
  DIARY_NOT_FOUND: i18nMessage({
    en: "Diary entry not found",
    ko: "일기 항목을 찾을 수 없습니다.",
  }),
  DIARY_OWNERSHIP_MISMATCH: i18nMessage({
    en: "You can only delete your own diary",
    ko: "자신의 일기만 삭제할 수 있습니다.",
  }),
  DIARY_DATE_INVALID: i18nMessage({
    en: "Invalid diary date",
    ko: "유효하지 않은 일기 날짜입니다.",
  }),
  DIARY_RETRY_LIMIT_EXCEEDED: i18nMessage({
    en: "Maximum retry attempts exceeded",
    ko: "최대 재시도 횟수를 초과했습니다.",
  }),
  DIARY_RETRY_NOT_FAILED: i18nMessage({
    en: "Can only retry failed video generation",
    ko: "실패한 영상만 재시도할 수 있습니다.",
  }),
  DIARY_TITLE_TOO_LONG: i18nMessage({
    en: "Title must be 70 characters or less",
    ko: "제목은 70자 이하로 입력해 주세요.",
  }),
  DIARY_CONTENT_TOO_LONG: i18nMessage({
    en: "Content must be 5000 characters or less",
    ko: "내용은 5000자 이하로 입력해 주세요.",
  }),
  DIARY_VIDEO_QUOTA_EXCEEDED: i18nMessage({
    en: "Video conversion quota exceeded. Please upgrade your plan.",
    ko: "영상 변환 횟수를 초과했습니다. 플랜을 업그레이드해 주세요.",
  }),
} as const;

export const DiaryErrorCodes = Object.keys(DiaryErrors).reduce(
  (acc, key) => ({ ...acc, [key]: key }),
  {} as { [K in keyof typeof DiaryErrors]: K },
);
