/**
 * TODO API関数
 *
 * バックエンドAPIとの通信を抽象化
 */

import { apiClient } from "./client";
import type {
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoQueryParams,
} from "./types";
import type { Todo } from "@/types/todo";

/**
 * TODO一覧を取得
 *
 * @param params - クエリパラメータ（フィルタ・ソート）
 * @returns TODO一覧
 *
 * @example
 * ```ts
 * // 全TODO取得
 * const todos = await getTodos();
 *
 * // フィルタ・ソート付き取得
 * const todos = await getTodos({
 *   status: "open",
 *   priority: "high",
 *   sortBy: "due",
 *   sortOrder: "asc"
 * });
 * ```
 */
export async function getTodos(params?: TodoQueryParams): Promise<Todo[]> {
  return apiClient<Todo[]>("/api/todos", {
    method: "GET",
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * 単一のTODOを取得
 *
 * @param id - TODO ID
 * @returns TODO
 *
 * @example
 * ```ts
 * const todo = await getTodo("123e4567-e89b-12d3-a456-426614174000");
 * ```
 */
export async function getTodo(id: string): Promise<Todo> {
  return apiClient<Todo>(`/api/todos/${id}`, {
    method: "GET",
  });
}

/**
 * TODOを新規作成
 *
 * @param data - 作成データ
 * @returns 作成されたTODO
 *
 * @example
 * ```ts
 * const newTodo = await createTodo({
 *   title: "新しいタスク",
 *   description: "詳細説明",
 *   priority: "high",
 *   due: "2024-12-31"
 * });
 * ```
 */
export async function createTodo(data: CreateTodoRequest): Promise<Todo> {
  return apiClient<Todo>("/api/todos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * TODOを更新
 *
 * @param id - TODO ID
 * @param data - 更新データ（部分更新）
 * @returns 更新されたTODO
 *
 * @example
 * ```ts
 * const updatedTodo = await updateTodo("123e4567-e89b-12d3-a456-426614174000", {
 *   title: "更新されたタイトル",
 *   status: "done"
 * });
 * ```
 */
export async function updateTodo(
  id: string,
  data: UpdateTodoRequest
): Promise<Todo> {
  return apiClient<Todo>(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * TODOを削除
 *
 * @param id - TODO ID
 *
 * @example
 * ```ts
 * await deleteTodo("123e4567-e89b-12d3-a456-426614174000");
 * ```
 */
export async function deleteTodo(id: string): Promise<void> {
  return apiClient<void>(`/api/todos/${id}`, {
    method: "DELETE",
  });
}
