import { ErrorCode, type ErrorDetails } from "@/types/error";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

/**
 * カスタムエラーの基底クラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 401 Unauthorized エラー
 * 認証が必要な場合にスロー
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.AUTH.UNAUTHORIZED,
    details?: ErrorDetails
  ) {
    super(message, ErrorCode.UNAUTHORIZED, 401, details);
  }
}

/**
 * 403 Forbidden エラー
 * 権限がない場合にスロー
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.AUTH.FORBIDDEN,
    details?: ErrorDetails
  ) {
    super(message, ErrorCode.FORBIDDEN, 403, details);
  }
}

/**
 * 404 Not Found エラー
 * リソースが見つからない場合にスロー
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.TODO.NOT_FOUND,
    details?: ErrorDetails
  ) {
    super(message, ErrorCode.NOT_FOUND, 404, details);
  }
}

/**
 * 400 Bad Request エラー（バリデーションエラー）
 * 入力値が不正な場合にスロー
 */
export class ValidationError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.VALIDATION.INVALID_INPUT,
    details?: ErrorDetails
  ) {
    super(message, ErrorCode.INVALID_INPUT, 400, details);
  }
}

/**
 * 400 Bad Request エラー（パラメータエラー）
 * クエリパラメータが不正な場合にスロー
 */
export class InvalidParameterError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.VALIDATION.INVALID_PARAMETER,
    details?: ErrorDetails
  ) {
    super(message, ErrorCode.INVALID_PARAMETER, 400, details);
  }
}

/**
 * 400 Bad Request エラー（リクエストボディエラー）
 * リクエストボディが不正な場合にスロー
 */
export class InvalidBodyError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.VALIDATION.INVALID_BODY,
    details?: ErrorDetails
  ) {
    super(message, ErrorCode.INVALID_BODY, 400, details);
  }
}

/**
 * 500 Internal Server Error
 * サーバー内部エラーの場合にスロー
 */
export class InternalError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
    details?: ErrorDetails
  ) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, details);
  }
}
