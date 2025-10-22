/**
 * useTodosフックのテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTodos } from "./useTodos";
import * as todosApi from "@/lib/api/todos";
import type { Todo, Status } from "@/types/todo";
import type { TodoQueryParams } from "@/lib/api/types";

// APIモジュールをモック化
vi.mock("@/lib/api/todos");

describe("useTodos", () => {
  // モックデータ
  const mockTodos: Todo[] = [
    {
      todoId: "todo-1",
      userId: "user-1",
      title: "テストTODO 1",
      description: "説明1",
      status: "open",
      priority: "high",
      due: "2025-12-31T00:00:00.000Z",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
    {
      todoId: "todo-2",
      userId: "user-1",
      title: "テストTODO 2",
      description: "説明2",
      status: "done",
      priority: "low",
      due: null,
      createdAt: "2025-01-02T00:00:00.000Z",
      updatedAt: "2025-01-02T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("データ取得", () => {
    it("マウント時にTODO一覧を取得する", async () => {
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      const { result } = renderHook(() => useTodos());

      // 初期状態: ローディング中
      expect(result.current.isLoading).toBe(true);
      expect(result.current.todos).toEqual([]);
      expect(result.current.error).toBeNull();

      // データ取得完了を待つ
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 取得完了後: データが設定される
      expect(result.current.todos).toEqual(mockTodos);
      expect(result.current.error).toBeNull();
      expect(todosApi.getTodos).toHaveBeenCalledTimes(1);
      expect(todosApi.getTodos).toHaveBeenCalledWith(undefined);
    });

    it("クエリパラメータを渡してTODO一覧を取得する", async () => {
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      const params = {
        status: "open" as const,
        priority: "high" as const,
        sortBy: "due" as const,
        sortOrder: "asc" as const,
      };

      const { result } = renderHook(() => useTodos(params));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.todos).toEqual(mockTodos);
      expect(todosApi.getTodos).toHaveBeenCalledWith(params);
    });

    it("paramsが変更されたら再取得する", async () => {
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      const { result, rerender } = renderHook(
        ({ params }) => useTodos(params),
        {
          initialProps: { params: { status: "open" as Status } },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(todosApi.getTodos).toHaveBeenCalledTimes(1);
      expect(todosApi.getTodos).toHaveBeenCalledWith({ status: "open" });

      // paramsを変更
      rerender({ params: { status: "done" as Status } });

      await waitFor(() => {
        expect(todosApi.getTodos).toHaveBeenCalledTimes(2);
      });

      expect(todosApi.getTodos).toHaveBeenNthCalledWith(2, { status: "done" });
    });

    it("paramsオブジェクトの参照が変わっても、中身が同じなら再取得しない", async () => {
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      const initialParams: TodoQueryParams = {
        status: "open",
        priority: "high",
      };

      const { result, rerender } = renderHook(
        ({ params }: { params?: TodoQueryParams }) => useTodos(params),
        {
          initialProps: { params: initialParams },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(todosApi.getTodos).toHaveBeenCalledTimes(1);

      // 同じ値を持つ新しいオブジェクトを渡す
      rerender({ params: { status: "open", priority: "high" } });

      // 少し待ってから確認（不要な再取得が発生しないことを確認）
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 再取得されないことを確認
      expect(todosApi.getTodos).toHaveBeenCalledTimes(1);
    });

    it("params内の一部のプロパティのみ変更されたときは再取得する", async () => {
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      const { result, rerender } = renderHook(
        ({ params }: { params?: TodoQueryParams }) => useTodos(params),
        {
          initialProps: {
            params: { status: "open", priority: "high" } as TodoQueryParams,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(todosApi.getTodos).toHaveBeenCalledTimes(1);
      expect(todosApi.getTodos).toHaveBeenCalledWith({
        status: "open",
        priority: "high",
      });

      // priorityのみ変更（statusは同じ）
      rerender({
        params: { status: "open", priority: "low" } as TodoQueryParams,
      });

      await waitFor(() => {
        expect(todosApi.getTodos).toHaveBeenCalledTimes(2);
      });

      expect(todosApi.getTodos).toHaveBeenNthCalledWith(2, {
        status: "open",
        priority: "low",
      });
    });

    it("refetch()を呼ぶと再取得する", async () => {
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(todosApi.getTodos).toHaveBeenCalledTimes(1);

      // refetchを呼び出す
      await result.current.refetch();

      expect(todosApi.getTodos).toHaveBeenCalledTimes(2);
    });
  });

  describe("ローディング状態", () => {
    it("データ取得中はisLoadingがtrueになる", async () => {
      let resolveGetTodos: (value: Todo[]) => void;
      const getTodosPromise = new Promise<Todo[]>((resolve) => {
        resolveGetTodos = resolve;
      });
      vi.mocked(todosApi.getTodos).mockReturnValue(getTodosPromise);

      const { result } = renderHook(() => useTodos());

      // データ取得中
      expect(result.current.isLoading).toBe(true);
      expect(result.current.todos).toEqual([]);

      // データ取得完了
      resolveGetTodos!(mockTodos);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.todos).toEqual(mockTodos);
    });

    it("refetch中もisLoadingがtrueになる", async () => {
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 2回目の取得を遅延させる
      let resolveSecondFetch: (value: Todo[]) => void;
      const secondFetchPromise = new Promise<Todo[]>((resolve) => {
        resolveSecondFetch = resolve;
      });
      vi.mocked(todosApi.getTodos).mockReturnValue(secondFetchPromise);

      // refetchを呼び出す
      const refetchPromise = result.current.refetch();

      // ローディング中
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // 完了
      resolveSecondFetch!(mockTodos);
      await refetchPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("エラー状態", () => {
    it("取得エラー時にerrorが設定される", async () => {
      const errorMessage = "ネットワークエラー";
      vi.mocked(todosApi.getTodos).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.todos).toEqual([]); // エラー時は空配列
    });

    it("Error以外がthrowされた場合もエラーとして扱う", async () => {
      vi.mocked(todosApi.getTodos).mockRejectedValue("文字列エラー");

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "TODO一覧の取得に失敗しました"
      );
      expect(result.current.todos).toEqual([]);
    });

    it("refetch時のエラーもerrorに設定される", async () => {
      // 初回は成功
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.todos).toEqual(mockTodos);
      expect(result.current.error).toBeNull();

      // 2回目は失敗
      const errorMessage = "サーバーエラー";
      vi.mocked(todosApi.getTodos).mockRejectedValue(new Error(errorMessage));

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });

      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.todos).toEqual([]); // エラー時は空配列にリセット
    });

    it("エラー後の再取得で成功するとerrorがクリアされる", async () => {
      // 初回は失敗
      vi.mocked(todosApi.getTodos).mockRejectedValue(new Error("初回エラー"));

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });

      // 2回目は成功
      vi.mocked(todosApi.getTodos).mockResolvedValue(mockTodos);

      await result.current.refetch();

      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      expect(result.current.todos).toEqual(mockTodos);
    });
  });
});
