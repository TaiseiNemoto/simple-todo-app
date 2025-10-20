import type { Priority, Status } from "@/types/todo";
import type { ApiError } from "@/types/error";

/**
 * APIレスポンス型定義
 */

/**
 * 成功レスポンスの汎用型
 * @template T - レスポンスデータの型
 */
export type ApiResponse<T> = T;

/**
 * エラーレスポンス型（再エクスポート）
 */
export type { ApiError };

/**
 * APIリクエスト型定義
 */

/**
 * TODO新規作成リクエスト
 */
export interface CreateTodoRequest {
  /** タイトル（1〜120文字、必須） */
  title: string;
  /** 説明（0〜2000文字、省略時は空文字） */
  description?: string;
  /** ステータス（デフォルト: "open"） */
  status?: Status;
  /** 優先度（デフォルト: "mid"） */
  priority?: Priority;
  /** 期限（YYYY-MM-DDまたはISO8601形式） */
  due?: string;
}

/**
 * TODO更新リクエスト（全フィールドオプショナル）
 */
export interface UpdateTodoRequest {
  /** タイトル（1〜120文字） */
  title?: string;
  /** 説明（0〜2000文字） */
  description?: string;
  /** ステータス */
  status?: Status;
  /** 優先度 */
  priority?: Priority;
  /** 期限（YYYY-MM-DDまたはISO8601形式、nullで削除） */
  due?: string | null;
}

/**
 * TODO一覧取得のクエリパラメータ
 */
export interface TodoQueryParams {
  /** ステータスフィルタ */
  status?: Status;
  /** 優先度フィルタ */
  priority?: Priority;
  /** 期限範囲フィルタ（開始日、YYYY-MM-DDまたはISO8601形式） */
  dueFrom?: string;
  /** 期限範囲フィルタ（終了日、YYYY-MM-DDまたはISO8601形式） */
  dueTo?: string;
  /** キーワード検索（titleとdescriptionを対象） */
  q?: string;
  /** ソート対象フィールド（デフォルト: "updatedAt"） */
  sortBy?: "updatedAt" | "createdAt" | "due" | "priority";
  /** ソート順序（デフォルト: "desc"） */
  sortOrder?: "asc" | "desc";
}
