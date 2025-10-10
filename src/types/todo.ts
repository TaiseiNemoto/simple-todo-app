/**
 * TODO関連の共通型定義
 */

/**
 * 優先度の型定義
 */
export type Priority = "low" | "mid" | "high";

/**
 * ステータスの型定義
 */
export type Status = "open" | "done";

/**
 * TODOアイテムのインターフェース
 */
export interface Todo {
  todoId: string;
  userId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  due: string | null;
  createdAt: string;
  updatedAt: string;
}
