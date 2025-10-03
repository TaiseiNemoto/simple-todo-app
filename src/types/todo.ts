/**
 * TODO関連の共通型定義
 */

/**
 * 優先度の型定義
 */
export type Priority = "low" | "medium" | "high";

/**
 * ステータスの型定義
 */
export type Status = "incomplete" | "complete";

/**
 * TODOアイテムのインターフェース
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  status: Status;
}
