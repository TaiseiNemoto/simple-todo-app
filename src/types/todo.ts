/**
 * TODO関連の共通型定義
 */

import type { TodoStatus, TodoPriority } from "@/lib/validations/todo";

export type Status = TodoStatus;
export type Priority = TodoPriority;

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
