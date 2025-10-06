import { NextResponse } from "next/server";
import {
  ApiError,
  ErrorCode,
  ErrorCodeType,
  ErrorDetails,
} from "@/types/error";

/**
 * エラーレスポンスを返すヘルパー関数
 */
export function errorResponse(
  code: ErrorCodeType,
  message: string,
  status: number,
  details?: ErrorDetails
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      code,
      message,
      ...(details !== undefined && { details }),
    },
    { status }
  );
}

/**
 * 401 UNAUTHORIZED エラー
 */
export function unauthorizedError(
  message = "認証が必要です"
): NextResponse<ApiError> {
  return errorResponse(ErrorCode.UNAUTHORIZED, message, 401);
}

/**
 * 403 FORBIDDEN エラー
 */
export function forbiddenError(
  message = "このリソースへのアクセス権限がありません"
): NextResponse<ApiError> {
  return errorResponse(ErrorCode.FORBIDDEN, message, 403);
}

/**
 * 404 NOT_FOUND エラー
 */
export function notFoundError(
  message = "リソースが見つかりません"
): NextResponse<ApiError> {
  return errorResponse(ErrorCode.NOT_FOUND, message, 404);
}

/**
 * 400 BAD_REQUEST エラー（バリデーションエラー）
 */
export function validationError(
  message: string,
  details?: ErrorDetails
): NextResponse<ApiError> {
  return errorResponse(ErrorCode.INVALID_INPUT, message, 400, details);
}

/**
 * 400 BAD_REQUEST エラー（パラメータエラー）
 */
export function invalidParameterError(
  message: string,
  details?: ErrorDetails
): NextResponse<ApiError> {
  return errorResponse(ErrorCode.INVALID_PARAMETER, message, 400, details);
}

/**
 * 400 BAD_REQUEST エラー（リクエストボディエラー）
 */
export function invalidBodyError(
  message: string,
  details?: ErrorDetails
): NextResponse<ApiError> {
  return errorResponse(ErrorCode.INVALID_BODY, message, 400, details);
}

/**
 * 500 INTERNAL_ERROR エラー
 */
export function internalError(
  message = "サーバー内部エラーが発生しました"
): NextResponse<ApiError> {
  return errorResponse(ErrorCode.INTERNAL_ERROR, message, 500);
}
