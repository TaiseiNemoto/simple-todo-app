import { describe, it, expect } from "vitest";
import { buildTodoSearchQuery } from "./query-builder";
import type { TodoQueryInput } from "@/lib/validations/todo";

describe("buildTodoSearchQuery", () => {
  const userId = "user-123";

  describe("基本的なクエリ構築", () => {
    it("最小限のパラメータでクエリを構築できる", () => {
      const params: TodoQueryInput = {
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where, orderBy } = buildTodoSearchQuery(userId, params);

      expect(where).toEqual({ userId });
      expect(orderBy).toEqual({ updatedAt: "desc" });
    });

    it("userIdが正しくwhereに含まれる", () => {
      const params: TodoQueryInput = {
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.userId).toBe(userId);
    });
  });

  describe("ステータスフィルタ", () => {
    it("ステータス指定時にwhere条件に追加される", () => {
      const params: TodoQueryInput = {
        status: "done",
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.status).toBe("done");
    });

    it("ステータス未指定時はwhere条件に含まれない", () => {
      const params: TodoQueryInput = {
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.status).toBeUndefined();
    });
  });

  describe("優先度フィルタ", () => {
    it("優先度指定時にwhere条件に追加される", () => {
      const params: TodoQueryInput = {
        priority: "high",
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.priority).toBe("high");
    });

    it("優先度未指定時はwhere条件に含まれない", () => {
      const params: TodoQueryInput = {
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.priority).toBeUndefined();
    });
  });

  describe("期限範囲フィルタ", () => {
    it("dueFromのみ指定時にgte条件が追加される", () => {
      const dueFrom = new Date("2025-01-01T00:00:00.000Z");
      const params: TodoQueryInput = {
        dueFrom,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.due).toEqual({ gte: dueFrom });
    });

    it("dueToのみ指定時にlte条件が追加される", () => {
      const dueTo = new Date("2025-12-31T23:59:59.999Z");
      const params: TodoQueryInput = {
        dueTo,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.due).toEqual({ lte: dueTo });
    });

    it("dueFromとdueTo両方指定時にgte/lte条件が追加される", () => {
      const dueFrom = new Date("2025-01-01T00:00:00.000Z");
      const dueTo = new Date("2025-12-31T23:59:59.999Z");
      const params: TodoQueryInput = {
        dueFrom,
        dueTo,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.due).toEqual({
        gte: dueFrom,
        lte: dueTo,
      });
    });

    it("期限未指定時はdue条件が含まれない", () => {
      const params: TodoQueryInput = {
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.due).toBeUndefined();
    });
  });

  describe("キーワード検索", () => {
    it("キーワード指定時にOR条件が追加される", () => {
      const params: TodoQueryInput = {
        q: "テスト",
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.OR).toEqual([
        { title: { contains: "テスト" } },
        { description: { contains: "テスト" } },
      ]);
    });

    it("キーワード未指定時はOR条件が含まれない", () => {
      const params: TodoQueryInput = {
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.OR).toBeUndefined();
    });

    it("空文字キーワード指定時はOR条件が含まれない", () => {
      const params: TodoQueryInput = {
        q: undefined,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { where } = buildTodoSearchQuery(userId, params);

      expect(where.OR).toBeUndefined();
    });
  });

  describe("ソート設定", () => {
    it("updatedAtで降順ソートが設定される", () => {
      const params: TodoQueryInput = {
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const { orderBy } = buildTodoSearchQuery(userId, params);

      expect(orderBy).toEqual({ updatedAt: "desc" });
    });

    it("createdAtで昇順ソートが設定される", () => {
      const params: TodoQueryInput = {
        sortBy: "createdAt",
        sortOrder: "asc",
      };

      const { orderBy } = buildTodoSearchQuery(userId, params);

      expect(orderBy).toEqual({ createdAt: "asc" });
    });

    it("dueで降順ソートが設定される", () => {
      const params: TodoQueryInput = {
        sortBy: "due",
        sortOrder: "desc",
      };

      const { orderBy } = buildTodoSearchQuery(userId, params);

      expect(orderBy).toEqual({ due: "desc" });
    });

    it("priorityで昇順ソートが設定される", () => {
      const params: TodoQueryInput = {
        sortBy: "priority",
        sortOrder: "asc",
      };

      const { orderBy } = buildTodoSearchQuery(userId, params);

      expect(orderBy).toEqual({ priority: "asc" });
    });
  });

  describe("複合フィルタ", () => {
    it("すべてのフィルタを同時に指定できる", () => {
      const dueFrom = new Date("2025-01-01T00:00:00.000Z");
      const dueTo = new Date("2025-12-31T23:59:59.999Z");
      const params: TodoQueryInput = {
        status: "open",
        priority: "high",
        dueFrom,
        dueTo,
        q: "重要",
        sortBy: "priority",
        sortOrder: "desc",
      };

      const { where, orderBy } = buildTodoSearchQuery(userId, params);

      expect(where).toEqual({
        userId,
        status: "open",
        priority: "high",
        due: {
          gte: dueFrom,
          lte: dueTo,
        },
        OR: [
          { title: { contains: "重要" } },
          { description: { contains: "重要" } },
        ],
      });
      expect(orderBy).toEqual({ priority: "desc" });
    });

    it("ステータスと優先度のみ指定した複合フィルタ", () => {
      const params: TodoQueryInput = {
        status: "done",
        priority: "low",
        sortBy: "updatedAt",
        sortOrder: "asc",
      };

      const { where, orderBy } = buildTodoSearchQuery(userId, params);

      expect(where).toEqual({
        userId,
        status: "done",
        priority: "low",
      });
      expect(orderBy).toEqual({ updatedAt: "asc" });
    });

    it("期限範囲とキーワードのみ指定した複合フィルタ", () => {
      const dueFrom = new Date("2025-06-01T00:00:00.000Z");
      const params: TodoQueryInput = {
        dueFrom,
        q: "プロジェクト",
        sortBy: "due",
        sortOrder: "asc",
      };

      const { where, orderBy } = buildTodoSearchQuery(userId, params);

      expect(where).toEqual({
        userId,
        due: { gte: dueFrom },
        OR: [
          { title: { contains: "プロジェクト" } },
          { description: { contains: "プロジェクト" } },
        ],
      });
      expect(orderBy).toEqual({ due: "asc" });
    });
  });
});
