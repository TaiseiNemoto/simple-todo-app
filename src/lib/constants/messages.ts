/**
 * アプリケーション全体で使用するメッセージ定数
 * i18n対応の基盤となる
 */

/**
 * エラーメッセージ定数
 */
export const ERROR_MESSAGES = {
  // 認証関連
  AUTH: {
    UNAUTHORIZED: "認証が必要です",
    FORBIDDEN: "このリソースへのアクセス権限がありません",
  },

  // TODO関連
  TODO: {
    NOT_FOUND: "TODOが見つかりません",
    FORBIDDEN: "このTODOへのアクセス権限がありません",
  },

  // バリデーション関連
  VALIDATION: {
    INVALID_INPUT: "入力値が不正です",
    INVALID_PARAMETER: "クエリパラメータが不正です",
    INVALID_BODY: "リクエストボディが不正です",
  },

  // サーバーエラー
  SERVER: {
    INTERNAL_ERROR: "サーバー内部エラーが発生しました",
  },
} as const;

/**
 * 成功メッセージ定数（将来的に使用）
 */
export const SUCCESS_MESSAGES = {
  TODO: {
    CREATED: "TODOを作成しました",
    UPDATED: "TODOを更新しました",
    DELETED: "TODOを削除しました",
  },
} as const;
