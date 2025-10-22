/**
 * TODO一覧取得カスタムフック
 *
 * TODO一覧の取得、ローディング状態、エラー状態を管理
 */

import { useState, useEffect, useCallback } from "react";
import { getTodos } from "@/lib/api/todos";
import type { TodoQueryParams } from "@/lib/api/types";
import type { Todo } from "@/types/todo";

/**
 * useTodosフックの返り値型
 */
export interface UseTodosResult {
  /** TODO一覧データ */
  todos: Todo[];
  /** ローディング中かどうか */
  isLoading: boolean;
  /** エラーオブジェクト（エラーがない場合はnull） */
  error: Error | null;
  /** データを再取得する関数 */
  refetch: () => Promise<void>;
}

/**
 * TODO一覧取得フック
 *
 * @param params - クエリパラメータ（フィルタ・ソート）
 * @returns TODO一覧、ローディング状態、エラー状態、再取得関数
 *
 * @example
 * ```tsx
 * function TodoList() {
 *   const { todos, isLoading, error, refetch } = useTodos({
 *     status: "open",
 *     sortBy: "due",
 *     sortOrder: "asc"
 *   });
 *
 *   if (isLoading) return <div>読み込み中...</div>;
 *   if (error) return <div>エラー: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {todos.map(todo => <TodoItem key={todo.todoId} todo={todo} />)}
 *       <button onClick={refetch}>再読み込み</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTodos(params?: TodoQueryParams): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * TODO一覧を取得する関数
   */
  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTodos(params);
      setTodos(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error("TODO一覧の取得に失敗しました");
      setError(errorMessage);
      setTodos([]); // エラー時は空配列にリセット
    } finally {
      setIsLoading(false);
    }
    // paramsオブジェクトではなく、各プロパティを個別に依存配列に含める
    // これにより、paramsオブジェクトの参照が変わっても、中身が同じなら再実行されない
  }, [
    params?.status,
    params?.priority,
    params?.dueFrom,
    params?.dueTo,
    params?.q,
    params?.sortBy,
    params?.sortOrder,
  ]);

  /**
   * マウント時とparamsが変更されたときに自動取得
   */
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    isLoading,
    error,
    refetch: fetchTodos,
  };
}
