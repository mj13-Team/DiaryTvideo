import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { AuthErrors } from "@repo/types";
import { DiaryErrors } from "@repo/types";
import { UserErrors } from "@repo/types";

const errorCodeMap = new Map<string, string>();

// 추후 에러 메시지가 추가되면 여기에 매핑을 추가해주세요.
for (const [code, msg] of Object.entries(AuthErrors)) {
  errorCodeMap.set(msg, code);
}
for (const [code, msg] of Object.entries(DiaryErrors)) {
  errorCodeMap.set(msg, code);
}
for (const [code, msg] of Object.entries(UserErrors)) {
  errorCodeMap.set(msg, code);
}

@Catch(HttpException)
export class ErrorCodeFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>).message;

    const errorCode =
      typeof message === "string" ? errorCodeMap.get(message) : undefined;

    response.status(status).json({
      statusCode: status,
      message,
      ...(errorCode && { errorCode }),
    });
  }
}
