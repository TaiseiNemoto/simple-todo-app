/**
 * useModalStateフックのテスト
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModalState } from "./useModalState";
import type { Todo } from "@/types/todo";

describe("useModalState", () => {
  // モックデータ
  const mockTodo: Todo = {
    todoId: "todo-1",
    userId: "user-1",
    title: "テストTODO",
    description: "説明",
    status: "open",
    priority: "high",
    due: "2025-12-31T00:00:00.000Z",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };

  describe("初期状態", () => {
    it("初期状態ではモーダルが閉じている", () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.modalState.type).toBeNull();
      expect(result.current.modalState.todo).toBeNull();
    });
  });

  describe("作成モーダル", () => {
    it("openCreateModalを呼ぶと作成モーダルが開く", () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.modalState.type).toBe("create");
      expect(result.current.modalState.todo).toBeNull();
    });

    it("作成モーダルが開いている状態でcloseModalを呼ぶと閉じる", () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.modalState.type).toBe("create");

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.modalState.type).toBeNull();
      expect(result.current.modalState.todo).toBeNull();
    });
  });

  describe("編集モーダル", () => {
    it("openEditModalを呼ぶと編集モーダルが開き、TODOが設定される", () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.openEditModal(mockTodo);
      });

      expect(result.current.modalState.type).toBe("edit");
      expect(result.current.modalState.todo).toEqual(mockTodo);
    });

    it("編集モーダルが開いている状態でcloseModalを呼ぶと閉じる", () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.openEditModal(mockTodo);
      });

      expect(result.current.modalState.type).toBe("edit");

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.modalState.type).toBeNull();
      expect(result.current.modalState.todo).toBeNull();
    });
  });

  describe("削除確認ダイアログ", () => {
    it("openDeleteModalを呼ぶと削除確認ダイアログが開き、TODOが設定される", () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.openDeleteModal(mockTodo);
      });

      expect(result.current.modalState.type).toBe("delete");
      expect(result.current.modalState.todo).toEqual(mockTodo);
    });

    it("削除確認ダイアログが開いている状態でcloseModalを呼ぶと閉じる", () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.openDeleteModal(mockTodo);
      });

      expect(result.current.modalState.type).toBe("delete");

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.modalState.type).toBeNull();
      expect(result.current.modalState.todo).toBeNull();
    });
  });

  describe("モーダル切り替え", () => {
    it("作成モーダルから編集モーダルに切り替わる", () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.modalState.type).toBe("create");

      act(() => {
        result.current.openEditModal(mockTodo);
      });

      expect(result.current.modalState.type).toBe("edit");
      expect(result.current.modalState.todo).toEqual(mockTodo);
    });

    it("編集モーダルから削除確認ダイアログに切り替わる", () => {
      const { result } = renderHook(() => useModalState());

      const todo1: Todo = { ...mockTodo, todoId: "todo-1" };
      const todo2: Todo = { ...mockTodo, todoId: "todo-2" };

      act(() => {
        result.current.openEditModal(todo1);
      });

      expect(result.current.modalState.type).toBe("edit");
      expect(result.current.modalState.todo).toEqual(todo1);

      act(() => {
        result.current.openDeleteModal(todo2);
      });

      expect(result.current.modalState.type).toBe("delete");
      expect(result.current.modalState.todo).toEqual(todo2);
    });

    it("削除確認ダイアログから作成モーダルに切り替わる", () => {
      const { result } = renderHook(() => useModalState());

      act(() => {
        result.current.openDeleteModal(mockTodo);
      });

      expect(result.current.modalState.type).toBe("delete");
      expect(result.current.modalState.todo).toEqual(mockTodo);

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.modalState.type).toBe("create");
      expect(result.current.modalState.todo).toBeNull();
    });
  });

  describe("複数モーダル同時表示の防止", () => {
    it("あるモーダルが開いている状態で別のモーダルを開くと、前のモーダルが閉じる", () => {
      const { result } = renderHook(() => useModalState());

      // 作成モーダルを開く
      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.modalState.type).toBe("create");

      // 編集モーダルを開く（作成モーダルは閉じる）
      act(() => {
        result.current.openEditModal(mockTodo);
      });

      expect(result.current.modalState.type).toBe("edit");
      expect(result.current.modalState.todo).toEqual(mockTodo);

      // 削除確認ダイアログを開く（編集モーダルは閉じる）
      act(() => {
        result.current.openDeleteModal(mockTodo);
      });

      expect(result.current.modalState.type).toBe("delete");
      expect(result.current.modalState.todo).toEqual(mockTodo);
    });
  });
});
