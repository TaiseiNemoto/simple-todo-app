import { ErrorCode, type ErrorDetails } from "@/types/error";

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
  constructor(message = "認証が必要です", details?: ErrorDetails) {
    super(message, ErrorCode.UNAUTHORIZED, 401, details);
  }
}

/**
 * 403 Forbidden エラー
 * 権限がない場合にスロー
 */
export class ForbiddenError extends AppError {
  constructor(
    message = "このリソースへのアクセス権限がありません",
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
  constructor(message = "リソースが見つかりません", details?: ErrorDetails) {
    super(message, ErrorCode.NOT_FOUND, 404, details);
  }
}

/**
 * 400 Bad Request エラー（バリデーションエラー）
 * 入力値が不正な場合にスロー
 */
export class ValidationError extends AppError {
  constructor(message = "入力値が不正です", details?: ErrorDetails) {
    super(message, ErrorCode.INVALID_INPUT, 400, details);
  }
}

/**
 * 400 Bad Request エラー（パラメータエラー）
 * クエリパラメータが不正な場合にスロー
 */
export class InvalidParameterError extends AppError {
  constructor(message = "クエリパラメータが不正です", details?: ErrorDetails) {
    super(message, ErrorCode.INVALID_PARAMETER, 400, details);
  }
}

/**
 * 400 Bad Request エラー（リクエストボディエラー）
 * リクエストボディが不正な場合にスロー
 */
export class InvalidBodyError extends AppError {
  constructor(message = "リクエストボディが不正です", details?: ErrorDetails) {
    super(message, ErrorCode.INVALID_BODY, 400, details);
  }
}

/**
 * 500 Internal Server Error
 * サーバー内部エラーの場合にスロー
 */
export class InternalError extends AppError {
  constructor(
    message = "サーバー内部エラーが発生しました",
    details?: ErrorDetails
  ) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, details);
  }
}
