import { Language } from "@repo/types";

export interface ApiError {
  status: number;
  message: string;
  errorCode?: string;
  errors?: Array<{ path: string[]; message: string }>;
}

/**
 * i18n JSON 문자열에서 언어별 메시지 추출
 * 예: '{"en":"Invalid email","ko":"잘못된 이메일"}' → "잘못된 이메일" (ko)
 */
export function parseI18nMessage(message: string, language: Language): string {
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed[language] || parsed["en"] || message;
    }
    return message;
  } catch {
    return message;
  }
}

/**
 * API 에러 응답 파싱
 */
export async function parseApiError(
  response: Response,
  language: Language = "ko",
): Promise<ApiError> {
  const status = response.status;

  try {
    const body = await response.json();

    // Zod validation 에러 형식
    if (body.errors && Array.isArray(body.errors)) {
      const errors = body.errors.map(
        (err: { path: string[]; message: string }) => ({
          path: err.path,
          message: parseI18nMessage(err.message, language),
        }),
      );
      return {
        status,
        message: errors[0]?.message || "Validation failed",
        errors,
      };
    }

    // 일반 에러 형식 (NestJS HttpException)
    const message = body.message || body.error || "Unknown error";
    return {
      status,
      message: parseI18nMessage(message, language),
      ...(body.errorCode && { errorCode: body.errorCode }),
    };
  } catch {
    return {
      status,
      message: getDefaultErrorMessage(status),
    };
  }
}

function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    429: "Too many requests",
    500: "Server error",
  };

  return messages[status] || messages[500];
}
