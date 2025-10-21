import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  InvalidParameterError,
  InvalidBodyError,
} from "@/lib/errors/custom-errors";
import {
  unauthorizedError,
  forbiddenError,
  notFoundError,
  invalidParameterError,
  invalidBodyError,
  internalError,
} from "@/lib/errors";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

/**
 * APIルートハンドラーのエラーハンドリングラッパー
 *
 * 全てのAPIエンドポイントで共通のエラーハンドリングロジックを提供します。
 * カスタムエラークラスを適切なHTTPステータスコードとレスポンスに変換します。
 *
 * @param handler - ラップするAPIルートハンドラー関数
 * @returns エラーハンドリング機能が追加されたルートハンドラー
 *
 * @example
 * ```typescript
 * export const GET = withErrorHandling(async (request: NextRequest) => {
 *   const session = await requireAuth();
 *   const data = await fetchData(session.user.id);
 *   return NextResponse.json(data);
 * });
 * ```
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // 認証エラー (401)
      if (error instanceof UnauthorizedError) {
        return unauthorizedError(error.message);
      }

      // 権限エラー (403)
      if (error instanceof ForbiddenError) {
        return forbiddenError(error.message);
      }

      // リソース未検出 (404)
      if (error instanceof NotFoundError) {
        return notFoundError(error.message);
      }

      // バリデーションエラー (400)
      if (error instanceof ValidationError) {
        return invalidBodyError(error.message, error.details);
      }

      // パラメータエラー (400)
      if (error instanceof InvalidParameterError) {
        return invalidParameterError(error.message, error.details);
      }

      // ボディエラー (400)
      if (error instanceof InvalidBodyError) {
        return invalidBodyError(error.message, error.details);
      }

      // Zodバリデーションエラー (400)
      if (error instanceof ZodError) {
        // エラーが発生したコンテキストに応じてメッセージを判定
        // クエリパラメータのエラーかリクエストボディのエラーかは呼び出し元で判断
        const firstError = error.issues[0];
        if (firstError && firstError.path[0]) {
          // パラメータエラーとして扱う
          return invalidParameterError(
            ERROR_MESSAGES.VALIDATION.INVALID_PARAMETER,
            { issues: error.issues }
          );
        }
        // デフォルトはボディエラーとして扱う
        return invalidBodyError(ERROR_MESSAGES.VALIDATION.INVALID_BODY, {
          issues: error.issues,
        });
      }

      // その他の予期しないエラー (500)
      console.error("Unhandled error in API route:", error);
      return internalError();
    }
  };
}

/**
 * Zodエラーをクエリパラメータエラーとして扱うラッパー
 *
 * クエリパラメータのバリデーションに特化したエラーハンドリングを提供します。
 *
 * @param handler - ラップするAPIルートハンドラー関数
 * @returns エラーハンドリング機能が追加されたルートハンドラー
 *
 * @example
 * ```typescript
 * export const GET = withQueryValidation(async (request: NextRequest) => {
 *   const params = parseQueryParams(request.nextUrl.searchParams);
 *   const validatedParams = querySchema.parse(params); // ZodErrorは自動的にクエリエラーとして処理
 *   return NextResponse.json(data);
 * });
 * ```
 */
export function withQueryValidation<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // 認証エラー (401)
      if (error instanceof UnauthorizedError) {
        return unauthorizedError(error.message);
      }

      // 権限エラー (403)
      if (error instanceof ForbiddenError) {
        return forbiddenError(error.message);
      }

      // リソース未検出 (404)
      if (error instanceof NotFoundError) {
        return notFoundError(error.message);
      }

      // Zodバリデーションエラー (400) - クエリパラメータエラーとして扱う
      if (error instanceof ZodError) {
        return invalidParameterError(
          ERROR_MESSAGES.VALIDATION.INVALID_PARAMETER,
          { issues: error.issues }
        );
      }

      // その他の予期しないエラー (500)
      console.error("Unhandled error in API route:", error);
      return internalError();
    }
  };
}

/**
 * Zodエラーをリクエストボディエラーとして扱うラッパー
 *
 * リクエストボディのバリデーションに特化したエラーハンドリングを提供します。
 *
 * @param handler - ラップするAPIルートハンドラー関数
 * @returns エラーハンドリング機能が追加されたルートハンドラー
 *
 * @example
 * ```typescript
 * export const POST = withBodyValidation(async (request: NextRequest) => {
 *   const body = await request.json();
 *   const validatedData = createSchema.parse(body); // ZodErrorは自動的にボディエラーとして処理
 *   return NextResponse.json(createdData);
 * });
 * ```
 */
export function withBodyValidation<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // 認証エラー (401)
      if (error instanceof UnauthorizedError) {
        return unauthorizedError(error.message);
      }

      // 権限エラー (403)
      if (error instanceof ForbiddenError) {
        return forbiddenError(error.message);
      }

      // リソース未検出 (404)
      if (error instanceof NotFoundError) {
        return notFoundError(error.message);
      }

      // バリデーションエラー (400)
      if (error instanceof ValidationError) {
        return invalidBodyError(error.message, error.details);
      }

      // パラメータエラー (400)
      if (error instanceof InvalidParameterError) {
        return invalidParameterError(error.message, error.details);
      }

      // ボディエラー (400)
      if (error instanceof InvalidBodyError) {
        return invalidBodyError(error.message, error.details);
      }

      // Zodバリデーションエラー (400) - リクエストボディエラーとして扱う
      if (error instanceof ZodError) {
        return invalidBodyError(ERROR_MESSAGES.VALIDATION.INVALID_BODY, {
          issues: error.issues,
        });
      }

      // その他の予期しないエラー (500)
      console.error("Unhandled error in API route:", error);
      return internalError();
    }
  };
}
