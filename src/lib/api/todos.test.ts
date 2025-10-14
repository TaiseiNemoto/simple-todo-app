import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getTodos, getTodo, createTodo, updateTodo, deleteTodo } from "./todos";
import type { Todo } from "@/types/todo";
import { ApiError } from "./client";

describe("TODO API関数", () => {
  // fetchのモック
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("getTodos", () => {
    describe("正常系", () => {
      it("パラメータなしでTODO一覧を取得できる", async () => {
        const mockTodos: Todo[] = [
          {
            todoId: "1",
            userId: "user1",
            title: "Test Todo 1",
            description: "",
            status: "open",
            priority: "mid",
            due: null,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
          {
            todoId: "2",
            userId: "user1",
            title: "Test Todo 2",
            description: "Description 2",
            status: "done",
            priority: "high",
            due: new Date("2024-12-31"),
            createdAt: new Date("2024-01-02"),
            updatedAt: new Date("2024-01-02"),
          },
        ];

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTodos),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await getTodos();

        expect(result).toEqual(mockTodos);
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/todos",
          expect.objectContaining({
            method: "GET",
            credentials: "include",
          })
        );
      });

      it("フィルタパラメータ付きでTODO一覧を取得できる", async () => {
        const mockTodos: Todo[] = [
          {
            todoId: "1",
            userId: "user1",
            title: "High Priority Open Todo",
            description: "",
            status: "open",
            priority: "high",
            due: null,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
        ];

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTodos),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await getTodos({
          status: "open",
          priority: "high",
          sortBy: "due",
          sortOrder: "asc",
        });

        expect(result).toEqual(mockTodos);
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/todos?status=open&priority=high&sortBy=due&sortOrder=asc",
          expect.any(Object)
        );
      });

      it("検索クエリ付きでTODO一覧を取得できる", async () => {
        const mockTodos: Todo[] = [];

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTodos),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        await getTodos({ q: "重要なタスク" });

        expect(global.fetch).toHaveBeenCalledWith(
          "/api/todos?q=%E9%87%8D%E8%A6%81%E3%81%AA%E3%82%BF%E3%82%B9%E3%82%AF",
          expect.any(Object)
        );
      });

      it("日付範囲フィルタ付きでTODO一覧を取得できる", async () => {
        const mockTodos: Todo[] = [];

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTodos),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        await getTodos({
          dueFrom: "2024-01-01",
          dueTo: "2024-12-31",
        });

        expect(global.fetch).toHaveBeenCalledWith(
          "/api/todos?dueFrom=2024-01-01&dueTo=2024-12-31",
          expect.any(Object)
        );
      });

      it("空の配列が返却される", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await getTodos();

        expect(result).toEqual([]);
      });
    });

    describe("エラー系", () => {
      it("401エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            json: () =>
              Promise.resolve({
                code: "UNAUTHORIZED",
                message: "認証が必要です",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        await expect(getTodos()).rejects.toThrow(ApiError);

        try {
          await getTodos();
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(401);
          expect(apiError.code).toBe("UNAUTHORIZED");
        }
      });

      it("500エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: () =>
              Promise.resolve({
                code: "INTERNAL_ERROR",
                message: "サーバーエラーが発生しました",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await getTodos();
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(500);
          expect(apiError.code).toBe("INTERNAL_ERROR");
        }
      });

      it("ネットワークエラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.reject(new TypeError("Failed to fetch"))
        );

        try {
          await getTodos();
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.code).toBe("NETWORK_ERROR");
        }
      });
    });
  });

  describe("getTodo", () => {
    describe("正常系", () => {
      it("指定したIDのTODOを取得できる", async () => {
        const mockTodo: Todo = {
          todoId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "user1",
          title: "Test Todo",
          description: "Test Description",
          status: "open",
          priority: "high",
          due: new Date("2024-12-31"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        };

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTodo),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await getTodo("123e4567-e89b-12d3-a456-426614174000");

        expect(result).toEqual(mockTodo);
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/todos/123e4567-e89b-12d3-a456-426614174000",
          expect.objectContaining({
            method: "GET",
            credentials: "include",
          })
        );
      });
    });

    describe("エラー系", () => {
      it("404エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 404,
            statusText: "Not Found",
            json: () =>
              Promise.resolve({
                code: "NOT_FOUND",
                message: "TODOが見つかりません",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await getTodo("nonexistent-id");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(404);
          expect(apiError.code).toBe("NOT_FOUND");
        }
      });

      it("403エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 403,
            statusText: "Forbidden",
            json: () =>
              Promise.resolve({
                code: "FORBIDDEN",
                message: "このTODOにアクセスする権限がありません",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await getTodo("other-user-todo-id");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(403);
          expect(apiError.code).toBe("FORBIDDEN");
        }
      });

      it("401エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            json: () =>
              Promise.resolve({
                code: "UNAUTHORIZED",
                message: "認証が必要です",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await getTodo("some-id");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(401);
        }
      });
    });
  });

  describe("createTodo", () => {
    describe("正常系", () => {
      it("最小限のデータでTODOを新規作成できる", async () => {
        const requestData = {
          title: "New Todo",
        };

        const mockCreatedTodo: Todo = {
          todoId: "new-id",
          userId: "user1",
          title: "New Todo",
          description: "",
          status: "open",
          priority: "mid",
          due: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        };

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 201,
            json: () => Promise.resolve(mockCreatedTodo),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await createTodo(requestData);

        expect(result).toEqual(mockCreatedTodo);
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/todos",
          expect.objectContaining({
            method: "POST",
            credentials: "include",
            body: JSON.stringify(requestData),
          })
        );
      });

      it("全フィールド指定でTODOを新規作成できる", async () => {
        const requestData = {
          title: "Complete Todo",
          description: "Detailed description",
          status: "open" as const,
          priority: "high" as const,
          due: "2024-12-31",
        };

        const mockCreatedTodo: Todo = {
          todoId: "new-id",
          userId: "user1",
          title: "Complete Todo",
          description: "Detailed description",
          status: "open",
          priority: "high",
          due: new Date("2024-12-31"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        };

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 201,
            json: () => Promise.resolve(mockCreatedTodo),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await createTodo(requestData);

        expect(result).toEqual(mockCreatedTodo);
      });
    });

    describe("エラー系", () => {
      it("400エラー（バリデーションエラー）が発生した場合、ApiErrorがthrowされる", async () => {
        const errorDetails = [
          {
            code: "too_small",
            minimum: 1,
            type: "string",
            inclusive: true,
            exact: false,
            message: "タイトルは1文字以上必要です",
            path: ["title"],
          },
        ];

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 400,
            statusText: "Bad Request",
            json: () =>
              Promise.resolve({
                code: "INVALID_BODY",
                message: "無効なリクエストボディです",
                details: errorDetails,
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await createTodo({ title: "" });
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(400);
          expect(apiError.code).toBe("INVALID_BODY");
          expect(apiError.details).toEqual(errorDetails);
        }
      });

      it("401エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            json: () =>
              Promise.resolve({
                code: "UNAUTHORIZED",
                message: "認証が必要です",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await createTodo({ title: "New Todo" });
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(401);
        }
      });

      it("500エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: () =>
              Promise.resolve({
                code: "INTERNAL_ERROR",
                message: "サーバーエラーが発生しました",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await createTodo({ title: "New Todo" });
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(500);
        }
      });
    });
  });

  describe("updateTodo", () => {
    describe("正常系", () => {
      it("TODOのタイトルを更新できる", async () => {
        const updateData = {
          title: "Updated Title",
        };

        const mockUpdatedTodo: Todo = {
          todoId: "test-id",
          userId: "user1",
          title: "Updated Title",
          description: "Original description",
          status: "open",
          priority: "mid",
          due: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        };

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUpdatedTodo),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await updateTodo("test-id", updateData);

        expect(result).toEqual(mockUpdatedTodo);
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/todos/test-id",
          expect.objectContaining({
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify(updateData),
          })
        );
      });

      it("TODOのステータスを更新できる", async () => {
        const updateData = {
          status: "done" as const,
        };

        const mockUpdatedTodo: Todo = {
          todoId: "test-id",
          userId: "user1",
          title: "Test Todo",
          description: "",
          status: "done",
          priority: "mid",
          due: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        };

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUpdatedTodo),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await updateTodo("test-id", updateData);

        expect(result.status).toBe("done");
      });

      it("TODOの複数フィールドを同時に更新できる", async () => {
        const updateData = {
          title: "Updated Title",
          description: "Updated Description",
          priority: "high" as const,
          due: "2024-12-31",
        };

        const mockUpdatedTodo: Todo = {
          todoId: "test-id",
          userId: "user1",
          title: "Updated Title",
          description: "Updated Description",
          status: "open",
          priority: "high",
          due: new Date("2024-12-31"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        };

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUpdatedTodo),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        const result = await updateTodo("test-id", updateData);

        expect(result).toEqual(mockUpdatedTodo);
      });
    });

    describe("エラー系", () => {
      it("404エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 404,
            statusText: "Not Found",
            json: () =>
              Promise.resolve({
                code: "NOT_FOUND",
                message: "TODOが見つかりません",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await updateTodo("nonexistent-id", { title: "Updated" });
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(404);
          expect(apiError.code).toBe("NOT_FOUND");
        }
      });

      it("403エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 403,
            statusText: "Forbidden",
            json: () =>
              Promise.resolve({
                code: "FORBIDDEN",
                message: "このTODOを更新する権限がありません",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await updateTodo("other-user-todo-id", { title: "Updated" });
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(403);
          expect(apiError.code).toBe("FORBIDDEN");
        }
      });

      it("400エラー（バリデーションエラー）が発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 400,
            statusText: "Bad Request",
            json: () =>
              Promise.resolve({
                code: "INVALID_BODY",
                message: "無効なリクエストボディです",
                details: [
                  {
                    message: "タイトルは120文字以内で入力してください",
                    path: ["title"],
                  },
                ],
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await updateTodo("test-id", { title: "a".repeat(121) });
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(400);
          expect(apiError.code).toBe("INVALID_BODY");
        }
      });

      it("401エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            json: () =>
              Promise.resolve({
                code: "UNAUTHORIZED",
                message: "認証が必要です",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await updateTodo("test-id", { title: "Updated" });
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(401);
        }
      });
    });
  });

  describe("deleteTodo", () => {
    describe("正常系", () => {
      it("TODOを削除できる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 204,
            json: () => Promise.resolve(null),
            headers: new Headers(),
          } as Response)
        );

        const result = await deleteTodo("test-id");

        expect(result).toBeNull();
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/todos/test-id",
          expect.objectContaining({
            method: "DELETE",
            credentials: "include",
          })
        );
      });
    });

    describe("エラー系", () => {
      it("404エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 404,
            statusText: "Not Found",
            json: () =>
              Promise.resolve({
                code: "NOT_FOUND",
                message: "TODOが見つかりません",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await deleteTodo("nonexistent-id");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(404);
          expect(apiError.code).toBe("NOT_FOUND");
        }
      });

      it("403エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 403,
            statusText: "Forbidden",
            json: () =>
              Promise.resolve({
                code: "FORBIDDEN",
                message: "このTODOを削除する権限がありません",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await deleteTodo("other-user-todo-id");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(403);
          expect(apiError.code).toBe("FORBIDDEN");
        }
      });

      it("401エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            json: () =>
              Promise.resolve({
                code: "UNAUTHORIZED",
                message: "認証が必要です",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await deleteTodo("test-id");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(401);
        }
      });

      it("500エラーが発生した場合、ApiErrorがthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: () =>
              Promise.resolve({
                code: "INTERNAL_ERROR",
                message: "サーバーエラーが発生しました",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await deleteTodo("test-id");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(500);
        }
      });
    });
  });
});
