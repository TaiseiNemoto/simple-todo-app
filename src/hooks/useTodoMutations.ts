/**
 * TODO操作カスタムフック
 *
 * TODO作成、更新、削除などのミューテーション操作を管理
 */

import { useState } from "react";
import {
  createTodo as apiCreateTodo,
  updateTodo as apiUpdateTodo,
  deleteTodo as apiDeleteTodo,
} from "@/lib/api/todos";
import type { CreateTodoRequest, UpdateTodoRequest } from "@/lib/api/types";
import type { Todo } from "@/types/todo";

/**
 * ミューテーション操作の状態
 */
export interface MutationState {
  /** 処理中かどうか */
  isLoading: boolean;
  /** エラーオブジェクト（エラーがない場合はnull） */
  error: Error | null;
}

/**
 * useTodoMutationsフックの返り値型
 */
export interface UseTodoMutationsResult {
  /** TODO新規作成関数 */
  createTodo: (
    data: CreateTodoRequest,
    options?: MutationOptions<Todo>
  ) => Promise<Todo | void>;
  /** TODO更新関数 */
  updateTodo: (
    id: string,
    data: UpdateTodoRequest,
    options?: MutationOptions<Todo>
  ) => Promise<Todo | void>;
  /** TODO削除関数 */
  deleteTodo: (id: string, options?: MutationOptions<void>) => Promise<void>;
  /** ステータス切替関数 */
  toggleStatus: (
    todo: Todo,
    options?: MutationOptions<Todo>
  ) => Promise<Todo | void>;
  /** ミューテーション操作の状態 */
  mutationState: MutationState;
}

/**
 * ミューテーション操作のオプション
 */
export interface MutationOptions<T> {
  /** 成功時のコールバック */
  onSuccess?: (data: T) => void;
  /** エラー時のコールバック */
  onError?: (error: Error) => void;
  /** 完了時のコールバック（成功・失敗問わず） */
  onSettled?: () => void;
}

/**
 * TODO操作フック
 *
 * @returns TODO操作関数群とミューテーション状態
 *
 * @example
 * ```tsx
 * function TodoForm() {
 *   const { createTodo, mutationState } = useTodoMutations();
 *
 *   const handleSubmit = async (data: CreateTodoRequest) => {
 *     await createTodo(data, {
 *       onSuccess: () => {
 *         alert("TODOを作成しました");
 *       },
 *       onError: (error) => {
 *         alert(`エラー: ${error.message}`);
 *       }
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {mutationState.isLoading && <div>処理中...</div>}
 *       {mutationState.error && <div>エラー: {mutationState.error.message}</div>}
 *     </form>
 *   );
 * }
 * ```
 */
export function useTodoMutations(): UseTodoMutationsResult {
  const [mutationState, setMutationState] = useState<MutationState>({
    isLoading: false,
    error: null,
  });

  /**
   * ミューテーション処理を実行する汎用関数
   */
  const executeMutation = async <T>(
    mutationFn: () => Promise<T>,
    options?: MutationOptions<T>
  ): Promise<T | void> => {
    try {
      setMutationState({ isLoading: true, error: null });
      const result = await mutationFn();
      setMutationState({ isLoading: false, error: null });
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("処理に失敗しました");
      setMutationState({ isLoading: false, error });
      options?.onError?.(error);
    } finally {
      options?.onSettled?.();
    }
  };

  /**
   * TODO新規作成
   */
  const createTodo = async (
    data: CreateTodoRequest,
    options?: MutationOptions<Todo>
  ): Promise<Todo | void> => {
    return executeMutation(() => apiCreateTodo(data), options);
  };

  /**
   * TODO更新
   */
  const updateTodo = async (
    id: string,
    data: UpdateTodoRequest,
    options?: MutationOptions<Todo>
  ): Promise<Todo | void> => {
    return executeMutation(() => apiUpdateTodo(id, data), options);
  };

  /**
   * TODO削除
   */
  const deleteTodo = async (
    id: string,
    options?: MutationOptions<void>
  ): Promise<void> => {
    return executeMutation(() => apiDeleteTodo(id), options);
  };

  /**
   * ステータス切替（open ⇔ done）
   */
  const toggleStatus = async (
    todo: Todo,
    options?: MutationOptions<Todo>
  ): Promise<Todo | void> => {
    const newStatus = todo.status === "open" ? "done" : "open";
    return executeMutation(
      () => apiUpdateTodo(todo.todoId, { status: newStatus }),
      options
    );
  };

  return {
    createTodo,
    updateTodo,
    deleteTodo,
    toggleStatus,
    mutationState,
  };
}
