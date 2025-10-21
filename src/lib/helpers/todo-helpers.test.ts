import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTodoWithOwnershipCheck } from "./todo-helpers";
import { NotFoundError, ForbiddenError } from "@/lib/errors/custom-errors";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import type { Todo } from "@prisma/client";

// Prismaクライアントのモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    todo: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

// Prismaのfindの型をモック関数として扱う
const mockFindUnique = prisma.todo.findUnique as unknown as ReturnType<
  typeof vi.fn<(args: { where: { todoId: string } }) => Promise<Todo | null>>
>;

describe("getTodoWithOwnershipCheck", () => {
  const mockTodo: Todo = {
    todoId: "todo-123",
    userId: "user-123",
    title: "Test TODO",
    description: "Test description",
    status: "open",
    priority: "mid",
    due: null,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("TODOが存在し、所有者が一致する場合、TODOを返す", async () => {
      mockFindUnique.mockResolvedValue(mockTodo);

      const result = await getTodoWithOwnershipCheck("todo-123", "user-123");

      expect(result).toEqual(mockTodo);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { todoId: "todo-123" },
      });
      expect(mockFindUnique).toHaveBeenCalledOnce();
    });
  });

  describe("異常系", () => {
    it("TODOが存在しない場合、NotFoundErrorをスローする", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        getTodoWithOwnershipCheck("nonexistent-id", "user-123")
      ).rejects.toThrow(NotFoundError);

      await expect(
        getTodoWithOwnershipCheck("nonexistent-id", "user-123")
      ).rejects.toThrow(ERROR_MESSAGES.TODO.NOT_FOUND);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { todoId: "nonexistent-id" },
      });
    });

    it("所有者が一致しない場合、ForbiddenErrorをスローする", async () => {
      const otherUserTodo: Todo = {
        ...mockTodo,
        userId: "other-user-456",
      };

      mockFindUnique.mockResolvedValue(otherUserTodo);

      await expect(
        getTodoWithOwnershipCheck("todo-123", "user-123")
      ).rejects.toThrow(ForbiddenError);

      await expect(
        getTodoWithOwnershipCheck("todo-123", "user-123")
      ).rejects.toThrow(ERROR_MESSAGES.TODO.FORBIDDEN);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { todoId: "todo-123" },
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("Prismaエラーが発生した場合、そのまま例外をスローする", async () => {
      const dbError = new Error("Database connection failed");
      mockFindUnique.mockRejectedValue(dbError);

      await expect(
        getTodoWithOwnershipCheck("todo-123", "user-123")
      ).rejects.toThrow("Database connection failed");

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { todoId: "todo-123" },
      });
    });
  });

  describe("エッジケース", () => {
    it("空文字列のtodoIdでも正しく処理する", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(getTodoWithOwnershipCheck("", "user-123")).rejects.toThrow(
        NotFoundError
      );

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { todoId: "" },
      });
    });

    it("空文字列のuserIdでも所有者チェックが正しく動作する", async () => {
      const todoWithEmptyUserId: Todo = {
        ...mockTodo,
        userId: "",
      };

      mockFindUnique.mockResolvedValue(todoWithEmptyUserId);

      await expect(
        getTodoWithOwnershipCheck("todo-123", "user-123")
      ).rejects.toThrow(ForbiddenError);
    });

    it("due日付がnullのTODOを正しく返す", async () => {
      const todoWithNullDue: Todo = {
        ...mockTodo,
        due: null,
      };

      mockFindUnique.mockResolvedValue(todoWithNullDue);

      const result = await getTodoWithOwnershipCheck("todo-123", "user-123");

      expect(result.due).toBeNull();
    });

    it("due日付が設定されているTODOを正しく返す", async () => {
      const dueDate = new Date("2025-12-31T23:59:59Z");
      const todoWithDue: Todo = {
        ...mockTodo,
        due: dueDate,
      };

      mockFindUnique.mockResolvedValue(todoWithDue);

      const result = await getTodoWithOwnershipCheck("todo-123", "user-123");

      expect(result.due).toEqual(dueDate);
    });
  });
});
