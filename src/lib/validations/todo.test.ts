import { describe, it, expect } from "vitest";
import { createTodoSchema, updateTodoSchema, todoQuerySchema } from "./todo";

describe("createTodoSchema", () => {
  describe("正常系", () => {
    it("必須項目のみで作成できる", () => {
      const input = {
        title: "テストTODO",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBe("テストTODO");
        expect(result.data.description).toBe("");
        expect(result.data.status).toBe("open");
        expect(result.data.priority).toBe("mid");
        expect(result.data.due).toBeUndefined();
      }
    });

    it("全項目を指定して作成できる", () => {
      const input = {
        title: "完全なTODO",
        description: "詳細説明",
        status: "done" as const,
        priority: "high" as const,
        due: "2025-12-31",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBe("完全なTODO");
        expect(result.data.description).toBe("詳細説明");
        expect(result.data.status).toBe("done");
        expect(result.data.priority).toBe("high");
        expect(result.data.due).toEqual(new Date("2025-12-31T00:00:00.000Z"));
      }
    });

    it("YYYY-MM-DD形式の日付をUTC 00:00に正規化できる", () => {
      const input = {
        title: "日付テスト",
        due: "2025-06-15",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.due).toEqual(new Date("2025-06-15T00:00:00.000Z"));
      }
    });

    it("ISO8601形式の日付を受け入れる", () => {
      const input = {
        title: "ISO日付テスト",
        due: "2025-06-15T12:30:00.000Z",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.due).toEqual(new Date("2025-06-15T12:30:00.000Z"));
      }
    });

    it("120文字のタイトルを受け入れる", () => {
      const input = {
        title: "a".repeat(120),
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("descriptionが空文字の場合も受け入れる", () => {
      const input = {
        title: "テストTODO",
        description: "",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.description).toBe("");
      }
    });
  });

  describe("異常系", () => {
    it("タイトルが空文字の場合エラー", () => {
      const input = {
        title: "",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("タイトルは必須です");
      }
    });

    it("タイトルが121文字以上の場合エラー", () => {
      const input = {
        title: "a".repeat(121),
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "タイトルは120文字以内で入力してください"
        );
      }
    });

    it("タイトルが未指定の場合エラー", () => {
      const input = {};

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("statusが不正な値の場合エラー", () => {
      const input = {
        title: "テストTODO",
        status: "invalid",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("priorityが不正な値の場合エラー", () => {
      const input = {
        title: "テストTODO",
        priority: "urgent",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("dueが不正な日付形式の場合エラー", () => {
      const input = {
        title: "テストTODO",
        due: "2025/12/31",
      };

      const result = createTodoSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

describe("updateTodoSchema", () => {
  describe("正常系", () => {
    it("空オブジェクトを受け入れる（全フィールドオプショナル）", () => {
      const input = {};

      const result = updateTodoSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("一部のフィールドのみ更新できる", () => {
      const input = {
        title: "更新されたタイトル",
      };

      const result = updateTodoSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBe("更新されたタイトル");
      }
    });

    it("dueをnullに設定できる", () => {
      const input = {
        due: null,
      };

      const result = updateTodoSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.due).toBeNull();
      }
    });

    it("全フィールドを更新できる", () => {
      const input = {
        title: "完全更新",
        description: "新しい説明",
        status: "done" as const,
        priority: "low" as const,
        due: "2025-12-31",
      };

      const result = updateTodoSchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBe("完全更新");
        expect(result.data.description).toBe("新しい説明");
        expect(result.data.status).toBe("done");
        expect(result.data.priority).toBe("low");
        expect(result.data.due).toEqual(new Date("2025-12-31T00:00:00.000Z"));
      }
    });
  });

  describe("異常系", () => {
    it("タイトルが空文字の場合エラー", () => {
      const input = {
        title: "",
      };

      const result = updateTodoSchema.safeParse(input);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("タイトルは必須です");
      }
    });

    it("タイトルが121文字以上の場合エラー", () => {
      const input = {
        title: "a".repeat(121),
      };

      const result = updateTodoSchema.safeParse(input);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "タイトルは120文字以内で入力してください"
        );
      }
    });

    it("statusが不正な値の場合エラー", () => {
      const input = {
        status: "invalid",
      };

      const result = updateTodoSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("priorityが不正な値の場合エラー", () => {
      const input = {
        priority: "critical",
      };

      const result = updateTodoSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

describe("todoQuerySchema", () => {
  describe("正常系", () => {
    it("空オブジェクトを受け入れ、デフォルト値が設定される", () => {
      const input = {};

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.sortBy).toBe("updatedAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("statusフィルタを設定できる", () => {
      const input = {
        status: "open" as const,
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.status).toBe("open");
      }
    });

    it("priorityフィルタを設定できる", () => {
      const input = {
        priority: "high" as const,
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.priority).toBe("high");
      }
    });

    it("dueFrom/dueToで日付範囲を設定できる", () => {
      const input = {
        dueFrom: "2025-01-01",
        dueTo: "2025-12-31",
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.dueFrom).toEqual(
          new Date("2025-01-01T00:00:00.000Z")
        );
        expect(result.data.dueTo).toEqual(new Date("2025-12-31T23:59:59.999Z"));
      }
    });

    it("キーワード検索を設定できる", () => {
      const input = {
        q: "検索キーワード",
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.q).toBe("検索キーワード");
      }
    });

    it("sortByとsortOrderを設定できる", () => {
      const input = {
        sortBy: "due" as const,
        sortOrder: "asc" as const,
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.sortBy).toBe("due");
        expect(result.data.sortOrder).toBe("asc");
      }
    });

    it("全パラメータを設定できる", () => {
      const input = {
        status: "done" as const,
        priority: "low" as const,
        dueFrom: "2025-01-01",
        dueTo: "2025-12-31",
        q: "テスト",
        sortBy: "priority" as const,
        sortOrder: "asc" as const,
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.status).toBe("done");
        expect(result.data.priority).toBe("low");
        expect(result.data.dueFrom).toEqual(
          new Date("2025-01-01T00:00:00.000Z")
        );
        expect(result.data.dueTo).toEqual(new Date("2025-12-31T23:59:59.999Z"));
        expect(result.data.q).toBe("テスト");
        expect(result.data.sortBy).toBe("priority");
        expect(result.data.sortOrder).toBe("asc");
      }
    });
  });

  describe("異常系", () => {
    it("statusが不正な値の場合エラー", () => {
      const input = {
        status: "invalid",
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("priorityが不正な値の場合エラー", () => {
      const input = {
        priority: "urgent",
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("dueFromが不正な日付形式の場合エラー", () => {
      const input = {
        dueFrom: "2025/01/01",
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("dueToが不正な日付形式の場合エラー", () => {
      const input = {
        dueTo: "invalid-date",
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("sortByが不正な値の場合エラー", () => {
      const input = {
        sortBy: "title",
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("sortOrderが不正な値の場合エラー", () => {
      const input = {
        sortOrder: "ascending",
      };

      const result = todoQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
