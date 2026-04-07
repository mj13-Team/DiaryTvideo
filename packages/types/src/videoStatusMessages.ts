import { Language } from "./language";

const i18nMessage = (msg: Record<Language, string>) => JSON.stringify(msg);

export const VideoStatusMessages = {
  SCENE_ANALYSIS: i18nMessage({
    en: "Analyzing scenes...",
    ko: "장면 분석 중...",
  }),
  AUDIO_IMAGE_GENERATION: i18nMessage({
    en: "Generating audio and images...",
    ko: "음성 및 이미지 생성 중...",
  }),
  AUDIO_ANALYSIS: i18nMessage({
    en: "Analyzing audio...",
    ko: "음성 분석 중...",
  }),
  SUBTITLE_GENERATION: i18nMessage({
    en: "Generating subtitles...",
    ko: "자막 생성 중...",
  }),
  VIDEO_COMPOSING: i18nMessage({
    en: "Composing video...",
    ko: "영상 합성 중...",
  }),
  FILE_UPLOAD: i18nMessage({
    en: "Uploading files...",
    ko: "파일 업로드 중...",
  }),
  COMPLETED: i18nMessage({
    en: "Completed!",
    ko: "완료!",
  }),
  FAILED_START: i18nMessage({
    en: "Failed to start video generation. Please retry.",
    ko: "영상 생성 시작에 실패했습니다. 재시도해 주세요.",
  }),
  FAILED: i18nMessage({
    en: "Video generation failed.",
    ko: "영상 생성에 실패했습니다.",
  }),
  FAILED_AT_SCENE_ANALYSIS: i18nMessage({
    en: "Failed during scene analysis.",
    ko: "장면 분석 중 실패했습니다.",
  }),
  FAILED_AT_AUDIO_IMAGE: i18nMessage({
    en: "Failed during audio/image generation.",
    ko: "음성/이미지 생성 중 실패했습니다.",
  }),
  FAILED_AT_AUDIO_ANALYSIS: i18nMessage({
    en: "Failed during audio analysis.",
    ko: "음성 분석 중 실패했습니다.",
  }),
  FAILED_AT_SUBTITLE: i18nMessage({
    en: "Failed during subtitle generation.",
    ko: "자막 생성 중 실패했습니다.",
  }),
  FAILED_AT_VIDEO_COMPOSING: i18nMessage({
    en: "Failed during video composing.",
    ko: "영상 합성 중 실패했습니다.",
  }),
  FAILED_AT_FILE_UPLOAD: i18nMessage({
    en: "Failed during file upload.",
    ko: "파일 업로드 중 실패했습니다.",
  }),
} as const;
