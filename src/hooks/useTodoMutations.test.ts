/**
 * useTodoMutationsフックのテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTodoMutations } from "./useTodoMutations";
import * as todosApi from "@/lib/api/todos";
import type { Todo } from "@/types/todo";
import type { CreateTodoRequest, UpdateTodoRequest } from "@/lib/api/types";

// APIモジュールをモック化
vi.mock("@/lib/api/todos");

describe("useTodoMutations", () => {
  // モックデータ
  const mockTodo: Todo = {
    todoId: "todo-1",
    userId: "user-1",
    title: "テストTODO",
    description: "説明",
    status: "open",
    priority: "mid",
    due: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };

  const createRequest: CreateTodoRequest = {
    title: "新しいTODO",
    description: "説明",
    status: "open",
    priority: "high",
    due: "2025-12-31",
  };

  const updateRequest: UpdateTodoRequest = {
    title: "更新されたTODO",
    status: "done",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTodo", () => {
    it("TODO新規作成を実行する", async () => {
      vi.mocked(todosApi.createTodo).mockResolvedValue(mockTodo);

      const { result } = renderHook(() => useTodoMutations());

      let createdTodo: Todo | void = undefined;
      await act(async () => {
        createdTodo = await result.current.createTodo(createRequest);
      });

      expect(createdTodo).toEqual(mockTodo);
      expect(todosApi.createTodo).toHaveBeenCalledWith(createRequest);
    });

    it("成功時にonSuccessコールバックが呼ばれる", async () => {
      vi.mocked(todosApi.createTodo).mockResolvedValue(mockTodo);
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest, { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalledWith(mockTodo);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("エラー時にonErrorコールバックが呼ばれる", async () => {
      const error = new Error("作成失敗");
      vi.mocked(todosApi.createTodo).mockRejectedValue(error);
      const onError = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest, { onError });
      });

      expect(onError).toHaveBeenCalledWith(error);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("完了時にonSettledコールバックが呼ばれる（成功時）", async () => {
      vi.mocked(todosApi.createTodo).mockResolvedValue(mockTodo);
      const onSettled = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest, { onSettled });
      });

      expect(onSettled).toHaveBeenCalledTimes(1);
    });

    it("完了時にonSettledコールバックが呼ばれる（失敗時）", async () => {
      vi.mocked(todosApi.createTodo).mockRejectedValue(new Error("失敗"));
      const onSettled = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest, { onSettled });
      });

      expect(onSettled).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateTodo", () => {
    it("TODO更新を実行する", async () => {
      const updatedTodo = { ...mockTodo, ...updateRequest };
      vi.mocked(todosApi.updateTodo).mockResolvedValue(updatedTodo);

      const { result } = renderHook(() => useTodoMutations());

      let updated: Todo | void = undefined;
      await act(async () => {
        updated = await result.current.updateTodo("todo-1", updateRequest);
      });

      expect(updated).toEqual(updatedTodo);
      expect(todosApi.updateTodo).toHaveBeenCalledWith("todo-1", updateRequest);
    });

    it("成功時にonSuccessコールバックが呼ばれる", async () => {
      const updatedTodo = { ...mockTodo, ...updateRequest };
      vi.mocked(todosApi.updateTodo).mockResolvedValue(updatedTodo);
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.updateTodo("todo-1", updateRequest, { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalledWith(updatedTodo);
    });

    it("エラー時にonErrorコールバックが呼ばれる", async () => {
      const error = new Error("更新失敗");
      vi.mocked(todosApi.updateTodo).mockRejectedValue(error);
      const onError = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.updateTodo("todo-1", updateRequest, { onError });
      });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteTodo", () => {
    it("TODO削除を実行する", async () => {
      vi.mocked(todosApi.deleteTodo).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.deleteTodo("todo-1");
      });

      expect(todosApi.deleteTodo).toHaveBeenCalledWith("todo-1");
    });

    it("成功時にonSuccessコールバックが呼ばれる", async () => {
      vi.mocked(todosApi.deleteTodo).mockResolvedValue(undefined);
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.deleteTodo("todo-1", { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalledWith(undefined);
    });

    it("エラー時にonErrorコールバックが呼ばれる", async () => {
      const error = new Error("削除失敗");
      vi.mocked(todosApi.deleteTodo).mockRejectedValue(error);
      const onError = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.deleteTodo("todo-1", { onError });
      });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe("toggleStatus", () => {
    it("open → done に切り替える", async () => {
      const openTodo: Todo = { ...mockTodo, status: "open" };
      const doneTodo: Todo = { ...mockTodo, status: "done" };
      vi.mocked(todosApi.updateTodo).mockResolvedValue(doneTodo);

      const { result } = renderHook(() => useTodoMutations());

      let toggled: Todo | void = undefined;
      await act(async () => {
        toggled = await result.current.toggleStatus(openTodo);
      });

      expect(toggled).toEqual(doneTodo);
      expect(todosApi.updateTodo).toHaveBeenCalledWith("todo-1", {
        status: "done",
      });
    });

    it("done → open に切り替える", async () => {
      const doneTodo: Todo = { ...mockTodo, status: "done" };
      const openTodo: Todo = { ...mockTodo, status: "open" };
      vi.mocked(todosApi.updateTodo).mockResolvedValue(openTodo);

      const { result } = renderHook(() => useTodoMutations());

      let toggled: Todo | void = undefined;
      await act(async () => {
        toggled = await result.current.toggleStatus(doneTodo);
      });

      expect(toggled).toEqual(openTodo);
      expect(todosApi.updateTodo).toHaveBeenCalledWith("todo-1", {
        status: "open",
      });
    });

    it("成功時にonSuccessコールバックが呼ばれる", async () => {
      const openTodo: Todo = { ...mockTodo, status: "open" };
      const doneTodo: Todo = { ...mockTodo, status: "done" };
      vi.mocked(todosApi.updateTodo).mockResolvedValue(doneTodo);
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.toggleStatus(openTodo, { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalledWith(doneTodo);
    });

    it("エラー時にonErrorコールバックが呼ばれる", async () => {
      const openTodo: Todo = { ...mockTodo, status: "open" };
      const error = new Error("切り替え失敗");
      vi.mocked(todosApi.updateTodo).mockRejectedValue(error);
      const onError = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.toggleStatus(openTodo, { onError });
      });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe("mutationState", () => {
    it("初期状態はローディングなし、エラーなし", () => {
      const { result } = renderHook(() => useTodoMutations());

      expect(result.current.mutationState.isLoading).toBe(false);
      expect(result.current.mutationState.error).toBeNull();
    });

    it("処理完了後にisLoadingがfalseになる", async () => {
      vi.mocked(todosApi.createTodo).mockResolvedValue(mockTodo);

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest);
      });

      await waitFor(() => {
        expect(result.current.mutationState.isLoading).toBe(false);
      });
      expect(result.current.mutationState.error).toBeNull();
    });

    it("エラー発生時にerrorが設定される", async () => {
      const error = new Error("エラーメッセージ");
      vi.mocked(todosApi.createTodo).mockRejectedValue(error);

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest);
      });

      await waitFor(() => {
        expect(result.current.mutationState.isLoading).toBe(false);
      });
      expect(result.current.mutationState.error).toEqual(error);
    });

    it("Error以外がthrowされた場合も汎用エラーとして扱う", async () => {
      vi.mocked(todosApi.createTodo).mockRejectedValue("文字列エラー");

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest);
      });

      await waitFor(() => {
        expect(result.current.mutationState.isLoading).toBe(false);
      });
      expect(result.current.mutationState.error).toBeInstanceOf(Error);
      expect(result.current.mutationState.error?.message).toBe(
        "処理に失敗しました"
      );
    });

    it("次の処理開始時にエラーがクリアされる", async () => {
      // 初回は失敗
      vi.mocked(todosApi.createTodo).mockRejectedValue(new Error("失敗"));

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest);
      });

      await waitFor(() => {
        expect(result.current.mutationState.error).toBeInstanceOf(Error);
      });

      // 2回目は成功
      vi.mocked(todosApi.createTodo).mockResolvedValue(mockTodo);

      await act(async () => {
        await result.current.createTodo(createRequest);
      });

      await waitFor(() => {
        expect(result.current.mutationState.error).toBeNull();
      });
    });
  });

  describe("複数の操作関数", () => {
    it("複数の操作が独立して動作する", async () => {
      vi.mocked(todosApi.createTodo).mockResolvedValue(mockTodo);
      vi.mocked(todosApi.deleteTodo).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest);
      });

      expect(todosApi.createTodo).toHaveBeenCalledWith(createRequest);

      await act(async () => {
        await result.current.deleteTodo("todo-1");
      });

      expect(todosApi.deleteTodo).toHaveBeenCalledWith("todo-1");
    });

    it("すべてのコールバックオプションが連携して動作する", async () => {
      vi.mocked(todosApi.createTodo).mockResolvedValue(mockTodo);

      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onSettled = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest, {
          onSuccess,
          onError,
          onSettled,
        });
      });

      expect(onSuccess).toHaveBeenCalledWith(mockTodo);
      expect(onError).not.toHaveBeenCalled();
      expect(onSettled).toHaveBeenCalledTimes(1);
    });

    it("エラー時はonSuccessが呼ばれない", async () => {
      const error = new Error("エラー");
      vi.mocked(todosApi.createTodo).mockRejectedValue(error);

      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onSettled = vi.fn();

      const { result } = renderHook(() => useTodoMutations());

      await act(async () => {
        await result.current.createTodo(createRequest, {
          onSuccess,
          onError,
          onSettled,
        });
      });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(error);
      expect(onSettled).toHaveBeenCalledTimes(1);
    });
  });
});
