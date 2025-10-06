/**
 * エラー詳細情報の型
 * バリデーションエラーのフィールド情報などを格納
 */
export type ErrorDetails = Record<string, unknown>;

/**
 * API エラーレスポンスの型定義
 */
export interface ApiError {
  /** エラーコード（定数から選択） */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** 詳細情報（任意、バリデーションエラーの詳細など） */
  details?: ErrorDetails;
}

/**
 * エラーコード定数
 */
export const ErrorCode = {
  /** 認証エラー（未認証） */
  UNAUTHORIZED: "UNAUTHORIZED",
  /** 認可エラー（権限なし） */
  FORBIDDEN: "FORBIDDEN",
  /** リソースが見つからない */
  NOT_FOUND: "NOT_FOUND",
  /** バリデーションエラー（入力値不正） */
  INVALID_INPUT: "INVALID_INPUT",
  /** バリデーションエラー（不正なパラメータ） */
  INVALID_PARAMETER: "INVALID_PARAMETER",
  /** バリデーションエラー（不正なリクエストボディ） */
  INVALID_BODY: "INVALID_BODY",
  /** 内部サーバーエラー */
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/**
 * エラーコードの型
 */
export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
